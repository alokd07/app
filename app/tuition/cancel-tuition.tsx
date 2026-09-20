import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";

const REASONS = [
  "Teacher not suitable for child's learning style",
  "Schedule conflict / changed priorities",
  "Child no longer needs home tuition",
  "Moving location / address change",
  "Cost / Budget constraints",
  "Other reason",
];

export default function CancelTuitionScreen() {
  const { requestTuitionCancellation } = useTuitionStore();
  const [reason, setReason] = useState(REASONS[0]);

  const handleConfirmCancel = () => {
    requestTuitionCancellation("TUT-101", reason);

    Alert.alert(
      "Tuition Cancellation Requested",
      "Your cancellation request has been submitted. Our Parent Support team will process the end of billing cycle.",
      [
        {
          text: "View Status",
          onPress: () => router.replace("/(tabs)/tuition"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Home Tuition</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>Cancellation & Policy Terms</Text>
          <Text style={styles.policyDesc}>
            Tuition can be cancelled at any time before the next monthly billing cycle starts. Current ongoing month will remain active until month-end.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Cancellation Reason</Text>
        {REASONS.map((r) => {
          const isSelected = reason === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
              onPress={() => setReason(r)}
            >
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={isSelected ? "#EF4444" : "#94A3B8"}
              />
              <Text style={styles.reasonText}>{r}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleConfirmCancel}>
          <Text style={styles.cancelBtnText}>Request Tuition Cancellation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  policyCard: { backgroundColor: "#FEF2F2", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#FEE2E2", marginBottom: 20 },
  policyTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#991B1B" },
  policyDesc: { fontSize: 12, fontFamily: fonts.regular, color: "#B91C1C", marginTop: 4, lineHeight: 18 },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  reasonRowSelected: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  reasonText: { fontSize: 13, fontFamily: fonts.medium, color: "#0D1B2A", flex: 1 },

  cancelBtn: { backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 20 },
  cancelBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: fonts.bold },
});
