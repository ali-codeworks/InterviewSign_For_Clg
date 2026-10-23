import { evaluateAnswers, EvaluationResult } from "@/lib/evaluate";
import { pickQuestions } from "@/lib/pickQuestions";
import { speakQuestion, stopSpeaking } from "@/lib/speech";
import { supabase } from "@/lib/supabase";
import { transcribeAudio } from "@/lib/transcribe";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnswerOptions, { AnswerMode } from "./AnswerOptions";
import AudioAnswer from "./AudioAnswer";
import CompletionModal from "./CompletionModal";
import FeedbackCard from "./FeedbackCard";
import RecordAnswer from "./RecordAnswer";
import TextAnswer from "./TextAnswer";
import { AnswerEntry } from "./types";

type Props = {
  roundId: string;
  roundTitle: string;
  optionId: string;
  optionTitle: string;
  topics: string[];
  total: number;
  accent: string;
  accentBg: string;
  onExit: () => void;
  onRestart: () => void;
};

type Phase = "answering" | "evaluating" | "feedback";

type Feedback = {
  text: string;
  transcript?: string;
  result?: EvaluationResult;
};

const NEXT_QUESTION_DELAY_MS = 2000;
const FEEDBACK_SPEECH_TIMEOUT_MS = 20000;
const VIDEO_NOT_SUPPORTED_TEXT =
  "Video answers cannot be evaluated yet. Please use audio or text to get AI feedback.";

const readError = async (error: unknown) => {
  const context = (error as { context?: Response }).context;
  if (context && typeof context.text === "function") {
    try {
      return await context.text();
    } catch {
      return String(error);
    }
  }
  return error instanceof Error ? error.message : String(error);
};

export default function InterviewSession({
  roundId,
  roundTitle,
  optionId,
  optionTitle,
  topics,
  total,
  accent,
  accentBg,
  onExit,
  onRestart,
}: Props) {
  const [list] = useState(() =>
    pickQuestions(roundId, optionId, topics, total),
  );
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<AnswerMode>("text");
  const [answered, setAnswered] = useState(false);
  const [answerValue, setAnswerValue] = useState("");
  const [entries, setEntries] = useState<AnswerEntry[]>([]);
  const [phase, setPhase] = useState<Phase>("answering");
  const [loadingLabel, setLoadingLabel] = useState("Evaluating your answer...");
  const [notice, setNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [finished, setFinished] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const savedRef = useRef(false);

  const current = list[index];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    return () => {
      clearTimers();
      stopSpeaking();
    };
  }, []);

  const speak = (text: string) => {
    setSpeaking(true);
    speakQuestion(text, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  useEffect(() => {
    if (!current || finished) return;
    speak(current.question);
    return () => {
      stopSpeaking();
    };
  }, [index, finished]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;

    const evaluated = entries.filter((e) => e.result);
    const overall =
      evaluated.length > 0
        ? evaluated.reduce((sum, e) => sum + (e.result?.score ?? 0), 0) /
          evaluated.length
        : 0;

    supabase
      .from("interview_attempts")
      .insert({
        round_id: roundId,
        category: roundTitle,
        option_title: optionTitle,
        score: Math.round(overall * 10),
        answer_type: entries.some((e) => e.mode === "video")
          ? "Sign Video"
          : "Text",
        question_count: entries.length,
        answers: entries,
      })
      .then(({ error }) => {
        if (error) console.log("Save attempt error:", error.message);
      });
  }, [finished]);

  const handleAnswered = (done: boolean, value?: string) => {
    setAnswered(done);
    setAnswerValue(done ? (value ?? "") : "");
  };

  const selectMode = (next: AnswerMode) => {
    if (next === mode) return;
    setMode(next);
    setAnswered(false);
    setAnswerValue("");
    setNotice(null);
  };

  const advance = (last: boolean) => {
    if (last) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setAnswerValue("");
    setNotice(null);
    setFeedback(null);
    setPhase("answering");
  };

  const presentFeedback = (text: string, onComplete: () => void) => {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      setSpeaking(false);
      clearTimers();
      timers.current.push(setTimeout(onComplete, NEXT_QUESTION_DELAY_MS));
    };
    timers.current.push(setTimeout(finish, FEEDBACK_SPEECH_TIMEOUT_MS));
    setSpeaking(true);
    speakQuestion(text, {
      onDone: finish,
      onError: finish,
      onStopped: () => setSpeaking(false),
    });
  };

  const submit = async () => {
    if (!answered || phase !== "answering") return;
    stopSpeaking();
    setNotice(null);
    const last = index + 1 >= list.length;

    setPhase("evaluating");

    let answerText = answerValue;

    if (mode === "audio") {
      setLoadingLabel("Transcribing your answer...");
      try {
        answerText = await transcribeAudio(answerValue);
      } catch (error) {
        console.log("Transcription error:", await readError(error));
        answerText = "";
      }

      if (answerText.length === 0) {
        setNotice(
          "We could not understand your recording. Please record your answer again.",
        );
        setAnswered(false);
        setAnswerValue("");
        setPhase("answering");
        return;
      }
    }

    let result: EvaluationResult | undefined;
    let text = VIDEO_NOT_SUPPORTED_TEXT;

    if (mode === "text" || mode === "audio") {
      setLoadingLabel("Evaluating your answer...");
      try {
        const response = await evaluateAnswers(roundId, [
          {
            topic: current.topic,
            question: current.question,
            answer: answerText,
          },
        ]);
        result = response.results[0];
        text = result.feedback;
      } catch (error) {
        console.log("Evaluation error:", await readError(error));
        text = "We could not evaluate this answer.";
      }
    }

    setEntries((prev) => [
      ...prev,
      {
        topic: current.topic,
        question: current.question,
        mode,
        text: mode === "video" ? "" : answerText,
        result,
      },
    ]);
    setFeedback({
      text,
      transcript: mode === "audio" ? answerText : undefined,
      result,
    });
    setPhase("feedback");
    presentFeedback(text, () => advance(last));
  };

  if (list.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#6b7280", marginBottom: 16 }}>
          No questions are available for the selected topics.
        </Text>
        <TouchableOpacity
          onPress={onExit}
          style={{
            backgroundColor: accent,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLast = index + 1 >= list.length;
  const progress = (index + 1) / list.length;
  const isAnswering = phase === "answering";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            clearTimers();
            stopSpeaking();
            onExit();
          }}
          activeOpacity={0.7}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="close" size={26} color="#374151" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: accent,
            }}
          />
        </View>
        <Text style={{ marginLeft: 12, fontWeight: "600", color: "#374151" }}>
          {index + 1}/{list.length}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: accentBg,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: accent, fontWeight: "600", fontSize: 12 }}>
            {current.topic}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 20,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", lineHeight: 28 }}>
            {current.question}
          </Text>
          {isAnswering && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => speak(current.question)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                marginTop: 14,
                backgroundColor: speaking ? accent : accentBg,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <Ionicons
                name={speaking ? "volume-high" : "volume-medium-outline"}
                size={18}
                color={speaking ? "#fff" : accent}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontWeight: "600",
                  color: speaking ? "#fff" : accent,
                }}
              >
                {speaking ? "Playing..." : "Replay"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isAnswering ? (
          <>
            <Text
              style={{ fontWeight: "bold", fontSize: 15, marginBottom: 10 }}
            >
              Choose how you want to answer
            </Text>

            <AnswerOptions
              mode={mode}
              accent={accent}
              accentBg={accentBg}
              onSelect={selectMode}
            />

            {notice && (
              <View
                style={{
                  backgroundColor: "#fef2f2",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#dc2626", fontSize: 13 }}>{notice}</Text>
              </View>
            )}

            {mode === "video" && (
              <RecordAnswer
                key={`video-${index}`}
                kind="video"
                accent={accent}
                onAnswered={handleAnswered}
              />
            )}
            {mode === "audio" && (
              <AudioAnswer
                key={`audio-${index}-${entries.length}-${notice ?? ""}`}
                accent={accent}
                onAnswered={handleAnswered}
              />
            )}
            {mode === "text" && (
              <TextAnswer
                key={`text-${index}`}
                accent={accent}
                onAnswered={handleAnswered}
              />
            )}
          </>
        ) : (
          <FeedbackCard
            loading={phase === "evaluating"}
            loadingLabel={loadingLabel}
            text={feedback?.text ?? ""}
            transcript={feedback?.transcript}
            result={feedback?.result}
            accent={accent}
            accentBg={accentBg}
          />
        )}
      </ScrollView>

      {isAnswering && (
        <TouchableOpacity
          disabled={!answered}
          activeOpacity={0.8}
          onPress={submit}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 12,
            backgroundColor: answered ? accent : "#d1d5db",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {isLast ? "Submit and Finish" : "Submit Answer"}
          </Text>
        </TouchableOpacity>
      )}

      <CompletionModal
        visible={finished}
        entries={entries}
        accent={accent}
        accentBg={accentBg}
        onRestart={onRestart}
        onExit={onExit}
      />
    </KeyboardAvoidingView>
  );
}
