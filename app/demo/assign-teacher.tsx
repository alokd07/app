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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["04:00 PM – 05:00 PM", "05:00 PM – 06:00 PM", "06:00 PM – 07:00 PM"];

export default function AssignTeacherScreen() {
  const { demoId } = useLocalSearchParams<{ demoId: string }>();
  const { demoRequests, assignTeacherFromDemo } = useTuitionStore();

  const demo = demoRequests.find((d) => d.id === demoId) || demoRequests[0];

  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("05:00 PM – 06:00 PM");

  const hourlyRate = 500;
  const classesPerWeek = selectedDays.length;
  const totalClassesPerMonth = classesPerWeek * 4;
  const calculatedMonthlyFee = totalClassesPerMonth * hourlyRate; // e.g. 3 * 4 * 500 = 6000

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must select at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleStartTuition = () => {
    assignTeacherFromDemo(
      demo.id,
      selectedDays,
      selectedTimeSlot,
      calculatedMonthlyFee
    );

    Alert.alert(
      "Teacher Assigned!",
      `${demo.teacherName} has been assigned to ${demo.childName} for ${demo.subject} home tuition. Regular classes start on schedule.`,
      [
        {
          text: "View Active Tuition",
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
        <Text style={styles.headerTitle}>Assign Home Tutor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Info Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTag}>ONGOING TUITION SETUP</Text>
          <Text style={styles.bannerTitle}>
            Assign {demo.teacherName} for {demo.childName}
          </Text>
          <Text style={styles.bannerSub}>Subject: {demo.subject} Home Tuition</Text>
        </View>

        {/* Schedule Days Selection */}
        <Text style={styles.sectionTitle}>1. Select Weekly Days</Text>
        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule Time Slot */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>2. Select Class Time Slot</Text>
        {TIME_SLOTS.map((slot) => {
          const isSelected = selectedTimeSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotRow, isSelected && styles.slotRowSelected]}
              onPress={() => setSelectedTimeSlot(slot)}
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

        {/* Monthly Billing Calculation Box */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>3. Monthly Fee Calculation</Text>
        <View style={styles.calcCard}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Classes per week</Text>
            <Text style={styles.calcVal}>{classesPerWeek} classes / week</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Total classes per month</Text>
            <Text style={styles.calcVal}>{totalClassesPerMonth} classes / month</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Hourly Rate</Text>
            <Text style={styles.calcVal}>₹{hourlyRate} / hour</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.calcRow}>
            <Text style={styles.totalLabel}>Calculated Monthly Fee</Text>
            <Text style={styles.totalVal}>₹{calculatedMonthlyFee.toLocaleString()}/month</Text>
          </View>

          <Text style={styles.calcNote}>
            *Monthly billing generated automatically on 1st of every month. First month is billed pro-rata from start date.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartTuition}>
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startText}>Start Tuition · ₹{calculatedMonthlyFee}/mo</Text>
            <Ionicons name="arrow-forward" size={18} color="#0D1B2A" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  bannerCard: { backgroundColor: "#0D1B2A", padding: 18, borderRadius: 16, marginBottom: 20 },
  bannerTag: { fontSize: 10, fontFamily: fonts.extraBold, color: "#E8A838", letterSpacing: 1, marginBottom: 4 },
  bannerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#FFFFFF" },
  bannerSub: { fontSize: 13, fontFamily: fonts.regular, color: "#94A3B8", marginTop: 2 },

  sectionTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 10 },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: { width: "31%", backgroundColor: "#FFFFFF", paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  dayChipSelected: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  dayText: { fontSize: 12, fontFamily: fonts.medium, color: "#475569" },
  dayTextSelected: { color: "#FFFFFF", fontFamily: fonts.bold },

  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  slotRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  slotText: { fontSize: 13, fontFamily: fonts.medium, color: "#0D1B2A" },

  calcCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  calcRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  calcLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B" },
  calcVal: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  totalLabel: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  totalVal: { fontSize: 18, fontFamily: fonts.bold, color: "#059669" },
  calcNote: { fontSize: 11, fontFamily: fonts.regular, color: "#94A3B8", marginTop: 10, lineHeight: 16 },

  footerBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  startBtn: { borderRadius: 14, overflow: "hidden" },
  btnGrad: { paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  startText: { color: "#0D1B2A", fontSize: 15, fontFamily: fonts.bold },
});
