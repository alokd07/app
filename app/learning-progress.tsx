import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColors } from "../src/theme/colors";

const P = {
  ...appColors,
  blue: appColors.infoLight,
  bluePale: appColors.infoPale,
  blueBorder: appColors.infoBorder,
};

const { width: SW } = Dimensions.get("window");

// ─── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Certificates",
    value: 6,
    total: 15,
    color: P.gold,
    icon: "ribbon-outline" as const,
  },
  {
    label: "Courses",
    value: 8,
    total: 15,
    color: P.blue,
    icon: "book-outline" as const,
  },
  {
    label: "Exams Passed",
    value: 35,
    total: 47,
    color: P.success,
    icon: "checkmark-done-outline" as const,
  },
  {
    label: "Sessions",
    value: 12,
    total: 20,
    color: P.purple,
    icon: "calendar-outline" as const,
  },
];

const RECENT_ACTIVITY = [
  {
    id: "a1",
    type: "session",
    title: "Mathematics — Ananya Sharma",
    sub: "Completed · 1 hr",
    time: "Today",
    icon: "school-outline" as const,
    color: P.gold,
  },
  {
    id: "a2",
    type: "exam",
    title: "Physics Unit Test",
    sub: "Score: 88/100",
    time: "Yesterday",
    icon: "clipboard-outline" as const,
    color: P.success,
  },
  {
    id: "a3",
    type: "certificate",
    title: "Algebra Fundamentals",
    sub: "Certificate earned",
    time: "2 days ago",
    icon: "ribbon-outline" as const,
    color: P.blue,
  },
  {
    id: "a4",
    type: "session",
    title: "English Literature — Priya",
    sub: "Completed · 1.5 hr",
    time: "3 days ago",
    icon: "school-outline" as const,
    color: P.gold,
  },
  {
    id: "a5",
    type: "exam",
    title: "Chemistry Mock Exam",
    sub: "Score: 74/100",
    time: "4 days ago",
    icon: "clipboard-outline" as const,
    color: P.success,
  },
  {
    id: "a6",
    type: "course",
    title: "Introduction to Trigonometry",
    sub: "Course completed",
    time: "5 days ago",
    icon: "book-outline" as const,
    color: P.purple,
  },
];

const WEEK_SESSIONS = [
  { day: "Mon", sessions: 2, height: 0.8 },
  { day: "Tue", sessions: 1, height: 0.4 },
  { day: "Wed", sessions: 3, height: 1.0 },
  { day: "Thu", sessions: 0, height: 0.0 },
  { day: "Fri", sessions: 2, height: 0.65 },
  { day: "Sat", sessions: 1, height: 0.35 },
  { day: "Sun", sessions: 0, height: 0.0 },
];

const SUBJECTS = [
  { name: "Mathematics", sessions: 6, pct: 0.82, color: P.gold },
  { name: "Physics", sessions: 3, pct: 0.58, color: P.blue },
  { name: "English Literature", sessions: 2, pct: 0.4, color: P.success },
  { name: "Chemistry", sessions: 1, pct: 0.22, color: P.purple },
];

const BADGES = [
  {
    id: "b1",
    icon: "flame-outline" as const,
    label: "7-Day Streak",
    earned: true,
    color: P.gold,
  },
  {
    id: "b2",
    icon: "trophy-outline" as const,
    label: "Top Performer",
    earned: true,
    color: P.blue,
  },
  {
    id: "b3",
    icon: "ribbon-outline" as const,
    label: "Certified Pro",
    earned: true,
    color: P.success,
  },
  {
    id: "b4",
    icon: "star-outline" as const,
    label: "Perfect Score",
    earned: false,
    color: P.gold,
  },
  {
    id: "b5",
    icon: "rocket-outline" as const,
    label: "30-Day Streak",
    earned: false,
    color: P.purple,
  },
  {
    id: "b6",
    icon: "school-outline" as const,
    label: "20 Sessions",
    earned: false,
    color: P.blue,
  },
];

// ─── Animated Arc Progress ────────────────────────────────────────────────────
function ArcProgress({
  pct,
  color,
  size = 100,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, []);

  const strokeW = 8;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Track circle */}
      <View
        style={{
          position: "absolute",
          width: size - strokeW,
          height: size - strokeW,
          borderRadius: (size - strokeW) / 2,
          borderWidth: strokeW,
          borderColor: P.border,
        }}
      />
      {/* Filled arc — fake via rotation trick */}
      <Animated.View
        style={{
          position: "absolute",
          width: size - strokeW,
          height: size - strokeW,
          borderRadius: (size - strokeW) / 2,
          borderWidth: strokeW,
          borderColor: color,
          borderRightColor: "transparent",
          borderBottomColor: anim.interpolate({
            inputRange: [0, 50, 100],
            outputRange: ["transparent", "transparent", color],
          }) as any,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      <Text
        style={{ fontSize: 15, fontFamily: "Manrope_700Bold", color: P.ink }}
      >
        {Math.round(pct)}%
      </Text>
    </View>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ stat, delay }: { stat: (typeof STATS)[0]; delay: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const transY = useRef(new Animated.Value(20)).current;
  const barW = useRef(new Animated.Value(0)).current;

  const pct = Math.round((stat.value / stat.total) * 100);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(transY, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(barW, {
        toValue: pct,
        duration: 900,
        delay: delay + 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const barWidth = barW.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.statCard,
        { opacity: fade, transform: [{ translateY: transY }] },
      ]}
    >
      <View
        style={[
          styles.statCardIcon,
          {
            backgroundColor: stat.color + "18",
            borderColor: stat.color + "40",
          },
        ]}
      >
        <Ionicons name={stat.icon} size={18} color={stat.color} />
      </View>
      <View style={styles.statCardBody}>
        <View style={styles.statCardTopRow}>
          <Text style={styles.statCardLabel}>{stat.label}</Text>
          <Text style={styles.statCardFraction}>
            <Text style={[styles.statCardValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statCardTotal}> / {stat.total}</Text>
          </Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: barWidth, backgroundColor: stat.color },
            ]}
          />
        </View>
        <Text style={styles.statCardPct}>{pct}% complete</Text>
      </View>
    </Animated.View>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────
const BAR_MAX_H = 80;

function WeeklyChart() {
  const barAnims = useRef(
    WEEK_SESSIONS.map(() => new Animated.Value(0)),
  ).current;
  const today = new Date().getDay(); // 0=Sun,1=Mon…

  useEffect(() => {
    WEEK_SESSIONS.forEach((d, i) => {
      Animated.timing(barAnims[i], {
        toValue: d.height,
        duration: 600,
        delay: 300 + i * 60,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  return (
    <View style={styles.chartWrap}>
      {WEEK_SESSIONS.map((d, i) => {
        const isToday = i === (today === 0 ? 6 : today - 1);
        const barH = barAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [3, BAR_MAX_H],
        });
        return (
          <View key={d.day} style={styles.chartCol}>
            {d.sessions > 0 && (
              <Text style={styles.chartCount}>{d.sessions}</Text>
            )}
            <Animated.View
              style={[
                styles.chartBar,
                {
                  height: d.height === 0 ? 3 : barH,
                  backgroundColor: isToday
                    ? P.gold
                    : d.sessions > 0
                      ? P.navy
                      : P.border,
                },
              ]}
            />
            <Text
              style={[
                styles.chartDay,
                isToday && { color: P.gold, fontFamily: "Manrope_700Bold" },
              ]}
            >
              {d.day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Subject Bar ──────────────────────────────────────────────────────────────
function SubjectBar({
  sub,
  delay,
}: {
  sub: (typeof SUBJECTS)[0];
  delay: number;
}) {
  const barW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barW, {
      toValue: sub.pct,
      duration: 900,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);
  const width = barW.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.subjectRow}>
      <View style={styles.subjectLeft}>
        <View style={[styles.subjectDot, { backgroundColor: sub.color }]} />
        <Text style={styles.subjectName} numberOfLines={1}>
          {sub.name}
        </Text>
      </View>
      <View style={styles.subjectBarTrack}>
        <Animated.View
          style={[styles.subjectBarFill, { width, backgroundColor: sub.color }]}
        />
      </View>
      <Text style={styles.subjectSessions}>{sub.sessions}</Text>
    </View>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ item }: { item: (typeof RECENT_ACTIVITY)[0] }) {
  return (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          {
            backgroundColor: item.color + "18",
            borderColor: item.color + "40",
          },
        ]}
      >
        <Ionicons name={item.icon} size={15} color={item.color} />
      </View>
      <View style={styles.activityTexts}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activitySub}>{item.sub}</Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ badge }: { badge: (typeof BADGES)[0] }) {
  return (
    <View style={[styles.badge, !badge.earned && styles.badgeLocked]}>
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: badge.earned ? badge.color + "18" : P.inputBg,
            borderColor: badge.earned ? badge.color + "40" : P.border,
          },
        ]}
      >
        <Ionicons
          name={badge.icon}
          size={20}
          color={badge.earned ? badge.color : P.muted}
        />
        {!badge.earned && (
          <View style={styles.badgeLockOverlay}>
            <Ionicons name="lock-closed" size={10} color={P.muted} />
          </View>
        )}
      </View>
      <Text
        style={[styles.badgeLabel, !badge.earned && { color: P.muted }]}
        numberOfLines={2}
      >
        {badge.label}
      </Text>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
  action,
  onAction,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.scard}>
      <View style={styles.sinnercard}>
        <View style={styles.scardHeader}>
          <View style={styles.scardHeaderLeft}>
            <View style={styles.scardIconBox}>
              <Ionicons name={icon} size={13} color={P.gold} />
            </View>
            <Text style={styles.scardTitle}>{title}</Text>
          </View>
          {action && (
            <TouchableOpacity onPress={onAction} activeOpacity={0.8}>
              <Text style={styles.scardAction}>{action}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.scardBody}>{children}</View>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LearningProgress() {
  const [tab, setTab] = useState<"week" | "month" | "all">("week");

  // Hero counters entrance
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroTransY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(heroTransY, {
        toValue: 0,
        tension: 55,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalPct = Math.round(
    STATS.reduce((s, st) => s + (st.value / st.total) * 100, 0) / STATS.length,
  );

  return (
    <SafeAreaView style={styles.root} edges={["left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Hero Overview Banner ── */}
        <LinearGradient
          colors={["#FFFFFF", "#F8F0DE", "#F6E8CE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroRail} />
          <View style={styles.heroOrb} />
          <View style={styles.heroOrb2} />

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: heroFade, transform: [{ translateY: heroTransY }] },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroKicker}>Learning Index</Text>
                <Text style={styles.heroHeadline}>{totalPct}% on track</Text>
              </View>
              <View style={styles.heroWeekPill}>
                <Ionicons name="flash" size={12} color={P.gold} />
                <Text style={styles.heroWeekPillText}>Week Focus</Text>
              </View>
            </View>

            <View style={styles.heroMainRow}>
              <ArcProgress pct={totalPct} color={P.navy} size={96} />

              <View style={styles.heroCounters}>
                <Text style={styles.heroOverallLabel}>Performance Split</Text>
                <View style={styles.heroStatRow}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNum}>{STATS[0].value}</Text>
                    <Text style={styles.heroStatLabel}>Certs</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNum}>{STATS[1].value}</Text>
                    <Text style={styles.heroStatLabel}>Courses</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNum}>{STATS[2].value}</Text>
                    <Text style={styles.heroStatLabel}>Exams</Text>
                  </View>
                </View>

                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={13} color={P.navy} />
                  <Text style={styles.streakPillText}>
                    4 day learning streak
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.heroQuickRow}>
              <View style={styles.heroQuickCard}>
                <Text style={styles.heroQuickValue}>{STATS[3].value}</Text>
                <Text style={styles.heroQuickLabel}>Sessions</Text>
              </View>
              <View style={styles.heroQuickCard}>
                <Text style={styles.heroQuickValue}>9</Text>
                <Text style={styles.heroQuickLabel}>This Week</Text>
              </View>
              <View style={styles.heroQuickCard}>
                <Text style={styles.heroQuickValue}>88%</Text>
                <Text style={styles.heroQuickLabel}>Best Score</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── Tab Row ── */}
        <View style={styles.tabRowShell}>
          <View style={styles.tabRow}>
            {(["week", "month", "all"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    tab === t && styles.tabBtnTextActive,
                  ]}
                >
                  {t === "week"
                    ? "This Week"
                    : t === "month"
                      ? "This Month"
                      : "All Time"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Stat Cards ── */}
        <SectionCard title="Goals Tracker" icon="flag-outline">
          {STATS.map((st, i) => (
            <StatCard key={st.label} stat={st} delay={i * 80} />
          ))}
        </SectionCard>

        {/* ── Weekly Activity Chart ── */}
        <SectionCard title="Sessions This Week" icon="bar-chart-outline">
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTotal}>
              <Text style={{ color: P.navy, fontFamily: "Manrope_700Bold" }}>
                9
              </Text>{" "}
              sessions completed
            </Text>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: P.gold }]} />
              <Text style={styles.legendLabel}>Today</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: P.navy, marginLeft: 10 },
                ]}
              />
              <Text style={styles.legendLabel}>Sessions</Text>
            </View>
          </View>
          <WeeklyChart />
        </SectionCard>

        {/* ── Subjects Breakdown ── */}
        <SectionCard title="Subject Breakdown" icon="book-outline">
          <View style={styles.subjectTableHeader}>
            <Text style={styles.subjectTableHeaderText}>Subject</Text>
            <Text style={[styles.subjectTableHeaderText, { marginRight: 28 }]}>
              Sessions
            </Text>
          </View>
          {SUBJECTS.map((s, i) => (
            <SubjectBar key={s.name} sub={s} delay={200 + i * 100} />
          ))}
        </SectionCard>

        {/* ── Badges ── */}
        <SectionCard
          title="Achievements"
          icon="trophy-outline"
          action="See all"
          onAction={() => {}}
        >
          <View style={styles.badgesGrid}>
            {BADGES.map((b) => (
              <Badge key={b.id} badge={b} />
            ))}
          </View>
        </SectionCard>

        {/* ── Recent Activity ── */}
        <SectionCard
          title="Recent Activity"
          icon="time-outline"
          action="View all"
          onAction={() => {}}
        >
          {RECENT_ACTIVITY.map((item, i) => (
            <React.Fragment key={item.id}>
              <ActivityItem item={item} />
              {i < RECENT_ACTIVITY.length - 1 && (
                <View style={styles.activityDivider} />
              )}
            </React.Fragment>
          ))}
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },
  scroll: { paddingBottom: 24 },

  // Nav
  nav: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    letterSpacing: 2,
    color: P.gold,
    textTransform: "uppercase",
    marginBottom: 2,
    textAlign: "center",
  },
  navTitle: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: P.ink,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  navSubline: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    textAlign: "center",
    marginTop: 1,
  },

  // Hero
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
  },
  heroRail: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 6,
    backgroundColor: P.navy,
  },
  heroOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(232,168,56,0.11)",
    top: -70,
    right: -45,
  },
  heroOrb2: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(13,27,42,0.05)",
    bottom: -25,
    left: 45,
  },
  heroContent: { gap: 14 },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroKicker: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroHeadline: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Manrope_800ExtraBold",
    color: P.ink,
    marginTop: 2,
  },
  heroWeekPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(13,27,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.1)",
  },
  heroWeekPillText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
  },
  heroMainRow: { flexDirection: "row", alignItems: "center", gap: 14 },

  heroCounters: { flex: 1 },
  heroOverallLabel: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  heroStatRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  heroStat: { alignItems: "center", flex: 1 },
  heroStatNum: {
    fontSize: 21,
    fontFamily: "Manrope_800ExtraBold",
    color: P.navy,
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
    marginTop: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(13,27,42,0.1)",
  },

  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(232,168,56,0.16)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.35)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakPillText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
  },
  heroQuickRow: {
    flexDirection: "row",
    gap: 8,
  },
  heroQuickCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  heroQuickValue: {
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
    color: P.ink,
  },
  heroQuickLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
    marginTop: 2,
  },

  // Tabs
  tabRowShell: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
    borderRadius: 14,
    padding: 5,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: P.navy },
  tabBtnText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
  },
  tabBtnTextActive: { color: P.white },

  // Section card
  scard: {
    backgroundColor: "rgba(255,255,255,0.88)",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
    overflow: "hidden",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 1.5,
  },
  sinnercard: {
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  scardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(13,27,42,0.07)",
  },
  scardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  scardIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "rgba(232,168,56,0.16)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  scardTitle: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.ink },
  scardAction: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
  },
  scardBody: { padding: 16 },

  // Stat card
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(13,27,42,0.07)",
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statCardBody: { flex: 1 },
  statCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statCardLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
  },
  statCardFraction: { fontSize: 13 },
  statCardValue: { fontFamily: "Manrope_700Bold" },
  statCardTotal: { fontFamily: "Manrope_400Regular", color: P.muted },
  barTrack: {
    height: 6,
    backgroundColor: "rgba(13,27,42,0.09)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: { height: "100%", borderRadius: 3 },
  statCardPct: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
  },
  // Chart
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chartTotal: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
  },
  chartLegend: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    marginLeft: 4,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: BAR_MAX_H + 40,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  chartBar: { width: 20, borderRadius: 6 },
  chartCount: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
  },
  chartDay: { fontSize: 10, fontFamily: "Manrope_500Medium", color: P.muted },

  // Subject
  subjectTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subjectTableHeaderText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    width: 130,
  },
  subjectDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  subjectName: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
    flex: 1,
  },
  subjectBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(13,27,42,0.09)",
    borderRadius: 3,
    overflow: "hidden",
  },
  subjectBarFill: { height: "100%", borderRadius: 3 },
  subjectSessions: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
    width: 20,
    textAlign: "right",
  },

  // Badges
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badge: {
    width: (SW - 40 - 32 - 24) / 3,
    alignItems: "center",
    gap: 8,
  },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeLockOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: P.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
    textAlign: "center",
  },

  // Activity
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityTexts: { flex: 1 },
  activityTitle: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
    marginBottom: 2,
  },
  activitySub: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
  },
  activityTime: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    flexShrink: 0,
  },
  activityDivider: { height: 1, backgroundColor: "rgba(13,27,42,0.08)" },
});
