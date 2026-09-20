import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";

export default function AttendanceScreen() {
  const { attendance } = useTuitionStore();
  const records = attendance["TUT-101"] || [];

  const completedCount = records.filter((r) => r.status === "Completed").length;
  const teacherAbsentCount = records.filter((r) => r.status === "Teacher Absent").length;
  const studentAbsentCount = records.filter((r) => r.status === "Student Absent").length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance & Class Log</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Monthly Summary Box */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>September 2026 Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{records.length}</Text>
              <Text style={styles.statLabel}>Total Scheduled</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: "#059669" }]}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: "#D97706" }]}>{teacherAbsentCount}</Text>
              <Text style={styles.statLabel}>Teacher Rescheduled</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Class History Log</Text>
        {records.map((rec, idx) => (
          <View key={idx} style={styles.logCard}>
            <View style={styles.dateCol}>
              <Text style={styles.dateText}>{rec.date.split("-")[2]}</Text>
              <Text style={styles.dayText}>{rec.dayName}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.statusRow}>
                <Text style={styles.classTitle}>Home Tuition Class</Text>
                <View
                  style={[
                    styles.statusPill,
                    rec.status === "Completed" && styles.statusCompleted,
                    rec.status === "Teacher Absent" && styles.statusTeacherAbsent,
                    rec.status === "Student Absent" && styles.statusStudentAbsent,
                  ]}
                >
                  <Text style={styles.statusPillText}>{rec.status}</Text>
                </View>
              </View>
              {rec.notes && <Text style={styles.notesText}>Note: {rec.notes}</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
  summaryTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 20, fontFamily: fonts.bold, color: "#0D1B2A" },
  statLabel: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B", marginTop: 2, textAlign: "center" },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  logCard: { flexDirection: "row", gap: 14, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  dateCol: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  dateText: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  dayText: { fontSize: 10, fontFamily: fonts.medium, color: "#64748B" },

  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  classTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusCompleted: { backgroundColor: "#ECFDF5" },
  statusTeacherAbsent: { backgroundColor: "#FEF3C7" },
  statusStudentAbsent: { backgroundColor: "#FEE2E2" },
  statusPillText: { fontSize: 10, fontFamily: fonts.bold, color: "#0D1B2A" },
  notesText: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 4 },
});
