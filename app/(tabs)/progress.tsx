import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";
import { useUserStore } from "../../src/store/userStore";

/* ── Design tokens (shared with Home) ── */
const C = {
  ink: "#0D1B2A",
  amber: "#E8A838",
  amberDeep: "#B7791F",
  amberTint: "#FFF7E6",
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#E8ECF1",
  track: "#EEF1F5",
  muted: "#64748B",
  faint: "#94A3B8",
  green: "#10B981",
  red: "#EF4444",
  orange: "#F59E0B",
};

const LOG_STATUS: Record<string, { text: string; color: string }> = {
  Completed: { text: "Completed", color: C.green },
  "Teacher Absent": { text: "Rescheduled", color: C.orange },
  "Student Absent": { text: "Student missed", color: C.red },
  Cancelled: { text: "Cancelled", color: C.muted },
};

const scoreColor = (p: number) =>
  p >= 80 ? C.green : p >= 60 ? C.orange : C.red;

export default function ProgressScreen() {
  const { children, activeChildId } = useUserStore();
  const activeChild =
    children.find((c) => c.id === activeChildId) || children[0];
  const { activeTuitions, getTestScoresForTuition, attendance } =
    useTuitionStore();

  const activeTuition = activeTuitions.find(
    (t) =>
      t.childId === activeChildId &&
      (t.status === "ACTIVE" || t.status === "PAUSED"),
  );

  const [selectedMonth] = useState("September 2026");
  const [showAllTests, setShowAllTests] = useState(false);

  /* ── Empty state ── */
  if (!activeTuition) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bar-chart-outline" size={32} color={C.amberDeep} />
          </View>
          <Text style={styles.emptyTitle}>No active tuition</Text>
          <Text style={styles.emptySubtitle}>
            Assign a teacher to start tracking progress.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/(tabs)/find-teacher")}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Find a teacher</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scores = getTestScoresForTuition(activeTuition.id);
  const tuitionAttendance = attendance[activeTuition.id] || [];
  const visibleScores = showAllTests ? scores : scores.slice(0, 2);

  const topicPerformance = [
    { name: "Algebra", score: 81 },
    { name: "Linear Equations", score: 72 },
    { name: "Geometry", score: 88 },
    { name: "Number Theory", score: 65 },
  ];

  // Hardcoded for September 2026 (Sept 1 is a Tuesday → offset 1 with Monday start)
  const daysInMonth = 30;
  const startDayOfWeek = 1;

  const heatmapDays: { date: number; status: string }[] = [];
  for (let i = 0; i < startDayOfWeek; i++)
    heatmapDays.push({ date: 0, status: "empty" });

  for (let i = 1; i <= daysInMonth; i++) {
    let status = "none";
    const dateStr = `2026-09-${i.toString().padStart(2, "0")}`;
    const record = tuitionAttendance.find((r) => r.date.startsWith(dateStr));
    if (record) {
      if (record.status === "Completed") status = "completed";
      else if (record.status === "Teacher Absent") status = "rescheduled";
      else if (record.status === "Student Absent") status = "absent";
      else if (record.status === "Cancelled") status = "cancelled";
    }
    heatmapDays.push({ date: i, status });
  }

  const heatColor = (status: string) => {
    switch (status) {
      case "completed":
        return C.green;
      case "absent":
        return C.red;
      case "rescheduled":
        return C.orange;
      case "cancelled":
        return C.faint;
      case "none":
        return C.track;
      default:
        return "transparent";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>
              {activeChild?.name} · Grade {activeChild?.grade}
            </Text>
          </View>
          <View style={styles.teacherChip}>
            <Image
              source={{
                uri:
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(activeTuition.teacherName) +
                  "&background=0D1B2A&color=fff",
              }}
              style={styles.teacherAvatar}
            />
            <Text style={styles.teacherName}>
              {activeTuition.teacherName.split(" ")[0]} Sir
            </Text>
          </View>
        </View>

        {/* ── Summary: stats + next class in one card ── */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Classes this month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: C.green }]}>83%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>10 hrs</Text>
              <Text style={styles.statLabel}>Teaching hours</Text>
            </View>
          </View>

          <View style={styles.nextClass}>
            <View style={styles.nextIcon}>
              <Ionicons name="time-outline" size={20} color={C.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextTitle}>Next class · Today, 5:00 PM</Text>
              <Text style={styles.nextSub}>{activeTuition.subject}</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Test scores ── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Test scores</Text>
          {scores.length > 2 && (
            <TouchableOpacity
              onPress={() => setShowAllTests((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>
                {showAllTests ? "Show less" : `See all ${scores.length}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {visibleScores.map((score, index) => {
          const pct = Math.round((score.score / score.maxScore) * 100);
          const color = scoreColor(pct);
          return (
            <View key={index} style={[styles.card, styles.testCard]}>
              <View style={styles.testTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName} numberOfLines={1}>
                    {score.testName}
                  </Text>
                  <Text style={styles.testDate}>
                    {new Date(score.conductedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.scoreWrap}>
                  <Text style={styles.scoreLarge}>
                    {score.score}
                    <Text style={styles.scoreMax}>/{score.maxScore}</Text>
                  </Text>
                  {score.trend === "up" && (
                    <Ionicons name="trending-up" size={18} color={C.green} />
                  )}
                  {score.trend === "down" && (
                    <Ionicons name="trending-down" size={18} color={C.red} />
                  )}
                  {score.trend === "same" && (
                    <Ionicons name="remove" size={18} color={C.faint} />
                  )}
                </View>
              </View>

              <View style={styles.barRow}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={[styles.pct, { color }]}>{pct}%</Text>
              </View>

              {score.topicsAssessed?.length > 0 && (
                <Text style={styles.topics} numberOfLines={1}>
                  {score.topicsAssessed.join(" · ")}
                </Text>
              )}

              {score.teacherRemark ? (
                <View style={styles.remark}>
                  <Text style={styles.remarkText}>"{score.teacherRemark}"</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {/* ── Subject breakdown ── */}
        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Strengths by topic
        </Text>
        <View style={styles.card}>
          {topicPerformance.map((t, i) => (
            <View
              key={t.name}
              style={[
                styles.topicRow,
                i === topicPerformance.length - 1 && { marginBottom: 0 },
              ]}
            >
              <Text style={styles.topicName} numberOfLines={1}>
                {t.name}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${t.score}%`,
                      backgroundColor: scoreColor(t.score),
                    },
                  ]}
                />
              </View>
              <Text style={styles.topicScore}>{t.score}%</Text>
            </View>
          ))}
        </View>

        {/* ── Attendance ── */}
        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Attendance · {selectedMonth}
        </Text>
        <View style={styles.card}>
          <View style={styles.dayHeaderRow}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <Text key={i} style={styles.dayHeader}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {heatmapDays.map((day, i) => (
              <View key={i} style={styles.cellWrap}>
                {day.date !== 0 && (
                  <View
                    style={[
                      styles.cell,
                      { backgroundColor: heatColor(day.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        { color: day.status === "none" ? C.muted : "#FFF" },
                      ]}
                    >
                      {day.date}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            {[
              { c: C.green, t: "Done" },
              { c: C.red, t: "Absent" },
              { c: C.orange, t: "Rescheduled" },
              { c: C.faint, t: "Cancelled" },
            ].map((l) => (
              <View key={l.t} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.c }]} />
                <Text style={styles.legendText}>{l.t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Teaching log ── */}
        {tuitionAttendance.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.sectionGap]}>
              Teaching log
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.logList}
              style={styles.logScroll}
            >
              {tuitionAttendance.map((record, index) => {
                const d = new Date(record.date);
                const dateStr = d.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const st = LOG_STATUS[record.status] || {
                  text: record.status,
                  color: C.muted,
                };
                return (
                  <View key={index} style={styles.logCard}>
                    <Text style={styles.logDate}>{dateStr}</Text>
                    <View style={styles.logStatusRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: st.color },
                        ]}
                      />
                      <Text style={[styles.logStatus, { color: st.color }]}>
                        {st.text}
                      </Text>
                    </View>
                    <Text style={styles.logTime}>5:00 PM – 6:00 PM</Text>
                    {record.notes ? (
                      <Text style={styles.logNotes} numberOfLines={2}>
                        {record.notes}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 28 : 12,
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: C.muted,
    marginTop: 2,
  },
  teacherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: 999,
    ...softShadow,
  },
  teacherAvatar: { width: 28, height: 28, borderRadius: 14 },
  teacherName: { fontFamily: fonts.semiBold, fontSize: 13, color: C.ink },

  /* Cards */
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    ...softShadow,
  },

  /* Summary */
  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center" },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: C.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
    textAlign: "center",
  },
  statDivider: { width: 1, height: 32, backgroundColor: C.line },
  nextClass: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
  },
  nextTitle: { fontFamily: fonts.bold, fontSize: 14, color: C.ink },
  nextSub: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  viewBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  viewBtnText: { fontFamily: fonts.bold, fontSize: 13, color: "#FFFFFF" },

  /* Sections */
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: C.ink,
    letterSpacing: -0.3,
  },
  sectionGap: { marginTop: 28, marginBottom: 14 },
  link: { fontFamily: fonts.semiBold, fontSize: 14, color: C.amberDeep },

  /* Tests */
  testCard: { marginBottom: 12 },
  testTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  testName: { fontFamily: fonts.bold, fontSize: 15, color: C.ink },
  testDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
  },
  scoreWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreLarge: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: C.ink,
    letterSpacing: -0.5,
  },
  scoreMax: { fontFamily: fonts.semiBold, fontSize: 14, color: C.faint },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.track,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  pct: { fontFamily: fonts.bold, fontSize: 13, width: 40, textAlign: "right" },
  topics: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
    marginTop: 12,
  },
  remark: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
  },
  remarkText: {
    fontFamily: fonts.medium,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 19,
    color: "#5B4A1F",
  },

  /* Topics */
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  topicName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: C.ink,
    width: 112,
  },
  topicScore: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.ink,
    width: 36,
    textAlign: "right",
  },

  /* Heatmap */
  dayHeaderRow: { flexDirection: "row", marginBottom: 8 },
  dayHeader: {
    width: "14.2857%",
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: C.faint,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: "14.2857%", aspectRatio: 1, padding: 2 },
  cell: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: { fontFamily: fonts.medium, fontSize: 12 },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 16,
    rowGap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.regular, fontSize: 12, color: C.muted },

  /* Log */
  logScroll: { marginHorizontal: -20 },
  logList: { paddingHorizontal: 20, gap: 12, paddingBottom: 12 },
  logCard: {
    width: 200,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    ...softShadow,
  },
  logDate: { fontFamily: fonts.bold, fontSize: 14, color: C.ink },
  logStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  logStatus: { fontFamily: fonts.semiBold, fontSize: 12 },
  logTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 8,
  },
  logNotes: {
    fontFamily: fonts.regular,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
    marginTop: 8,
  },

  /* Empty */
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: C.ink,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: { fontFamily: fonts.bold, fontSize: 15, color: C.ink },
});
