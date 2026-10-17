import { useState } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  accent: string;
  onAnswered: (done: boolean, text?: string) => void;
};

export default function TextAnswer({ accent, onAnswered }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const onChange = (text: string) => {
    setValue(text);
    onAnswered(text.trim().length > 0, text);
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline
        placeholder="Type your answer here..."
        placeholderTextColor="#9ca3af"
        textAlignVertical="top"
        style={{
          minHeight: 180,
          backgroundColor: "#f9fafb",
          borderWidth: 2,
          borderColor: focused ? accent : "transparent",
          borderRadius: 16,
          padding: 14,
          fontSize: 15,
        }}
      />
      <Text
        style={{
          alignSelf: "flex-end",
          marginTop: 6,
          color: "#9ca3af",
          fontSize: 12,
        }}
      >
        {value.trim().length} characters
      </Text>
    </View>
  );
}
