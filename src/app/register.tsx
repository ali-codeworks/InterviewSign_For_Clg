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

const preferences: AnswerPreference[] = ["Text", "Sign Video", "Both"];
const hearingOptions = ["Deaf", "Hard of Hearing", "Speech Impaired", "Other"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-z0-9_]{3,20}$/;

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [hearingStatus, setHearingStatus] = useState("");
  const [preference, setPreference] = useState<AnswerPreference>("Both");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (username.length === 0) {
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
  }, [username]);

  const passwordsMatch = password === confirmPassword;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    usernameStatus === "available" &&
    emailRegex.test(email.trim()) &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    passwordsMatch &&
    !submitting;

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

  const handleRegister = async () => {
    setError("");
    setSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username,
            phone: phone.trim(),
            city: city.trim(),
            hearing_status: hearingStatus,
            answer_preference: preference,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setError("This email is already registered.");
        return;
      }

      if (!data.session) {
        setError(
          "Email confirmation is still ON in Supabase. Turn it OFF and try again.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
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

          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 4 }}>
            Create Account
          </Text>
          <Text style={{ color: "#6b7280", marginBottom: 24 }}>
            Fields marked with * are required
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
            placeholder="e.g. ali_ansari"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ ...inputStyle, marginBottom: 6 }}
          />
          <Text
            style={{
              color: usernameMessage[usernameStatus].color,
              marginBottom: 16,
              minHeight: 18,
              fontSize: 13,
            }}
          >
            {usernameMessage[usernameStatus].text}
          </Text>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={inputStyle}
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
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
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

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Password *</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 14,
              marginBottom: 16,
            }}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={{ flex: 1, paddingVertical: 14, fontSize: 16 }}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Confirm Password *
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            style={{ ...inputStyle, marginBottom: 6 }}
          />
          <Text
            style={{
              color: "#dc2626",
              marginBottom: 16,
              minHeight: 18,
              fontSize: 13,
            }}
          >
            {confirmPassword.length > 0 && !passwordsMatch
              ? "Passwords do not match."
              : ""}
          </Text>

          {error !== "" && (
            <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? "#2563eb" : "#93c5fd",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Register
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: "#6b7280" }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
