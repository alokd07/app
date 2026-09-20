import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";

export default function NotificationSettingsScreen() {
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [messages, setMessages] = useState(true);
  const [payments, setPayments] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Booking Requests & Updates</Text>
            <Text style={styles.toggleSub}>Notifications when tutor accepts or reschedules</Text>
          </View>
          <Switch value={bookingAlerts} onValueChange={setBookingAlerts} trackColor={{ false: "#D1D5DB", true: "#0D1B2A" }} />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Session Reminders</Text>
            <Text style={styles.toggleSub}>Alerts 30 mins before live class starts</Text>
          </View>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ false: "#D1D5DB", true: "#0D1B2A" }} />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Teacher Chat Messages</Text>
            <Text style={styles.toggleSub}>Alerts for new messages from your tutors</Text>
          </View>
          <Switch value={messages} onValueChange={setMessages} trackColor={{ false: "#D1D5DB", true: "#0D1B2A" }} />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Payment & Receipt Updates</Text>
            <Text style={styles.toggleSub}>Transaction receipts and refund confirmations</Text>
          </View>
          <Switch value={payments} onValueChange={setPayments} trackColor={{ false: "#D1D5DB", true: "#0D1B2A" }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 14 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  toggleLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  toggleSub: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
});
