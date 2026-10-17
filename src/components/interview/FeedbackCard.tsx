import { EvaluationResult } from "@/lib/evaluate";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  loading: boolean;
  loadingLabel: string;
  text: string;
  transcript?: string;
  result?: EvaluationResult;
  accent: string;
  accentBg: string;
};

const verdictStyle = {
  Correct: { color: "#16a34a", bg: "#f0fdf4" },
  "Partially correct": { color: "#d97706", bg: "#fffbeb" },
  Incorrect: { color: "#dc2626", bg: "#fef2f2" },
};

export default function FeedbackCard({
  loading,
  loadingLabel,
  text,
  transcript,
  result,
  accent,
  accentBg,
}: Props) {
  if (loading) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: accentBg,
          borderRadius: 20,
          paddingVertical: 32,
        }}
      >
        <ActivityIndicator size="large" color={accent} />
        <Text style={{ marginTop: 12, color: "#374151", fontWeight: "600" }}>
          {loadingLabel}
        </Text>
      </View>
    );
  }

  const style = result ? verdictStyle[result.verdict] : null;

  return (
    <View
      style={{
        backgroundColor: accentBg,
        borderRadius: 20,
        padding: 18,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="sparkles-outline" size={20} color={accent} />
        <Text
          style={{
            marginLeft: 8,
            fontWeight: "bold",
            fontSize: 15,
            color: accent,
          }}
        >
          AI Feedback
        </Text>
        {result && style && (
          <View
            style={{
              marginLeft: "auto",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: style.bg,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
              }}
            >
              <Text
                style={{ color: style.color, fontWeight: "600", fontSize: 12 }}
              >
                {result.verdict}
              </Text>
            </View>
            <Text
              style={{ marginLeft: 8, fontWeight: "bold", color: "#374151" }}
            >
              {result.score}/10
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          lineHeight: 24,
          color: "#111827",
        }}
      >
        {text}
      </Text>

      {transcript ? (
        <View
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.08)",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#6b7280" }}>
            Your answer (transcribed)
          </Text>
          <Text
            numberOfLines={4}
            style={{
              marginTop: 4,
              fontSize: 13,
              lineHeight: 19,
              color: "#4b5563",
            }}
          >
            {transcript}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
