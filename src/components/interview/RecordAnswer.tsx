import { useRecordTimer } from "@/hooks/useRecordTimer";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  kind: "video" | "audio";
  accent: string;
  onAnswered: (done: boolean) => void;
};

type Phase = "idle" | "recording" | "done";

export default function RecordAnswer({ kind, accent, onAnswered }: Props) {
  const timer = useRecordTimer();
  const [phase, setPhase] = useState<Phase>("idle");
  const isVideo = kind === "video";

  const startRecording = () => {
    timer.reset();
    timer.start();
    setPhase("recording");
  };

  const stopRecording = () => {
    timer.stop();
    setPhase("done");
    onAnswered(true);
  };

  const retake = () => {
    timer.reset();
    setPhase("idle");
    onAnswered(false);
  };

  return (
    <View>
      <View
        style={{
          height: 220,
          borderRadius: 16,
          backgroundColor: isVideo ? "#111827" : "#f9fafb",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <Ionicons
          name={isVideo ? "videocam" : "mic"}
          size={56}
          color={isVideo ? "#374151" : accent}
        />

        {!isVideo && (
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
              const active = phase === "recording";
              const height = active
                ? 8 + ((i * 7 + timer.seconds * 13) % 32)
                : 8;
              return (
                <View
                  key={i}
                  style={{
                    width: 4,
                    height,
                    borderRadius: 2,
                    backgroundColor: active ? accent : "#d1d5db",
                  }}
                />
              );
            })}
          </View>
        )}

        <Text
          style={{
            marginTop: 10,
            color: isVideo ? "#9ca3af" : "#6b7280",
            fontSize: 13,
          }}
        >
          {phase === "idle" &&
            (isVideo
              ? "Camera preview will appear here"
              : "Microphone is ready")}
          {phase === "recording" && "Recording in progress"}
          {phase === "done" && "Recording complete"}
        </Text>

        {phase === "recording" && (
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

      {phase === "recording" && (
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
            {isVideo ? "Video" : "Audio"} answer recorded ({timer.label})
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={retake}>
            <Text style={{ color: "#2563eb", fontWeight: "600" }}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
