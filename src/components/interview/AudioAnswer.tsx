import { useRecordTimer } from "@/hooks/useRecordTimer";
import { stopSpeaking } from "@/lib/speech";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  accent: string;
  onAnswered: (done: boolean, value?: string) => void;
};

type Phase = "idle" | "recording" | "done";

const MIN_SECONDS = 2;

export default function AudioAnswer({ accent, onAnswered }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const timer = useRecordTimer();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission is required to record your answer.");
        return;
      }
      stopSpeaking();
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      timer.reset();
      timer.start();
      setPhase("recording");
    } catch {
      setError("Could not start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    const duration = timer.seconds;
    timer.stop();
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      setError("Could not stop recording. Please try again.");
      setPhase("idle");
      timer.reset();
      return;
    }

    const uri = recorder.uri;
    if (!uri || duration < MIN_SECONDS) {
      setError("Your recording was too short. Please record again.");
      setPhase("idle");
      timer.reset();
      return;
    }

    setPhase("done");
    onAnswered(true, uri);
  };

  const retake = () => {
    timer.reset();
    setError(null);
    setPhase("idle");
    onAnswered(false);
  };

  const recording = phase === "recording";

  return (
    <View>
      <View
        style={{
          height: 220,
          borderRadius: 16,
          backgroundColor: "#f9fafb",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <Ionicons name="mic" size={56} color={accent} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            height: 44,
            marginTop: 16,
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const height = recording
              ? 8 + ((i * 7 + timer.seconds * 13) % 32)
              : 8;
            return (
              <View
                key={i}
                style={{
                  width: 4,
                  height,
                  borderRadius: 2,
                  backgroundColor: recording ? accent : "#d1d5db",
                }}
              />
            );
          })}
        </View>

        <Text style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
          {phase === "idle" && "Tap start and speak your answer"}
          {phase === "recording" && "Recording in progress"}
          {phase === "done" && "Recording complete"}
        </Text>

        {recording && (
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.55)",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#ef4444",
                marginRight: 6,
              }}
            />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
              REC {timer.label}
            </Text>
          </View>
        )}
      </View>

      {error && (
        <Text style={{ color: "#dc2626", marginBottom: 12, fontSize: 13 }}>
          {error}
        </Text>
      )}

      {phase === "idle" && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={startRecording}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#dc2626",
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Ionicons name="radio-button-on" size={20} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 15,
              marginLeft: 8,
            }}
          >
            Start Recording
          </Text>
        </TouchableOpacity>
      )}

      {recording && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={stopRecording}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111827",
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Ionicons name="stop-circle" size={20} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 15,
              marginLeft: 8,
            }}
          >
            Stop Recording
          </Text>
        </TouchableOpacity>
      )}

      {phase === "done" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f0fdf4",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
          <Text
            style={{
              flex: 1,
              marginLeft: 10,
              fontWeight: "600",
              color: "#166534",
            }}
          >
            Audio answer recorded ({timer.label})
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={retake}>
            <Text style={{ color: "#2563eb", fontWeight: "600" }}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
