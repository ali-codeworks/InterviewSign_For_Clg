import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type Attempt = {
  id: string;
  category: string;
  date: string;
  score: number;
  answerType: "Text" | "Sign Video";
  questions: number;
};

const attempts: Attempt[] = [
  {
    id: "1",
    category: "HR Interview",
    date: "12 Oct 2026",
    score: 82,
    answerType: "Sign Video",
    questions: 10,
  },
  {
    id: "2",
    category: "Technical",
    date: "10 Oct 2026",
    score: 74,
    answerType: "Text",
    questions: 15,
  },
  {
    id: "3",
    category: "Communication",
    date: "08 Oct 2026",
    score: 91,
    answerType: "Sign Video",
    questions: 8,
  },
  {
    id: "4",
    category: "Behavioral",
    date: "05 Oct 2026",
    score: 58,
    answerType: "Text",
    questions: 10,
  },
  {
    id: "5",
    category: "HR Interview",
    date: "02 Oct 2026",
    score: 67,
    answerType: "Text",
    questions: 12,
  },
  {
    id: "6",
    category: "Technical",
    date: "29 Sep 2026",
    score: 45,
    answerType: "Text",
    questions: 20,
  },
];

const filters = [
  "All",
  "HR Interview",
  "Technical",
  "Communication",
  "Behavioral",
];

const getScoreColor = (score: number) => {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
};

export default function History() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filterListRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (category && filters.includes(category)) {
      setSelectedFilter(category);
      router.setParams({ category: undefined });
    }
  }, [category]);

  useEffect(() => {
    const index = filters.indexOf(selectedFilter);
    if (index >= 0) {
      filterListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedFilter]);

  const filteredAttempts =
    selectedFilter === "All"
      ? attempts
      : attempts.filter((a) => a.category === selectedFilter);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 4 }}>
        History
      </Text>
      <Text style={{ color: "#6b7280", marginBottom: 16 }}>
        Review your previous interview attempts
      </Text>

      <View style={{ height: 44, marginBottom: 12 }}>
        <FlatList
          ref={filterListRef}
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8 }}
          onScrollToIndexFailed={(info) => {
            filterListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
            setTimeout(() => {
              filterListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            }, 100);
          }}
          renderItem={({ item }) => {
            const isActive = item === selectedFilter;
            return (
              <TouchableOpacity
                onPress={() => setSelectedFilter(item)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? "#2563eb" : "#eff6ff",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "#fff" : "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredAttempts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 48 }}>
            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
            <Text style={{ color: "#6b7280", marginTop: 8 }}>
              No attempts found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#eff6ff",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name={item.answerType === "Sign Video" ? "videocam" : "create"}
                size={22}
                color="#2563eb"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                {item.category}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                {item.date} · {item.questions} questions · {item.answerType}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: getScoreColor(item.score),
              }}
            >
              {item.score}%
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
