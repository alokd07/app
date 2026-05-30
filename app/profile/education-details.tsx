import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData, saveUserData } from "@/src/services/auth";
import { appColors, fonts } from "@/src/theme/colors";
import { useAuthStore } from "@/src/store/authStore";
import apiClient from "@/src/services/api";
import { API_CONFIG } from "@/src/config/api";

const P = appColors;

type FormState = {
  schoolName: string;
  schoolAddress: string;
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={{ color: "#EF4444" }}> *</Text>}
    </Text>
  );
}

export default function EducationDetailsScreen() {
  const [form, setForm] = useState<FormState>({
    schoolName: "",
    schoolAddress: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { setUser: setAuthUser } = useAuthStore();

  const loadUser = async () => {
    const storedUser = await getUserData();
    const u =
      storedUser?.student ??
      storedUser?.data?.student ??
      storedUser?.data ??
      storedUser ??
      {};
    setForm({
      schoolName: u.schoolName ?? "",
      schoolAddress: u.schoolAddress ?? "",
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!form.schoolName.trim()) {
      Alert.alert("Invalid input", "School name is required.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        schoolName: form.schoolName.trim(),
        schoolAddress: form.schoolAddress.trim(),
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
      Alert.alert("Saved!", "Education details updated.", [
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education Details</Text>
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
          {/* Illustration card */}
          <View style={styles.illustrationCard}>
            <View style={styles.illustrationIcon}>
              <Ionicons name="school" size={32} color={P.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.illustrationTitle}>Academic Profile</Text>
              <Text style={styles.illustrationSubtitle}>
                Help teachers understand your school background better.
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* School Name */}
            <FieldLabel label="School Name" required />
            <TextInput
              style={styles.input}
              value={form.schoolName}
              onChangeText={(v) => setForm((p) => ({ ...p, schoolName: v }))}
              placeholder="e.g. Delhi Public School, RK Puram"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* School Address */}
            <FieldLabel label="School Address" />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={form.schoolAddress}
              onChangeText={(v) => setForm((p) => ({ ...p, schoolAddress: v }))}
              placeholder="Enter full school address..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSaving}
            />

            {/* Info note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle-outline" size={16} color="#6366F1" />
              <Text style={styles.infoNoteText}>
                This information helps in matching you with the right tutors for your curriculum.
              </Text>
            </View>

            {/* Save */}
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },

  scroll: { paddingBottom: 40 },

  illustrationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    margin: 18,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  illustrationIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(232,168,56,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  illustrationSubtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 18,
  },

  form: { paddingHorizontal: 18, paddingTop: 16, gap: 12 },

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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(99,102,241,0.07)",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#4338CA",
    lineHeight: 17,
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
