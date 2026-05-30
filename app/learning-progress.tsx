import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "../src/theme/colors";

const { width: SW } = Dimensions.get("window");

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#020817",
  navyMid: "#0F172A",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldSoft: "rgba(232,168,56,0.12)",
  goldBorder: "rgba(232,168,56,0.28)",
  indigo: "#6366F1",
  indigoSoft: "rgba(99,102,241,0.12)",
  teal: "#14B8A6",
  tealSoft: "rgba(20,184,166,0.12)",
  emerald: "#10B981",
  emeraldSoft: "rgba(16,185,129,0.12)",
  rose: "#F43F5E",
  roseSoft: "rgba(244,63,94,0.12)",
  sky: "#0EA5E9",
  skySoft: "rgba(14,165,233,0.12)",
  violet: "#8B5CF6",
  violetSoft: "rgba(139,92,246,0.12)",
  white: "#FFFFFF",
  ink: "#111827",
  slate: "#374151",
  muted: "#9CA3AF",
  bg: "#F5F6FA",
  card: "#FFFFFF",
  border: "#F3F4F6",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Certificates",
    value: 6,
    total: 15,
    color: C.gold,
    bg: C.goldSoft,
    icon: "ribbon" as const,
  },
  {
    label: "Courses",
    value: 8,
    total: 15,
    color: C.indigo,
    bg: C.indigoSoft,
    icon: "book" as const,
  },
  {
    label: "Exams Passed",
    value: 35,
    total: 47,
    color: C.emerald,
    bg: C.emeraldSoft,
    icon: "checkmark-done" as const,
  },
  {
    label: "Sessions",
    value: 12,
    total: 20,
    color: C.sky,
    bg: C.skySoft,
    icon: "calendar" as const,
  },
];

const WEEK_DATA = [
  { day: "Mon", sessions: 2, pct: 0.8 },
  { day: "Tue", sessions: 1, pct: 0.4 },
  { day: "Wed", sessions: 3, pct: 1.0 },
  { day: "Thu", sessions: 0, pct: 0.0 },
  { day: "Fri", sessions: 2, pct: 0.65 },
  { day: "Sat", sessions: 1, pct: 0.35 },
  { day: "Sun", sessions: 0, pct: 0.0 },
];

const SUBJECTS = [
  { name: "Mathematics", sessions: 6, pct: 0.82, color: C.gold },
  { name: "Physics", sessions: 3, pct: 0.58, color: C.indigo },
  { name: "English Lit.", sessions: 2, pct: 0.4, color: C.emerald },
  { name: "Chemistry", sessions: 1, pct: 0.22, color: C.violet },
];

const BADGES = [
  {
    id: "b1",
    icon: "flame" as const,
    label: "7-Day Streak",
    earned: true,
    color: C.gold,
    bg: C.goldSoft,
  },
  {
    id: "b2",
    icon: "trophy" as const,
    label: "Top Performer",
    earned: true,
    color: C.indigo,
    bg: C.indigoSoft,
  },
  {
    id: "b3",
    icon: "ribbon" as const,
    label: "Certified Pro",
    earned: true,
    color: C.emerald,
    bg: C.emeraldSoft,
  },
  {
    id: "b4",
    icon: "star" as const,
    label: "Perfect Score",
    earned: false,
    color: C.gold,
    bg: C.goldSoft,
  },
  {
    id: "b5",
    icon: "rocket" as const,
    label: "30-Day Streak",
    earned: false,
    color: C.violet,
    bg: C.violetSoft,
  },
  {
    id: "b6",
    icon: "school" as const,
    label: "20 Sessions",
    earned: false,
    color: C.sky,
    bg: C.skySoft,
  },
];

const ACTIVITY = [
  {
    id: "a1",
    title: "Mathematics — Ananya Sharma",
    sub: "Completed · 1 hr",
    time: "Today",
    icon: "school" as const,
    color: C.gold,
    bg: C.goldSoft,
  },
  {
    id: "a2",
    title: "Physics Unit Test",
    sub: "Score: 88/100",
    time: "Yesterday",
    icon: "clipboard" as const,
    color: C.emerald,
    bg: C.emeraldSoft,
  },
  {
    id: "a3",
    title: "Algebra Fundamentals",
    sub: "Certificate earned",
    time: "2 days ago",
    icon: "ribbon" as const,
    color: C.indigo,
    bg: C.indigoSoft,
  },
  {
    id: "a4",
    title: "English Literature — Priya",
    sub: "Completed · 1.5 hr",
    time: "3 days ago",
    icon: "school" as const,
    color: C.gold,
    bg: C.goldSoft,
  },
  {
    id: "a5",
    title: "Chemistry Mock Exam",
    sub: "Score: 74/100",
    time: "4 days ago",
    icon: "clipboard" as const,
    color: C.teal,
    bg: C.tealSoft,
  },
];

// ─── Animated progress bar ────────────────────────────────────────────────────
function AnimBar({
  pct,
  color,
  delay = 0,
  height = 6,
}: {
  pct: number;
  color: string;
  delay?: number;
  height?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);
  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  return (
    <View
      style={{
        height,
        backgroundColor: `${color}22`,
        borderRadius: height / 2,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          width,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

// ─── Mini stat chip (inside hero) ────────────────────────────────────────────
function HeroChip({
  icon,
  value,
  label,
  color,
  bg,
}: {
  icon: any;
  value: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={heroChipStyles.chip}>
      <View style={[heroChipStyles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View>
        <Text style={heroChipStyles.val}>{value}</Text>
        <Text style={heroChipStyles.lab}>{label}</Text>
      </View>
    </View>
  );
}

const heroChipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  val: { fontSize: 15, fontFamily: fonts.extraBold, color: "#FFFFFF" },
  lab: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.4,
    marginTop: 1,
  },
});

// ─── Stat card (goal tracker row) ────────────────────────────────────────────
function GoalRow({ stat, delay }: { stat: (typeof STATS)[0]; delay: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(16)).current;
  const pct = Math.round((stat.value / stat.total) * 100);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(tx, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.goalRow,
        { opacity: fade, transform: [{ translateY: tx }] },
      ]}
    >
      <View style={[styles.goalIcon, { backgroundColor: stat.bg }]}>
        <Ionicons name={stat.icon} size={18} color={stat.color} />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.goalTopRow}>
          <Text style={styles.goalLabel}>{stat.label}</Text>
          <Text style={styles.goalFraction}>
            <Text style={[styles.goalVal, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.goalTotal}> / {stat.total}</Text>
          </Text>
        </View>
        <AnimBar
          pct={stat.value / stat.total}
          color={stat.color}
          delay={delay + 200}
        />
        <Text style={styles.goalPct}>{pct}% complete</Text>
      </View>
    </Animated.View>
  );
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────
const BAR_MAX = 80;

function WeekChart() {
  const anims = useRef(WEEK_DATA.map(() => new Animated.Value(0))).current;
  const today = new Date().getDay(); // 0=Sun

  useEffect(() => {
    WEEK_DATA.forEach((d, i) => {
      Animated.timing(anims[i], {
        toValue: d.pct,
        duration: 600,
        delay: 300 + i * 60,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  return (
    <View style={styles.chartWrap}>
      {WEEK_DATA.map((d, i) => {
        const isToday = i === (today === 0 ? 6 : today - 1);
        const barH = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [3, BAR_MAX],
        });
        return (
          <View key={d.day} style={styles.chartCol}>
            {d.sessions > 0 && (
              <Text style={[styles.chartCount, isToday && { color: C.gold }]}>
                {d.sessions}
              </Text>
            )}
            <Animated.View
              style={[
                styles.chartBar,
                {
                  height: d.pct === 0 ? 3 : barH,
                  backgroundColor: isToday
                    ? C.gold
                    : d.sessions > 0
                      ? C.indigo
                      : "#E5E7EB",
                  opacity: d.pct === 0 ? 0.4 : 1,
                },
              ]}
            />
            <Text
              style={[
                styles.chartDay,
                isToday && { color: C.gold, fontFamily: fonts.bold },
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

// ─── Subject bar ──────────────────────────────────────────────────────────────
function SubjectRow({
  sub,
  delay,
}: {
  sub: (typeof SUBJECTS)[0];
  delay: number;
}) {
  return (
    <View style={styles.subjectRow}>
      <View style={[styles.subjectDot, { backgroundColor: sub.color }]} />
      <Text style={styles.subjectName} numberOfLines={1}>
        {sub.name}
      </Text>
      <View style={{ flex: 1 }}>
        <AnimBar pct={sub.pct} color={sub.color} delay={delay} height={8} />
      </View>
      <Text style={[styles.subjectCount, { color: sub.color }]}>
        {sub.sessions}
      </Text>
    </View>
  );
}

// ─── Badge tile ───────────────────────────────────────────────────────────────
function BadgeTile({ badge }: { badge: (typeof BADGES)[0] }) {
  return (
    <View style={[styles.badgeTile, !badge.earned && { opacity: 0.4 }]}>
      <View style={[styles.badgeIcon, { backgroundColor: badge.bg }]}>
        <Ionicons name={badge.icon} size={22} color={badge.color} />
        {!badge.earned && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={8} color={C.muted} />
          </View>
        )}
      </View>
      <Text style={styles.badgeLabel} numberOfLines={2}>
        {badge.label}
      </Text>
    </View>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────
function ActivityRow({ item }: { item: (typeof ACTIVITY)[0] }) {
  return (
    <View style={styles.actRow}>
      <View style={[styles.actIcon, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={16} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.actSub}>{item.sub}</Text>
      </View>
      <Text style={styles.actTime}>{item.time}</Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: any;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.scard}>
      <View style={styles.scardHead}>
        <View style={styles.scardHeadLeft}>
          <View style={styles.scardIconBox}>
            <Ionicons name={icon} size={14} color={C.gold} />
          </View>
          <Text style={styles.scardTitle}>{title}</Text>
        </View>
        {action && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.scardAction}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.scardBody}>{children}</View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function LearningProgress() {
  const [tab, setTab] = useState<"week" | "month" | "all">("week");

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroTY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(heroTY, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalPct = Math.round(
    STATS.reduce((s, st) => s + (st.value / st.total) * 100, 0) / STATS.length,
  );

  const TABS = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ] as const;

  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[C.navy, C.navyMid, C.navyLight]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.orb1} />
          <View style={styles.orb2} />

          <Animated.View
            style={[
              styles.heroInner,
              { opacity: heroFade, transform: [{ translateY: heroTY }] },
            ]}
          >
            {/* ── Row 1: title + streak ── */}
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroEyebrow}>LEARNING INDEX</Text>
                <Text style={styles.heroHeadline}>Your Progress</Text>
              </View>
              <View style={styles.streakPill}>
                <Ionicons name="flame" size={12} color={C.gold} />
                <Text style={styles.streakText}>4-Day Streak</Text>
              </View>
            </View>

            {/* ── Row 2: big % + overall bar ── */}
            <View style={styles.heroCenterRow}>
              <View style={styles.heroPctBlock}>
                <Text style={styles.heroBigPct}>
                  {totalPct}
                  <Text style={styles.heroBigPctSym}>%</Text>
                </Text>
                <Text style={styles.heroOnTrack}>ON TRACK</Text>
              </View>
              <View style={styles.heroBarBlock}>
                <View style={styles.heroBarMeta}>
                  <Text style={styles.heroBarLabel}>Overall completion</Text>
                  <Text style={styles.heroBarPct}>{totalPct}%</Text>
                </View>
                <View style={styles.heroBarTrack}>
                  <Animated.View
                    style={[styles.heroBarFill, { width: `${totalPct}%` }]}
                  />
                </View>
                <View style={styles.heroMiniStats}>
                  {STATS.map((s) => (
                    <View key={s.label} style={styles.heroMiniStat}>
                      <View
                        style={[
                          styles.heroMiniDot,
                          { backgroundColor: s.color },
                        ]}
                      />
                      <Text style={styles.heroMiniVal}>
                        {s.value}
                        <Text style={styles.heroMiniOf}>/{s.total}</Text>
                      </Text>
                      <Text style={styles.heroMiniLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ── Row 3: 3 quick chips ── */}
            <View style={styles.heroChipsRow}>
              <HeroChip
                icon="calendar-outline"
                value="12"
                label="Sessions"
                color={C.sky}
                bg="rgba(14,165,233,0.18)"
              />
              <HeroChip
                icon="flash-outline"
                value="9"
                label="This Week"
                color={C.gold}
                bg="rgba(232,168,56,0.18)"
              />
              <HeroChip
                icon="star-outline"
                value="88%"
                label="Best Score"
                color={C.emerald}
                bg="rgba(16,185,129,0.18)"
              />
            </View>
          </Animated.View>
        </View>

        {/* ── Period Tabs ── */}
        <View style={styles.tabShell}>
          <View style={styles.tabRow}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                onPress={() => setTab(t.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    tab === t.key && styles.tabLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Goals Tracker ── */}
        <SectionCard title="Goals Tracker" icon="flag">
          {STATS.map((st, i) => (
            <React.Fragment key={st.label}>
              <GoalRow stat={st} delay={i * 80} />
              {i < STATS.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </SectionCard>

        {/* ── Weekly Activity ── */}
        <SectionCard title="Weekly Sessions" icon="bar-chart">
          <View style={styles.chartMeta}>
            <Text style={styles.chartMetaText}>
              <Text style={{ fontFamily: fonts.extraBold, color: C.ink }}>
                9{" "}
              </Text>
              sessions this week
            </Text>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: C.gold }]} />
              <Text style={styles.legendText}>Today</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: C.indigo, marginLeft: 10 },
                ]}
              />
              <Text style={styles.legendText}>Sessions</Text>
            </View>
          </View>
          <WeekChart />
        </SectionCard>

        {/* ── Subject Breakdown ── */}
        <SectionCard title="Subject Breakdown" icon="book">
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectHeaderText}>Subject</Text>
            <Text style={[styles.subjectHeaderText, { marginRight: 22 }]}>
              Progress
            </Text>
          </View>
          {SUBJECTS.map((s, i) => (
            <SubjectRow key={s.name} sub={s} delay={200 + i * 100} />
          ))}
        </SectionCard>

        {/* ── Achievements ── */}
        <SectionCard title="Achievements" icon="trophy" action="See all">
          <View style={styles.badgesGrid}>
            {BADGES.map((b) => (
              <BadgeTile key={b.id} badge={b} />
            ))}
          </View>
        </SectionCard>

        {/* ── Recent Activity ── */}
        <SectionCard title="Recent Activity" icon="time" action="View all">
          {ACTIVITY.map((item, i) => (
            <React.Fragment key={item.id}>
              <ActivityRow item={item} />
              {i < ACTIVITY.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero
  hero: {
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    marginBottom: 4,
  },
  orb1: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(232,168,56,0.07)",
  },
  orb2: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(99,102,241,0.06)",
  },
  heroInner: { gap: 16 },

  // Row 1
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroEyebrow: {
    fontSize: 9,
    fontFamily: fonts.extraBold,
    color: C.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  heroHeadline: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: C.white,
    letterSpacing: -0.2,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232,168,56,0.14)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.28)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 11, fontFamily: fonts.bold, color: C.gold },

  // Row 2: big % + bar + mini stats
  heroCenterRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  heroPctBlock: { alignItems: "center", width: 72 },
  heroBigPct: {
    fontSize: 42,
    fontFamily: fonts.extraBold,
    color: C.white,
    lineHeight: 46,
  },
  heroBigPctSym: { fontSize: 20, color: C.gold },
  heroOnTrack: {
    fontSize: 8,
    fontFamily: fonts.extraBold,
    color: C.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  heroBarBlock: { flex: 1, gap: 8 },
  heroBarMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroBarLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.45)",
  },
  heroBarPct: { fontSize: 11, fontFamily: fonts.bold, color: C.gold },
  heroBarTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  heroBarFill: { height: "100%", backgroundColor: C.gold, borderRadius: 3 },
  heroMiniStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  heroMiniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "48%",
  },
  heroMiniDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  heroMiniVal: { fontSize: 12, fontFamily: fonts.bold, color: C.white },
  heroMiniOf: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.35)",
  },
  heroMiniLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.4)",
    flexShrink: 1,
  },

  // Row 3: chips
  heroChipsRow: { flexDirection: "row", gap: 8 },

  // Tabs
  tabShell: { paddingHorizontal: 18, paddingVertical: 16 },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tabBtnActive: { backgroundColor: C.navy },
  tabLabel: { fontSize: 12, fontFamily: fonts.bold, color: C.muted },
  tabLabelActive: { color: C.white },

  // Section card
  scard: {
    backgroundColor: C.card,
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
    overflow: "hidden",
  },
  scardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  scardHeadLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  scardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.goldSoft,
    borderWidth: 1,
    borderColor: C.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  scardTitle: { fontSize: 14, fontFamily: fonts.bold, color: C.ink },
  scardAction: { fontSize: 12, fontFamily: fonts.bold, color: C.gold },
  scardBody: { padding: 16 },

  // Goal row
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  goalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalLabel: { fontSize: 14, fontFamily: fonts.semiBold, color: C.ink },
  goalFraction: { fontSize: 13 },
  goalVal: { fontFamily: fonts.extraBold, fontSize: 14 },
  goalTotal: { fontFamily: fonts.regular, color: C.muted, fontSize: 13 },
  goalPct: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: C.muted,
    marginTop: 2,
  },
  rowDivider: { height: 1, backgroundColor: C.border },

  // Chart
  chartMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartMetaText: { fontSize: 13, fontFamily: fonts.medium, color: C.muted },
  chartLegend: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: C.muted,
    marginLeft: 4,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: BAR_MAX + 44,
    paddingHorizontal: 4,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  chartBar: { width: 22, borderRadius: 8 },
  chartCount: { fontSize: 11, fontFamily: fonts.bold, color: C.slate },
  chartDay: { fontSize: 10, fontFamily: fonts.medium, color: C.muted },

  // Subjects
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  subjectHeaderText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  subjectDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  subjectName: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: C.ink,
    width: 110,
  },
  subjectCount: {
    fontSize: 13,
    fontFamily: fonts.extraBold,
    width: 20,
    textAlign: "right",
  },

  // Badges
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeTile: { width: (SW - 36 - 32 - 24) / 3, alignItems: "center", gap: 8 },
  badgeIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  lockBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: C.slate,
    textAlign: "center",
  },

  // Activity
  actRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  actIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actTitle: { fontSize: 13, fontFamily: fonts.semiBold, color: C.ink },
  actSub: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: C.muted,
    marginTop: 2,
  },
  actTime: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: C.muted,
    flexShrink: 0,
  },
});
