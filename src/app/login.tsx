import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
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

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    identifier.trim().length > 0 && password.length >= 6 && !submitting;

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);

    try {
      const value = identifier.trim().toLowerCase();
      let email = value;

      if (!value.includes("@")) {
        const { data, error: lookupError } = await supabase.rpc(
          "get_email_by_username",
          { p_username: value },
        );
        if (lookupError || !data) {
          setError("Invalid username or password.");
          return;
        }
        email = data as string;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Invalid email/username or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
            paddingBottom: 48,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: "#2563eb",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="hand-left" size={40} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold" }}>
              InterviewSign
            </Text>
            <Text style={{ color: "#6b7280", marginTop: 4 }}>
              Log in to continue your interview practice
            </Text>
          </View>

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Email or Username
          </Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="you@example.com or username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              marginBottom: 16,
            }}
          />

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Password</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 14,
              marginBottom: 12,
            }}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
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

          {error !== "" && (
            <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? "#2563eb" : "#93c5fd",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
              marginBottom: 20,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Log In
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: "#6b7280" }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register" as Href)}>
              <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
