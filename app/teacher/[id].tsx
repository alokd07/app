import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { Teacher } from "../../src/types";
import { formatCurrency, openWhatsApp } from "../../src/utils/helpers";
import { appColors } from "../../src/theme/colors";

const P = appColors;

// ─── Sample / fallback teacher ─────────────────────────────────────────────────
const SAMPLE_TEACHER = {
  _id: "t1",
  name: "Ananya Sharma",
  profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
  rating: 4.9,
  totalReviews: 128,
  pricePerHour: 600,
  experienceYears: 7,
  subjects: ["Mathematics", "Physics", "Statistics"],
  classes: ["9", "10", "11", "12"],
  bio: "Passionate educator with 7 years of experience helping students excel in Mathematics and Physics. I believe every student can succeed with the right guidance and a structured approach.",
  mode: ["online", "offline"],
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  totalStudents: 84,
  completionRate: 97,
};

// ─── Reusable atoms ────────────────────────────────────────────────────────────
function StatBox({
  value,
  label,
  gold,
}: {
  value: string;
  label: string;
  gold?: boolean;
}) {
  return (
    <View style={atoms.statBox}>
      <Text style={[atoms.statValue, gold && { color: P.gold }]}>{value}</Text>
      <Text style={atoms.statLabel}>{label}</Text>
    </View>
  );
}

function Tag({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <View style={[atoms.tag, primary && atoms.tagPrimary]}>
      {primary && (
        <Ionicons
          name="checkmark"
          size={10}
          color={P.navy}
          style={{ marginRight: 3 }}
        />
      )}
      <Text style={[atoms.tagText, primary && atoms.tagTextPrimary]}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={atoms.infoRow}>
      <View style={atoms.infoIconBox}>
        <Ionicons name={icon} size={14} color={P.gold} />
      </View>
      <View>
        <Text style={atoms.infoLabel}>{label}</Text>
        <Text style={atoms.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={atoms.card}>
      <View style={atoms.cardHeader}>
        <View style={atoms.cardIconBox}>
          <Ionicons name={icon} size={13} color={P.gold} />
        </View>
        <Text style={atoms.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function PressBtn({ onPress, children, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 60,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 60,
          }).start()
        }
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Loading / Error states ────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: P.cream,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={P.gold} />
    </SafeAreaView>
  );
}

function ErrorScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: P.cream,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: P.goldDim,
          borderWidth: 1.5,
          borderColor: P.goldBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={28} color={P.gold} />
      </View>
      <Text
        style={{ fontSize: 18, fontFamily: "Manrope_700Bold", color: P.ink }}
      >
        Teacher not found
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: P.navy,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Manrope_600SemiBold",
            color: P.cream,
          }}
        >
          Go Back
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTeacherDetail();
  }, [id]);

  const fetchTeacherDetail = async () => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.TEACHER_DETAIL(id),
      );
      if (response.data.data) setTeacher(response.data.data);
    } catch {
      // fallback to sample for dev
      setTeacher(SAMPLE_TEACHER);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (teacher)
      router.push({
        pathname: "/book-session",
        params: { teacherId: teacher._id },
      });
  };

  const handleWhatsApp = () => {
    if (teacher) {
      const message = `Hi ${teacher.name}, I'm interested in booking a session with you.`;
      openWhatsApp("9876543210", message);
    }
  };

  // Animated header opacity for scroll
  const headerBg = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: ["rgba(250,247,242,0)", "rgba(250,247,242,1)"],
    extrapolate: "clamp",
  });
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [100, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) return <LoadingScreen />;
  if (!teacher) return <ErrorScreen />;

  const initials = teacher.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.root}>
      {/* ── Floating transparent nav that solidifies on scroll ── */}
      <Animated.View
        style={[styles.floatingNav, { backgroundColor: headerBg }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color={P.ink} />
            </TouchableOpacity>
            <Animated.Text
              style={[styles.navTitle, { opacity: headerTitleOpacity }]}
              numberOfLines={1}
            >
              {teacher.name}
            </Animated.Text>
            <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
              <Ionicons name="heart-outline" size={18} color={P.ink} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* ── Hero Banner ── */}
        <LinearGradient colors={[P.navy, P.navyMid]} style={styles.hero}>
          {/* Decorative orb */}
          <View style={styles.heroOrb} />

          {/* Avatar */}
          <View style={styles.heroAvatarWrap}>
            <LinearGradient
              colors={[P.gold, P.goldLight, P.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroAvatarRing}
            >
              {teacher.profileImage ? (
                <Image
                  source={{ uri: teacher.profileImage }}
                  style={styles.heroAvatar}
                />
              ) : (
                <View style={styles.heroAvatarFallback}>
                  <Text style={styles.heroAvatarInitials}>{initials}</Text>
                </View>
              )}
            </LinearGradient>

            {/* Online badge */}
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>

          <Text style={styles.heroName}>{teacher.name}</Text>

          {/* Rating row */}
          <View style={styles.heroRatingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(teacher.rating) ? "star" : "star-outline"}
                size={14}
                color={P.gold}
              />
            ))}
            <Text style={styles.heroRatingText}>
              {teacher.rating.toFixed(1)} · {teacher.totalReviews} reviews
            </Text>
          </View>

          {/* Mode badges */}
          <View style={styles.heroBadgeRow}>
            {(teacher.mode || ["online", "offline"]).map((m: string) => (
              <View key={m} style={styles.heroBadge}>
                <Ionicons
                  name={m === "online" ? "videocam" : "location"}
                  size={11}
                  color={P.gold}
                />
                <Text style={styles.heroBadgeText}>
                  {m === "online" ? "Online" : "In-person"}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Price + Quick Stats ── */}
        <View style={styles.priceStatsRow}>
          {/* Price chip */}
          <View style={styles.priceChip}>
            <Text style={styles.priceAmount}>
              {formatCurrency(teacher.pricePerHour)}
            </Text>
            <Text style={styles.priceLabel}>/hr</Text>
          </View>

          <View style={styles.statsRow}>
            <StatBox
              value={`${teacher.experienceYears || 0}y`}
              label="Exp."
              gold
            />
            <View style={styles.statDivider} />
            <StatBox
              value={String(teacher.totalStudents || 0)}
              label="Students"
            />
            <View style={styles.statDivider} />
            <StatBox
              value={`${teacher.completionRate || 0}%`}
              label="Completion"
            />
          </View>
        </View>

        {/* ── About ── */}
        <SectionCard title="About" icon="person-outline">
          <Text style={styles.bioText}>
            {teacher.bio || "No bio available."}
          </Text>
        </SectionCard>

        {/* ── Teaching Info ── */}
        <SectionCard title="Teaching Details" icon="school-outline">
          <View style={{ gap: 12 }}>
            <InfoRow
              icon="briefcase-outline"
              label="Experience"
              value={`${teacher.experienceYears || 0} years of teaching`}
            />
            <InfoRow
              icon="calendar-outline"
              label="Available Days"
              value={(
                teacher.availableDays || SAMPLE_TEACHER.availableDays
              ).join(", ")}
            />
            <InfoRow
              icon="time-outline"
              label="Session Duration"
              value="1 – 2 hours per session"
            />
          </View>
        </SectionCard>

        {/* ── Subjects ── */}
        <SectionCard title="Subjects" icon="book-outline">
          <View style={styles.tagsWrap}>
            {teacher.subjects.map((s: string, i: number) => (
              <Tag key={i} label={s} primary />
            ))}
          </View>
        </SectionCard>

        {/* ── Classes ── */}
        <SectionCard title="Classes Taught" icon="layers-outline">
          <View style={styles.tagsWrap}>
            {teacher.classes.map((c: string, i: number) => (
              <Tag key={i} label={`Class ${c}`} />
            ))}
          </View>
        </SectionCard>

        {/* ── Reviews teaser ── */}
        <SectionCard title="Reviews" icon="star-outline">
          <View style={styles.reviewRow}>
            <View style={styles.reviewScore}>
              <Text style={styles.reviewBigNum}>
                {teacher.rating.toFixed(1)}
              </Text>
              <View style={{ flexDirection: "row", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={
                      i <= Math.round(teacher.rating) ? "star" : "star-outline"
                    }
                    size={12}
                    color={P.gold}
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>
                {teacher.totalReviews} reviews
              </Text>
            </View>
            <TouchableOpacity style={styles.reviewSeeAll} activeOpacity={0.8}>
              <Text style={styles.reviewSeeAllText}>See all reviews</Text>
              <Ionicons name="arrow-forward" size={13} color={P.gold} />
            </TouchableOpacity>
          </View>
        </SectionCard>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={styles.footer}>
        {/* WhatsApp */}
        <PressBtn onPress={handleWhatsApp}>
          <View style={styles.waBtn}>
            <Ionicons name="logo-whatsapp" size={20} color={P.whatsapp} />
          </View>
        </PressBtn>

        {/* Book Session */}
        <PressBtn onPress={handleBookSession} style={{ flex: 1 }}>
          <LinearGradient
            colors={[P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtn}
          >
            <Text style={styles.bookBtnText}>Book Demo</Text>
            <View style={styles.bookBtnArrow}>
              <Ionicons name="arrow-forward" size={14} color={P.gold} />
            </View>
          </LinearGradient>
        </PressBtn>
      </View>
    </View>
  );
}

// ─── Atom styles ───────────────────────────────────────────────────────────────
const atoms = StyleSheet.create({
  statBox: { alignItems: "center", flex: 1 },
  statValue: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: P.inputBg,
    borderWidth: 1,
    borderColor: P.border,
  },
  tagPrimary: { backgroundColor: P.goldDim, borderColor: P.goldBorder },
  tagText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
  },
  tagTextPrimary: { color: P.navy, fontFamily: "Manrope_600SemiBold" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: P.ink },

  card: {
    backgroundColor: P.white,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.border,
    overflow: "hidden",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  cardIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.ink },
});

// ─── Layout styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },
  scroll: { paddingBottom: 40 },

  // Floating nav
  floatingNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  navTitle: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },

  // Hero
  hero: {
    paddingTop: 100,
    paddingBottom: 32,
    alignItems: "center",
    overflow: "hidden",
  },
  heroOrb: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(232,168,56,0.06)",
    top: -60,
    right: -60,
  },

  heroAvatarWrap: { position: "relative", marginBottom: 16 },
  heroAvatarRing: {
    width: 100,
    height: 100,
    borderRadius: 30,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatar: { width: 94, height: 94, borderRadius: 27 },
  heroAvatarFallback: {
    width: 94,
    height: 94,
    borderRadius: 27,
    backgroundColor: P.navyCard,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarInitials: {
    fontSize: 32,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -1,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: P.navy,
    borderWidth: 2.5,
    borderColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: P.success,
  },

  heroName: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: P.cream,
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  heroRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  heroRatingText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
    marginLeft: 4,
  },

  heroBadgeRow: { flexDirection: "row", gap: 8 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: P.gold,
  },

  // Price + stats
  priceStatsRow: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
    gap: 12,
  },
  priceChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    backgroundColor: P.navy,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  priceAmount: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: P.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    paddingVertical: 14,
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: P.border,
    alignSelf: "center",
  },

  // Bio
  bioText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: P.mutedDark,
    lineHeight: 22,
    padding: 18,
    paddingTop: 14,
  },

  // Tags
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
    paddingTop: 14,
  },

  // Info section (inside card, padded)
  infoSection: { padding: 16, paddingTop: 14, gap: 12 },

  // Reviews
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 14,
  },
  reviewScore: { alignItems: "center", gap: 4 },
  reviewBigNum: {
    fontSize: 36,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -1,
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    marginTop: 2,
  },
  reviewSeeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  reviewSeeAllText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: P.gold,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: P.cream,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  waBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: P.white,
    borderWidth: 1.5,
    borderColor: "rgba(37,211,102,0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 10,
  },
  bookBtnText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: 0.2,
  },
  bookBtnArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    // backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
