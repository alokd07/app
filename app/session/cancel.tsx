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

const CANCEL_REASONS = [
  "Schedule conflict",
  "Teacher requested cancellation",
  "Found another tutor",
  "Health reason",
  "Other reason",
];

export default function CancelSessionScreen() {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);

  const handleCancel = () => {
    Alert.alert(
      "Session Cancelled",
      "Your session has been cancelled. 100% refund of ₹750 has been processed to your original payment method.",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/sessions") }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cancellation Policy & Refund</Text>
          <Text style={styles.cardDesc}>
            Free cancellation up to 24 hours before session start.
          </Text>
          <View style={styles.refundRow}>
            <Text style={styles.refundLabel}>Eligible Refund Amount:</Text>
            <Text style={styles.refundVal}>₹750 (100% Full Refund)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Reason for Cancellation</Text>
        {CANCEL_REASONS.map((r) => {
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

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Confirm Cancellation</Text>
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

  card: { backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#A7F3D0", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#065F46" },
  cardDesc: { fontSize: 12, fontFamily: fonts.regular, color: "#047857", marginTop: 2 },
  refundRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#A7F3D0" },
  refundLabel: { fontSize: 13, fontFamily: fonts.medium, color: "#065F46" },
  refundVal: { fontSize: 14, fontFamily: fonts.bold, color: "#059669" },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  reasonRowSelected: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  reasonText: { fontSize: 14, fontFamily: fonts.medium, color: "#0D1B2A" },

  cancelBtn: { backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 24 },
  cancelBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: fonts.bold },
});
