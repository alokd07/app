import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getUserData, saveUserData } from "@/src/services/auth";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import { appColors, fonts } from "@/src/theme/colors";
import { useAuthStore } from "@/src/store/authStore";
import apiClient from "@/src/services/api";
import { API_CONFIG } from "@/src/config/api";

const P = appColors;
const GENDER_OPTIONS = ["Male", "Female", "Other"];

type FormState = {
  firstName: string;
  lastName: string;
  DOB: string;
  gender: string;
  phoneNumber: string;
  imageUrl?: string;
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={{ color: "#EF4444" }}> *</Text>}
    </Text>
  );
}

export default function PersonalDetailsScreen() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    DOB: "",
    gender: "",
    phoneNumber: "",
    imageUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { setUser: setAuthUser } = useAuthStore();

  const loadUser = async () => {
    const storedUser = await getUserData();
    console.log("Loaded user data:", storedUser);
    const u =
      storedUser?.student ??
      storedUser?.data?.student ??
      storedUser?.data ??
      storedUser ??
      {};
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      DOB: u.DOB ?? "",
      gender: u.gender ?? "",
      phoneNumber: u.phone ?? "",
      imageUrl: u.imageUrl ?? "",
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const formatPhone = (phone: string): string => {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7, 12)}`;
    }
    return phone;
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;

    const selectedImage = result.assets[0];
    const formData = new FormData();
    formData.append("image", {
      uri: selectedImage.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    setIsSaving(true);
    try {
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.UPDATE_STUDENT_PROFILE,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updated =
        response?.data?.data?.student ?? response?.data?.student ?? null;
      const newUrl = updated?.imageUrl ?? selectedImage.uri;
      const allData = await getUserData();
      const base =
        allData?.student ??
        allData?.data?.student ??
        allData?.data ??
        allData ??
        {};
      const merged = { ...base, imageUrl: newUrl };
      setForm((prev) => ({ ...prev, imageUrl: newUrl }));
      await saveUserData(merged);
      const storeUser = useAuthStore.getState().user as any;
      setAuthUser({ ...storeUser, ...merged });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "Could not update photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.DOB.trim()) return "Date of birth is required.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.DOB.trim()))
      return "DOB must be in YYYY-MM-DD format.";
    if (!form.gender) return "Please select a gender.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { Alert.alert("Invalid input", err); return; }

    setIsSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        DOB: form.DOB.trim(),
        gender: form.gender,
      };
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.UPDATE_STUDENT_PROFILE,
        payload
      );
      const updated =
        response?.data?.data?.student ?? response?.data?.student ?? payload;

      const allData = await getUserData();
      const base =
        allData?.student ??
        allData?.data?.student ??
        allData?.data ??
        allData ??
        {};
      const merged = { ...base, ...updated };
      await saveUserData(merged);
      const storeUser = useAuthStore.getState().user as any;
      setAuthUser({ ...storeUser, ...merged });
      Alert.alert("Saved!", "Personal details updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#020817" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={["#020817", "#0F172A"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.avatarWrap}>
              <Avatar
                uri={form.imageUrl}
                name={form.firstName || "Student"}
                size={90}
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handlePickImage}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={14} color="#020817" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Tap camera to update photo</Text>
          </View>

          <View style={styles.form}>
            {/* Name row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="First Name" required />
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(v) => setForm((p) => ({ ...p, firstName: v }))}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  editable={!isSaving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Last Name" required />
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(v) => setForm((p) => ({ ...p, lastName: v }))}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* DOB */}
            <FieldLabel label="Date of Birth" required />
            <TextInput
              style={styles.input}
              value={form.DOB}
              onChangeText={(v) => setForm((p) => ({ ...p, DOB: v }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* Gender */}
            <FieldLabel label="Gender" required />
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((opt) => {
                const active = form.gender === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.genderChip,
                      active && styles.genderChipActive,
                    ]}
                    onPress={() => setForm((p) => ({ ...p, gender: opt }))}
                    activeOpacity={0.8}
                  >
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={P.gold}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.genderText,
                        active && styles.genderTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Phone — locked */}
            <FieldLabel label="Phone Number" />
            <View style={styles.lockedField}>
              <Ionicons
                name="lock-closed"
                size={14}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.lockedValue}>
                {formatPhone(form.phoneNumber)}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.lockedHint}>
              Phone number is verified via OTP and cannot be changed.
            </Text>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#020817" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#020817" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#020817",
    borderBottomWidth: 1,
    borderBottomColor: "#020817",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff2e",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#fff",
  },

  scroll: { paddingBottom: 40 },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    overflow: "hidden",
    marginBottom: 4,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: P.gold,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#020817",
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.45)",
    marginTop: 12,
  },

  form: { paddingHorizontal: 18, paddingTop: 20, gap: 14 },

  row: { flexDirection: "row", gap: 12 },

  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#1F2937",
    marginBottom: 2,
  },

  genderRow: { flexDirection: "row", gap: 10, marginBottom: 2 },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  genderChipActive: {
    borderColor: P.gold,
    backgroundColor: "rgba(232,168,56,0.08)",
  },
  genderText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#6B7280",
  },
  genderTextActive: { color: "#1F2937" },

  lockedField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  lockedValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#9CA3AF",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#10B981",
  },
  lockedHint: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: -8,
    paddingHorizontal: 2,
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: P.gold,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: P.gold,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: "#020817",
  },
});
