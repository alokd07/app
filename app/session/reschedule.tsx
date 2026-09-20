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

const RESCHEDULE_SLOTS = [
  "09:00 AM - 10:00 AM",
  "11:00 AM - 12:00 PM",
  "03:00 PM - 04:00 PM",
  "05:00 PM - 06:00 PM",
  "07:00 PM - 08:00 PM",
];

export default function RescheduleSessionScreen() {
  const [selectedSlot, setSelectedSlot] = useState(RESCHEDULE_SLOTS[2]);
  const [requested, setRequested] = useState(false);

  const handleRequest = () => {
    setRequested(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule Session</Text>
        <View style={{ width: 40 }} />
      </View>

      {requested ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={60} color="#059669" />
          <Text style={styles.successTitle}>Reschedule Request Sent</Text>
          <Text style={styles.successSub}>
            Your teacher has been notified of the requested new time slot: {selectedSlot}.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/(tabs)/sessions")}>
            <Text style={styles.doneText}>View Sessions</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Session Time</Text>
            <Text style={styles.cardVal}>Monday, Sep 21 · 05:00 PM - 06:00 PM</Text>
          </View>

          <Text style={styles.sectionTitle}>Select New Available Time Slot</Text>
          {RESCHEDULE_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.slotRow, isSelected && styles.slotRowSelected]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "time-outline"}
                  size={20}
                  color={isSelected ? "#0D1B2A" : "#94A3B8"}
                />
                <Text style={styles.slotText}>{slot}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.submitBtn} onPress={handleRequest}>
            <Text style={styles.submitText}>Submit Reschedule Request</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  card: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
  cardLabel: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B" },
  cardVal: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 4 },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  slotRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  slotText: { fontSize: 14, fontFamily: fonts.medium, color: "#0D1B2A" },

  submitBtn: { backgroundColor: "#E8A838", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 20 },
  submitText: { color: "#0D1B2A", fontSize: 15, fontFamily: fonts.bold },

  successBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  successTitle: { fontSize: 20, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 14 },
  successSub: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", marginTop: 6 },
  doneBtn: { marginTop: 20, backgroundColor: "#0D1B2A", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  doneText: { color: "#FFFFFF", fontSize: 14, fontFamily: fonts.bold },
});
