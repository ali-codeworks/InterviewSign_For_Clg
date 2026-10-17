import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type AnswerMode = "video" | "audio" | "text";

type Props = {
  mode: AnswerMode | null;
  accent: string;
  accentBg: string;
  onSelect: (mode: AnswerMode) => void;
};

const options: {
  id: AnswerMode;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { id: "video", label: "Video", icon: "videocam-outline" },
  { id: "audio", label: "Audio", icon: "mic-outline" },
  { id: "text", label: "Text", icon: "create-outline" },
];

export default function AnswerOptions({
  mode,
  accent,
  accentBg,
  onSelect,
}: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
      {options.map((option) => {
        const isSelected = mode === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.8}
            onPress={() => onSelect(option.id)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 14,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: isSelected ? accent : "transparent",
              backgroundColor: isSelected ? accentBg : "#f9fafb",
            }}
          >
            <Ionicons
              name={option.icon}
              size={26}
              color={isSelected ? accent : "#6b7280"}
            />
            <Text
              style={{
                marginTop: 6,
                fontWeight: "600",
                color: isSelected ? accent : "#374151",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
