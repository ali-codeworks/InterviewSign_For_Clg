import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const categories = [
  { id: "1", title: "HR Interview", questions: 12, icon: "people" },
  { id: "2", title: "Technical", questions: 20, icon: "code-slash" },
  { id: "3", title: "Communication", questions: 8, icon: "chatbubbles" },
  { id: "4", title: "Behavioral", questions: 10, icon: "happy" },
] as const;

type Row = {
  id: string;
  category: string;
  score: number;
  created_at: string;
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const calcStreak = (rows: Row[]) => {
  const days = new Set(rows.map((r) => dayKey(new Date(r.created_at))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
};

export default function Home() {
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
        );
      }
    }

    const { data, error } = await supabase
      .from("interview_attempts")
      .select("id, category, score, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Load home error:", error.message);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const avg =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length)
      : null;
  const streak = calcStreak(rows);

  const stats = [
    { label: "Attempts", value: String(rows.length) },
    { label: "Avg Score", value: avg === null ? "—" : `${avg}%` },
    { label: "Streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
  ];

  const recentAttempts = rows.slice(0, 2);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 14, color: "#6b7280" }}>Welcome back 👋</Text>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
        {name || "Welcome"}
      </Text>

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

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Recent Attempts
      </Text>
      {recentAttempts.length === 0 ? (
        <Text style={{ color: "#6b7280", marginBottom: 24 }}>
          No attempts yet
        </Text>
      ) : (
        recentAttempts.map((r) => (
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
              <Text style={{ fontWeight: "600" }}>{r.category}</Text>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>
                {formatDate(r.created_at)}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: getScoreColor(r.score),
              }}
            >
              {r.score}%
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
