import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AnswerEntry } from "./types";

type Props = {
  visible: boolean;
  entries: AnswerEntry[];
  accent: string;
  accentBg: string;
  onRestart: () => void;
  onExit: () => void;
};

const verdictStyle = {
  Correct: { color: "#16a34a", bg: "#f0fdf4" },
  "Partially correct": { color: "#d97706", bg: "#fffbeb" },
  Incorrect: { color: "#dc2626", bg: "#fef2f2" },
};

export default function CompletionModal({
  visible,
  entries,
  accent,
  accentBg,
  onRestart,
  onExit,
}: Props) {
  const evaluated = entries.filter((entry) => entry.result);
  const overall =
    evaluated.length > 0
      ? Math.round(
          (evaluated.reduce((sum, e) => sum + (e.result?.score ?? 0), 0) /
            evaluated.length) *
            10,
        ) / 10
      : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            maxHeight: "92%",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: accentBg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="trophy-outline" size={36} color={accent} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                Interview Complete
              </Text>
              <Text
                style={{ color: "#6b7280", marginTop: 4, textAlign: "center" }}
              >
                You answered {entries.length} questions.
              </Text>
            </View>

            {overall !== null && (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: accentBg,
                  borderRadius: 18,
                  paddingVertical: 16,
                  marginTop: 18,
                }}
              >
                <Text style={{ color: "#6b7280", fontSize: 13 }}>
                  Overall score
                </Text>
                <Text
                  style={{ fontSize: 36, fontWeight: "bold", color: accent }}
                >
                  {overall} / 10
                </Text>
              </View>
            )}

            <View style={{ marginTop: 18 }}>
              {entries.map((entry, index) => {
                const style = entry.result
                  ? verdictStyle[entry.result.verdict]
                  : null;
                return (
                  <View
                    key={`${entry.question}-${index}`}
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                      {index + 1}. {entry.question}
                    </Text>
                    {entry.result && style ? (
                      <>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 8,
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
                              style={{
                                color: style.color,
                                fontWeight: "600",
                                fontSize: 12,
                              }}
                            >
                              {entry.result.verdict}
                            </Text>
                          </View>
                          <Text
                            style={{
                              marginLeft: 10,
                              fontWeight: "bold",
                              color: "#374151",
                            }}
                          >
                            {entry.result.score} / 10
                          </Text>
                        </View>
                        <Text
                          style={{
                            marginTop: 8,
                            color: "#374151",
                            lineHeight: 20,
                          }}
                        >
                          {entry.result.feedback}
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={{ marginTop: 8, color: "#9ca3af", fontSize: 12 }}
                      >
                        Not evaluated
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRestart}
              style={{
                backgroundColor: accent,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Practice Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onExit}
              style={{
                backgroundColor: "#f3f4f6",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Back to Rounds
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
