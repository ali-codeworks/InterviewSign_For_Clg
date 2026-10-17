import InterviewSession from "@/components/interview/InterviewSession";
import { rounds } from "@/constants/rounds";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Step = "round" | "option" | "topic";

const pluralize = (label: string) =>
  label.endsWith("y") ? `${label.slice(0, -1)}ies` : `${label}s`;

export default function Interview() {
  const [step, setStep] = useState<Step>("round");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [optionId, setOptionId] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const selectedRound = rounds.find((r) => r.id === roundId);
  const selectedOption = selectedRound?.options.find((o) => o.id === optionId);
  const allTopics = selectedOption?.topics ?? [];
  const allSelected =
    allTopics.length > 0 && selectedTopics.length === allTopics.length;
  const optionLabel = selectedRound?.optionLabel ?? "Option";

  const selectRound = (id: string) => {
    setRoundId(id);
    setOptionId(null);
    setSelectedTopics([]);
  };

  const toggleTopic = (item: string) => {
    setSelectedTopics((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item],
    );
  };

  const toggleAll = () => {
    setSelectedTopics(allSelected ? [] : [...allTopics]);
  };

  const goBack = () => {
    if (step === "topic") {
      setSelectedTopics([]);
      setStep("option");
    } else if (step === "option") {
      setOptionId(null);
      setStep("round");
    }
  };

  const onContinue = () => {
    if (step === "round" && selectedRound) {
      setStep("option");
    } else if (step === "option" && selectedOption) {
      setStep("topic");
    } else if (step === "topic" && selectedTopics.length > 0) {
      setStarted(true);
    }
  };

  const exitSession = () => {
    setStarted(false);
    setSessionKey(0);
    setStep("round");
    setRoundId(null);
    setOptionId(null);
    setSelectedTopics([]);
  };

  const title =
    step === "round"
      ? "Choose Your Round"
      : step === "option"
        ? `Choose ${optionLabel}`
        : "Choose Topics";

  const subtitle =
    step === "round"
      ? "Select the interview round you want to practice"
      : step === "option"
        ? `Pick a ${optionLabel.toLowerCase()} for ${selectedRound?.title}`
        : `Select one or more topics in ${selectedOption?.title}`;

  let buttonLabel = "Select a round";
  let buttonEnabled = false;

  if (step === "round") {
    buttonEnabled = !!selectedRound;
    buttonLabel = selectedRound ? "Continue" : "Select a round";
  } else if (step === "option") {
    buttonEnabled = !!selectedOption;
    buttonLabel = selectedOption
      ? `Continue with ${selectedOption.title}`
      : `Select a ${optionLabel.toLowerCase()}`;
  } else {
    buttonEnabled = selectedTopics.length > 0;
    buttonLabel =
      selectedTopics.length > 0
        ? `Start Interview (${selectedTopics.length} ${
            selectedTopics.length === 1 ? "topic" : "topics"
          })`
        : "Select at least one topic";
  }

  const accent = selectedOption?.color ?? selectedRound?.color ?? "#2563eb";
  const accentBg = selectedOption?.bg ?? selectedRound?.bg ?? "#eff6ff";

  if (started && selectedRound && selectedOption) {
    return (
      <InterviewSession
        key={sessionKey}
        roundId={selectedRound.id}
        optionId={selectedOption.id}
        topics={selectedTopics}
        total={selectedRound.questions}
        accent={accent}
        accentBg={accentBg}
        onExit={exitSession}
        onRestart={() => setSessionKey((k) => k + 1)}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {step !== "round" && (
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              alignSelf: "flex-start",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#2563eb" />
            <Text
              style={{ color: "#2563eb", fontWeight: "600", marginLeft: 6 }}
            >
              Back
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 20 }}>{subtitle}</Text>

        {step === "round" &&
          rounds.map((round) => {
            const isSelected = round.id === roundId;
            const totalTopics = round.options.reduce(
              (sum, option) => sum + option.topics.length,
              0,
            );
            return (
              <TouchableOpacity
                key={round.id}
                activeOpacity={0.8}
                onPress={() => selectRound(round.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isSelected ? round.bg : "#f9fafb",
                  borderWidth: 2,
                  borderColor: isSelected ? round.color : "transparent",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: round.bg,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={round.icon} size={26} color={round.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {round.title}
                  </Text>
                  <Text
                    style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {round.description}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 14, marginTop: 8 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={15}
                        color="#6b7280"
                      />
                      <Text
                        style={{
                          color: "#6b7280",
                          fontSize: 12,
                          marginLeft: 4,
                        }}
                      >
                        {round.options.length} {pluralize(round.optionLabel)}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="list-outline" size={15} color="#6b7280" />
                      <Text
                        style={{
                          color: "#6b7280",
                          fontSize: 12,
                          marginLeft: 4,
                        }}
                      >
                        {totalTopics} topics
                      </Text>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={26}
                  color={isSelected ? round.color : "#d1d5db"}
                />
              </TouchableOpacity>
            );
          })}

        {step === "option" && selectedRound && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {selectedRound.options.map((option) => {
              const isSelected = option.id === optionId;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setOptionId(option.id);
                    setSelectedTopics([]);
                  }}
                  style={{
                    width: "48%",
                    backgroundColor: isSelected ? option.bg : "#f9fafb",
                    borderWidth: 2,
                    borderColor: isSelected ? option.color : "transparent",
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: option.bg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={option.color}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 15, fontWeight: "bold" }}
                    numberOfLines={2}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}
                  >
                    {option.topics.length} topics
                  </Text>
                  {isSelected && (
                    <View style={{ position: "absolute", top: 10, right: 10 }}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={option.color}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === "topic" && (
          <>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleAll}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: allSelected ? accentBg : "#f9fafb",
                borderWidth: 2,
                borderColor: allSelected ? accent : "transparent",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "bold" }}>
                All Topics
              </Text>
              <Ionicons
                name={allSelected ? "checkbox" : "square-outline"}
                size={26}
                color={allSelected ? accent : "#d1d5db"}
              />
            </TouchableOpacity>

            {allTopics.map((item) => {
              const isSelected = selectedTopics.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => toggleTopic(item)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isSelected ? accentBg : "#f9fafb",
                    borderWidth: 2,
                    borderColor: isSelected ? accent : "transparent",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: "600" }}>
                    {item}
                  </Text>
                  <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={26}
                    color={isSelected ? accent : "#d1d5db"}
                  />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        disabled={!buttonEnabled}
        activeOpacity={0.8}
        onPress={onContinue}
        style={{
          backgroundColor: buttonEnabled ? "#2563eb" : "#93c5fd",
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
