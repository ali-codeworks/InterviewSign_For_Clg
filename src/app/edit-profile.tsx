import { useAppContext } from "@/context/context";
import { AnswerPreference } from "@/context/type";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COOLDOWN_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const usernameRegex = /^[a-z0-9_]{3,20}$/;
const preferences: AnswerPreference[] = ["Text", "Sign Video", "Both"];
const hearingOptions = ["Deaf", "Hard of Hearing", "Speech Impaired", "Other"];

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export default function EditProfile() {
  const { userData, refreshProfile } = useAppContext();

  const [firstName, setFirstName] = useState(userData?.firstName ?? "");
  const [lastName, setLastName] = useState(userData?.lastName ?? "");
  const [username, setUsername] = useState(userData?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [phone, setPhone] = useState(userData?.phone ?? "");
  const [city, setCity] = useState(userData?.city ?? "");
  const [hearingStatus, setHearingStatus] = useState(
    userData?.hearingStatus ?? "",
  );
  const [preference, setPreference] = useState<AnswerPreference>(
    userData?.answerPreference ?? "Both",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentUsername = userData?.username;

  useEffect(() => {
    if (!currentUsername || username === currentUsername) {
      setUsernameStatus("idle");
      return;
    }
    if (!usernameRegex.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "is_username_available",
        { p_username: username },
      );
      if (rpcError) {
        setUsernameStatus("error");
        return;
      }
      setUsernameStatus(data ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [username, currentUsername]);

  if (!userData) return null;

  const daysLeft = userData.usernameChangedAt
    ? Math.ceil(
        (new Date(userData.usernameChangedAt).getTime() +
          COOLDOWN_DAYS * DAY_MS -
          Date.now()) /
          DAY_MS,
      )
    : 0;
  const usernameLocked = daysLeft > 0;
  const usernameChanged = username !== userData.username;

  const hasChanges =
    firstName.trim() !== userData.firstName ||
    lastName.trim() !== userData.lastName ||
    usernameChanged ||
    phone.trim() !== userData.phone ||
    city.trim() !== userData.city ||
    hearingStatus !== userData.hearingStatus ||
    preference !== userData.answerPreference;

  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (!usernameChanged || usernameStatus === "available") &&
    hasChanges &&
    !saving;

  const usernameMessage: Record<
    UsernameStatus,
    { text: string; color: string }
  > = {
    idle: { text: "", color: "#6b7280" },
    invalid: {
      text: "3-20 characters: lowercase letters, numbers, underscore.",
      color: "#dc2626",
    },
    checking: { text: "Checking availability...", color: "#6b7280" },
    available: { text: "Username is available.", color: "#16a34a" },
    taken: { text: "Username is already taken.", color: "#dc2626" },
    error: { text: "Could not check username. Try again.", color: "#dc2626" },
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const payload: Record<string, string | null> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        hearing_status: hearingStatus || null,
        answer_preference: preference,
      };
      if (usernameChanged) payload.username = username;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userData.id);

      if (updateError) {
        if (updateError.message.includes("USERNAME_COOLDOWN")) {
          setError(
            `You can change your username only once every ${COOLDOWN_DAYS} days.`,
          );
        } else if (updateError.code === "23505") {
          setError("Username is already taken.");
        } else {
          setError("Could not save changes. Please try again.");
        }
        return;
      }

      await refreshProfile();
      router.back();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 16, alignSelf: "flex-start" }}
          >
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>

          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
            Edit Profile
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                First Name *
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#9ca3af"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                Last Name *
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#9ca3af"
                style={inputStyle}
              />
            </View>
          </View>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Username *</Text>
          <TextInput
            value={username}
            onChangeText={(value) =>
              setUsername(
                value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "")
                  .slice(0, 20),
              )
            }
            editable={!usernameLocked}
            placeholder="username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              ...inputStyle,
              marginBottom: 6,
              opacity: usernameLocked ? 0.5 : 1,
            }}
          />
          <Text
            style={{
              color: usernameLocked
                ? "#6b7280"
                : usernameMessage[usernameStatus].color,
              marginBottom: 16,
              minHeight: 18,
              fontSize: 13,
            }}
          >
            {usernameLocked
              ? `You can change your username again in ${daysLeft} day${daysLeft > 1 ? "s" : ""}.`
              : usernameMessage[usernameStatus].text ||
                `Username can be changed once every ${COOLDOWN_DAYS} days.`}
          </Text>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Email</Text>
          <TextInput
            value={userData.email}
            editable={false}
            style={{ ...inputStyle, opacity: 0.5 }}
          />

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            style={inputStyle}
          />

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Your city"
            placeholderTextColor="#9ca3af"
            style={inputStyle}
          />

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Hearing / Speech Status
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {hearingOptions.map((item) => {
              const isActive = item === hearingStatus;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setHearingStatus(isActive ? "" : item)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: isActive ? "#2563eb" : "#eff6ff",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      color: isActive ? "#fff" : "#2563eb",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Answer Preference
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {preferences.map((item) => {
              const isActive = item === preference;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setPreference(item)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: isActive ? "#2563eb" : "#eff6ff",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      color: isActive ? "#fff" : "#2563eb",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error !== "" && (
            <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{
              backgroundColor: canSave ? "#2563eb" : "#93c5fd",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
