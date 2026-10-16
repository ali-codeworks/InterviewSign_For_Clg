import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const categories = [
  { id: "1", title: "HR Interview", questions: 12, icon: "people" },
  { id: "2", title: "Technical", questions: 20, icon: "code-slash" },
  { id: "3", title: "Communication", questions: 8, icon: "chatbubbles" },
  { id: "4", title: "Behavioral", questions: 10, icon: "happy" },
] as const;

const stats = [
  { label: "Attempts", value: "8" },
  { label: "Avg Score", value: "78%" },
  { label: "Streak", value: "3 days" },
];

const recentAttempts = [
  { id: "1", title: "HR Interview", score: 82, date: "12 Oct 2026" },
  { id: "2", title: "Technical", score: 74, date: "10 Oct 2026" },
];

export default function Home() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <Text style={{ fontSize: 14, color: "#6b7280" }}>Welcome back 👋</Text>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
        Ali Ansari
      </Text>

      {/* Start interview card */}
      <View
        style={{
          backgroundColor: "#2563eb",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          Ready for your interview?
        </Text>
        <Text style={{ color: "#dbeafe", marginTop: 6, marginBottom: 16 }}>
          Answer with text or sign language video and get instant AI feedback.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/interview")}
          style={{
            backgroundColor: "#fff",
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#2563eb", fontWeight: "bold", fontSize: 16 }}>
            Start Interview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{s.value}</Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Categories
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() =>
              router.push({
                pathname: "/history",
                params: { category: c.title },
              })
            }
            style={{
              width: "47%",
              backgroundColor: "#eff6ff",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <Ionicons name={c.icon} size={28} color="#2563eb" />
            <Text style={{ fontWeight: "600", marginTop: 8 }}>{c.title}</Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>
              {c.questions} questions
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent attempts */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Recent Attempts
      </Text>
      {recentAttempts.map((r) => (
        <View
          key={r.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f9fafb",
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <View>
            <Text style={{ fontWeight: "600" }}>{r.title}</Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>{r.date}</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#16a34a" }}>
            {r.score}%
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
