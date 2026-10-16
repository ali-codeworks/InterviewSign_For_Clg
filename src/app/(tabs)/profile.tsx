import { useAppContext } from "@/context/context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { userData, logout, refreshProfile } = useAppContext();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);

  if (!userData) return null;

  const fullName = `${userData.firstName} ${userData.lastName}`;
  const initials =
    `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();

  const details = [
    { label: "Email", value: userData.email, icon: "mail-outline" },
    {
      label: "Phone",
      value: userData.phone || "Not added",
      icon: "call-outline",
    },
    {
      label: "City",
      value: userData.city || "Not added",
      icon: "location-outline",
    },
    {
      label: "Hearing / Speech Status",
      value: userData.hearingStatus || "Not added",
      icon: "ear-outline",
    },
    {
      label: "Answer Preference",
      value: userData.answerPreference,
      icon: "chatbubble-ellipses-outline",
    },
  ] as const;

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to set a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Upload failed", "Could not read the selected image.");
      return;
    }

    setUploading(true);

    try {
      const path = `${userData.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, decode(asset.base64), {
          contentType: asset.mimeType ?? "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userData.id)
        .select();
      if (updateError) throw new Error(updateError.message);
      if (!updated || updated.length === 0) {
        throw new Error("Profile was not updated.");
      }

      await refreshProfile();
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ marginHorizontal: -16, marginTop: -(insets.top + 16) }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={{ height: insets.top + 130, backgroundColor: "#2563eb" }} />

      <View
        style={{ alignItems: "center", marginTop: -56, paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          onPress={handleChangePhoto}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: "#1d4ed8",
              borderWidth: 4,
              borderColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {userData.avatarUrl ? (
              <Image
                source={{ uri: userData.avatarUrl }}
                style={{ width: 112, height: 112 }}
              />
            ) : (
              <Text style={{ color: "#fff", fontSize: 38, fontWeight: "bold" }}>
                {initials}
              </Text>
            )}
            {uploading && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <View
            style={{
              position: "absolute",
              right: 0,
              bottom: 4,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="camera" size={18} color="#2563eb" />
          </View>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#111827",
            marginTop: 12,
          }}
        >
          {fullName}
        </Text>
        <Text style={{ color: "#2563eb", fontWeight: "600", marginTop: 2 }}>
          @{userData.username}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/edit-profile" as Href)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: "#eff6ff",
          }}
        >
          <Ionicons name="create-outline" size={18} color="#2563eb" />
          <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          Personal Information
        </Text>
        <View
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 24,
          }}
        >
          {details.map((item, index) => (
            <View
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                borderBottomWidth: index === details.length - 1 ? 0 : 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#eff6ff",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name={item.icon} size={20} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  {item.label}
                </Text>
                <Text style={{ fontWeight: "600", fontSize: 15, marginTop: 2 }}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={logout}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#fee2e2",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={{ color: "#dc2626", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
