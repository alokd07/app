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
  houseNumber: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={{ color: "#EF4444" }}> *</Text>}
    </Text>
  );
}

export default function ContactDetailsScreen() {
  const [form, setForm] = useState<FormState>({
    houseNumber: "",
    area: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
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
      houseNumber: u.houseNumber ?? "",
      area: u.area ?? "",
      landmark: u.landmark ?? "",
      pincode: u.pincode ?? "",
      city: u.city ?? "",
      state: u.state ?? "",
      country: u.country ?? "India",
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const validate = (): string | null => {
    if (!form.houseNumber.trim()) return "House / Flat No. is required.";
    if (!form.area.trim()) return "Area / Locality is required.";
    if (!form.pincode.trim()) return "Pincode is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must be 6 digits.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.country.trim()) return "Country is required.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { Alert.alert("Invalid input", err); return; }

    setIsSaving(true);
    try {
      const payload = {
        houseNumber: form.houseNumber.trim(),
        area: form.area.trim(),
        landmark: form.landmark.trim() || "Not provided",
        pincode: form.pincode.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
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
      Alert.alert("Saved!", "Contact & address updated.", [
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
        <Text style={styles.headerTitle}>Contact & Address</Text>
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
          {/* Section hint */}
          <View style={styles.sectionHint}>
            <Ionicons name="location-outline" size={18} color={P.gold} />
            <Text style={styles.sectionHintText}>
              Your address is used for session bookings and communications.
            </Text>
          </View>

          <View style={styles.form}>
            {/* House / Flat */}
            <FieldLabel label="House / Flat No." required />
            <TextInput
              style={styles.input}
              value={form.houseNumber}
              onChangeText={(v) => setForm((p) => ({ ...p, houseNumber: v }))}
              placeholder="e.g. A-204, Palm Heights"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* Area */}
            <FieldLabel label="Area / Locality" required />
            <TextInput
              style={styles.input}
              value={form.area}
              onChangeText={(v) => setForm((p) => ({ ...p, area: v }))}
              placeholder="e.g. Andheri West"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* Landmark */}
            <FieldLabel label="Landmark" />
            <TextInput
              style={styles.input}
              value={form.landmark}
              onChangeText={(v) => setForm((p) => ({ ...p, landmark: v }))}
              placeholder="e.g. Near City Mall"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* Pincode + City row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Pincode" required />
                <TextInput
                  style={styles.input}
                  value={form.pincode}
                  onChangeText={(v) =>
                    setForm((p) => ({
                      ...p,
                      pincode: v.replace(/\D/g, "").slice(0, 6),
                    }))
                  }
                  placeholder="6-digit code"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  editable={!isSaving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="City" required />
                <TextInput
                  style={styles.input}
                  value={form.city}
                  onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* State */}
            <FieldLabel label="State" required />
            <TextInput
              style={styles.input}
              value={form.state}
              onChangeText={(v) => setForm((p) => ({ ...p, state: v }))}
              placeholder="State"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            {/* Country */}
            <FieldLabel label="Country" required />
            <TextInput
              style={styles.input}
              value={form.country}
              onChangeText={(v) => setForm((p) => ({ ...p, country: v }))}
              placeholder="Country"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

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

  sectionHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(232,168,56,0.08)",
    borderLeftWidth: 3,
    borderLeftColor: P.gold,
    borderRadius: 12,
    padding: 14,
    margin: 18,
    marginBottom: 4,
  },
  sectionHintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#92400E",
    lineHeight: 18,
  },

  form: { paddingHorizontal: 18, paddingTop: 16, gap: 12 },

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
