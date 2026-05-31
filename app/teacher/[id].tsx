import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { formatCurrency, openWhatsApp } from "../../src/utils/helpers";
import { appColors, fonts } from "../../src/theme/colors";

const { width: SW } = Dimensions.get("window");
const HERO_H = 320;
const P = appColors;

// ─── Fallback data ─────────────────────────────────────────────────────────────
const FALLBACK: any = {
  _id: "t1",
  name: "Ananya Sharma",
  profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
  rating: 4.9,
  totalReviews: 128,
  pricePerHour: 600,
  experienceYears: 7,
  subjects: ["Mathematics", "Physics", "Statistics"],
  classes: ["9", "10", "11", "12"],
  bio: "Passionate educator with 7+ years of experience helping students excel in Mathematics and Physics. I believe every student can succeed with the right guidance and a structured approach to problem-solving.",
  mode: ["online", "offline"],
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  totalStudents: 84,
  completionRate: 97,
  languages: ["Hindi", "English"],
  board: "CBSE",
  area: "South Delhi",
};

const MOCK_REVIEWS = [
  { id: "r1", name: "Priya M.", rating: 5, text: "Excellent teaching style, very patient and clear.", ago: "2 days ago" },
  { id: "r2", name: "Rohan K.", rating: 5, text: "My child's scores improved significantly within a month!", ago: "1 week ago" },
  { id: "r3", name: "Sunita D.", rating: 4, text: "Very knowledgeable. Highly recommended for Maths.", ago: "2 weeks ago" },
];

// ─── Reusable atoms ────────────────────────────────────────────────────────────
function StatPill({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={atom.statPill}>
      <Text style={[atom.statVal, color ? { color } : {}]}>{value}</Text>
      <Text style={atom.statLab}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, icon, children, noPad }: {
  title: string; icon: any; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <View style={atom.card}>
      <View style={atom.cardHead}>
        <View style={atom.cardIconBox}>
          <Ionicons name={icon} size={14} color={P.gold} />
        </View>
        <Text style={atom.cardTitle}>{title}</Text>
      </View>
      <View style={noPad ? {} : atom.cardBody}>{children}</View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={atom.infoRow}>
      <View style={atom.infoIcon}>
        <Ionicons name={icon} size={15} color={P.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={atom.infoLabel}>{label}</Text>
        <Text style={atom.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={12}
          color={P.gold}
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: (typeof MOCK_REVIEWS)[0] }) {
  return (
    <View style={atom.reviewCard}>
      <View style={atom.reviewTop}>
        <View style={atom.reviewAvatar}>
          <Text style={atom.reviewAvatarText}>{review.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={atom.reviewName}>{review.name}</Text>
          <StarRow rating={review.rating} />
        </View>
        <Text style={atom.reviewAgo}>{review.ago}</Text>
      </View>
      <Text style={atom.reviewText}>{review.text}</Text>
    </View>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FA", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={P.gold} />
      <Text style={{ marginTop: 12, fontFamily: fonts.medium, fontSize: 13, color: P.muted }}>
        Loading profile…
      </Text>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(id));
      if (res.data?.data) setTeacher(res.data.data);
      else setTeacher(FALLBACK);
    } catch {
      setTeacher(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  // Animated nav values
  const navBg = scrollY.interpolate({
    inputRange: [HERO_H - 90, HERO_H - 40],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    extrapolate: "clamp",
  });
  const navTitleOp = scrollY.interpolate({
    inputRange: [HERO_H - 60, HERO_H - 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.12, 1],
    extrapolate: "clamp",
  });

  if (loading) return <LoadingScreen />;
  if (!teacher) return <LoadingScreen />;

  const initials = teacher.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "T";
  const fee = teacher.pricePerHour ? formatCurrency(teacher.pricePerHour) : "₹500";
  const subjects: string[] = teacher.subjects ?? [];
  const classes: string[] = teacher.classes ?? [];
  const modes: string[] = teacher.mode ?? ["online"];
  const days: string[] = teacher.availableDays ?? FALLBACK.availableDays;
  const langs: string[] = teacher.languages ?? ["Hindi", "English"];

  return (
    <View style={styles.root}>

      {/* ── Floating Nav ── */}
      <Animated.View style={[styles.floatingNav, { backgroundColor: navBg, paddingTop: insets.top }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={P.ink} />
          </TouchableOpacity>
          <Animated.Text style={[styles.navTitle, { opacity: navTitleOp }]} numberOfLines={1}>
            {teacher.name}
          </Animated.Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => setSaved(!saved)} activeOpacity={0.8}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? "#EF4444" : P.ink} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Scrollable body ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero cover ── */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.heroCover, { transform: [{ scale: heroScale }] }]}>
            {teacher.profileImage ? (
              <Image source={{ uri: teacher.profileImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <LinearGradient colors={[P.navy, P.navyMid]} style={StyleSheet.absoluteFill} />
            )}
            <LinearGradient
              colors={["rgba(2,8,23,0.15)", "rgba(2,8,23,0.75)"]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Info overlay on hero */}
          <View style={styles.heroOverlay}>
            {/* Mode badges */}
            <View style={styles.modeBadgeRow}>
              {modes.map((m) => (
                <View key={m} style={styles.modeBadge}>
                  <Ionicons name={m === "online" ? "videocam" : "location"} size={10} color={P.gold} />
                  <Text style={styles.modeBadgeText}>{m === "online" ? "Online" : "In-person"}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.heroName}>{teacher.name}</Text>

            {/* Subject line */}
            <Text style={styles.heroSubject} numberOfLines={1}>
              {subjects.slice(0, 2).join(" · ")}
              {teacher.board ? `  ·  ${teacher.board}` : ""}
            </Text>

            {/* Rating row */}
            <View style={styles.heroRatingRow}>
              <StarRow rating={teacher.rating} />
              <Text style={styles.heroRatingText}>
                {teacher.rating?.toFixed(1)}  ·  {teacher.totalReviews} reviews
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stat strip ── */}
        <View style={styles.statStrip}>
          <StatPill value={`${teacher.experienceYears ?? 3}y`} label="Experience" color={P.gold} />
          <View style={styles.statDivider} />
          <StatPill value={`${teacher.totalStudents ?? 80}+`} label="Students" />
          <View style={styles.statDivider} />
          <StatPill value={`${teacher.completionRate ?? 97}%`} label="Completion" />
          <View style={styles.statDivider} />
          <StatPill value={fee} label="Per Hour" color={P.gold} />
        </View>

        {/* ── About ── */}
        <SectionCard title="About" icon="person-outline">
          <Text style={styles.bioText}>{teacher.bio ?? "No bio available."}</Text>
        </SectionCard>

        {/* ── Teaching Details ── */}
        <SectionCard title="Teaching Details" icon="school-outline" noPad>
          <View style={styles.infoList}>
            <InfoRow icon="briefcase-outline" label="Experience" value={`${teacher.experienceYears ?? 3} years of teaching`} />
            <View style={styles.infoDivider} />
            <InfoRow icon="calendar-outline" label="Available Days" value={days.join(", ")} />
            <View style={styles.infoDivider} />
            <InfoRow icon="language-outline" label="Languages" value={langs.join(", ")} />
            <View style={styles.infoDivider} />
            <InfoRow icon="location-outline" label="Location" value={teacher.area ?? "Delhi"} />
            <View style={styles.infoDivider} />
            <InfoRow icon="time-outline" label="Session Duration" value="1 – 2 hours per session" />
          </View>
        </SectionCard>

        {/* ── Subjects ── */}
        <SectionCard title="Subjects Taught" icon="book-outline">
          <View style={styles.tagsWrap}>
            {subjects.map((s, i) => (
              <View key={i} style={styles.subjectTag}>
                <Ionicons name="checkmark" size={11} color={P.navy} style={{ marginRight: 4 }} />
                <Text style={styles.subjectTagText}>{s}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* ── Classes ── */}
        <SectionCard title="Classes" icon="layers-outline">
          <View style={styles.tagsWrap}>
            {classes.map((c, i) => (
              <View key={i} style={styles.classTag}>
                <Text style={styles.classTagText}>Class {c}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* ── Reviews ── */}
        <SectionCard title="Student Reviews" icon="star-outline">
          {/* Score summary */}
          <View style={styles.reviewSummary}>
            <View style={styles.reviewScoreBlock}>
              <Text style={styles.reviewBigNum}>{teacher.rating?.toFixed(1)}</Text>
              <StarRow rating={teacher.rating} />
              <Text style={styles.reviewCountText}>{teacher.totalReviews} reviews</Text>
            </View>
            <View style={styles.reviewBarsBlock}>
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = star === 5 ? 0.72 : star === 4 ? 0.18 : star === 3 ? 0.06 : star === 2 ? 0.02 : 0.02;
                return (
                  <View key={star} style={styles.reviewBarRow}>
                    <Text style={styles.reviewBarStar}>{star}</Text>
                    <Ionicons name="star" size={9} color={P.gold} />
                    <View style={styles.reviewBarTrack}>
                      <View style={[styles.reviewBarFill, { width: `${pct * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review cards */}
          <View style={styles.reviewList}>
            {MOCK_REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)}
          </View>

          <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.8}>
            <Text style={styles.seeAllBtnText}>See all reviews</Text>
            <Ionicons name="arrow-forward" size={14} color={P.gold} />
          </TouchableOpacity>
        </SectionCard>

      </Animated.ScrollView>

      {/* ── Sticky footer ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* WhatsApp btn */}
        <TouchableOpacity
          style={styles.waBtn}
          onPress={() => openWhatsApp("9876543210", `Hi ${teacher.name}, I'd like to book a session.`)}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        </TouchableOpacity>

        {/* Book button */}
        <TouchableOpacity
          style={styles.bookBtnWrap}
          onPress={() => router.push({ pathname: "/book-session", params: { teacherId: teacher._id } })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[P.gold, "#D4922A"]}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <View>
              <Text style={styles.bookBtnLabel}>Book a Demo</Text>
              <Text style={styles.bookBtnSub}>Free first session</Text>
            </View>
            <View style={styles.bookBtnArrow}>
              <Ionicons name="arrow-forward" size={16} color={P.navy} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Atom styles ───────────────────────────────────────────────────────────────
const atom = StyleSheet.create({
  statPill: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statVal: { fontSize: 17, fontFamily: fonts.extraBold, color: P.ink, letterSpacing: -0.3 },
  statLab: { fontSize: 10, fontFamily: fonts.medium, color: P.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#0D1B2A", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardIconBox: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(232,168,56,0.12)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.28)",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontFamily: fonts.bold, color: P.ink },
  cardBody: { padding: 16 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  infoIcon: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.22)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  infoLabel: { fontSize: 10, fontFamily: fonts.medium, color: P.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  infoValue: { fontSize: 13, fontFamily: fonts.semiBold, color: P.ink },

  reviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: P.navy,
    alignItems: "center", justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 13, fontFamily: fonts.bold, color: P.gold },
  reviewName: { fontSize: 13, fontFamily: fonts.semiBold, color: P.ink, marginBottom: 3 },
  reviewAgo: { fontSize: 10, fontFamily: fonts.medium, color: P.muted },
  reviewText: { fontSize: 13, fontFamily: fonts.regular, color: P.mutedDark, lineHeight: 20 },
});

// ─── Layout styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  // Floating nav
  floatingNav: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
    borderBottomWidth: 1, borderBottomColor: "transparent",
  },
  navRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  navTitle: { flex: 1, textAlign: "center", fontSize: 15, fontFamily: fonts.bold, color: P.ink, marginHorizontal: 8 },

  // Hero
  heroContainer: { height: HERO_H, overflow: "hidden" },
  heroCover: { ...StyleSheet.absoluteFillObject },
  heroOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 24, gap: 6,
  },
  modeBadgeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  modeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(232,168,56,0.15)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.35)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  modeBadgeText: { fontSize: 10, fontFamily: fonts.bold, color: P.gold },
  heroName: { fontSize: 26, fontFamily: fonts.extraBold, color: "#FFFFFF", letterSpacing: -0.4 },
  heroSubject: { fontSize: 13, fontFamily: fonts.medium, color: "rgba(255,255,255,0.65)" },
  heroRatingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  heroRatingText: { fontSize: 12, fontFamily: fonts.semiBold, color: "rgba(255,255,255,0.7)" },

  // Stat strip
  statStrip: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#0D1B2A", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  statDivider: { width: 1, height: 36, backgroundColor: "#F1F5F9" },

  // Bio
  bioText: {
    fontSize: 14, fontFamily: fonts.regular, color: P.mutedDark,
    lineHeight: 23, letterSpacing: 0.1,
  },

  // Info list
  infoList: {},
  infoDivider: { height: 1, backgroundColor: "#F8FAFC", marginHorizontal: 14 },

  // Tags
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.25)",
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  subjectTagText: { fontSize: 12, fontFamily: fonts.semiBold, color: P.navy },
  classTag: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  classTagText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#475569" },

  // Review summary
  reviewSummary: {
    flexDirection: "row", gap: 16, alignItems: "center",
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", marginBottom: 14,
  },
  reviewScoreBlock: { alignItems: "center", gap: 4, width: 72 },
  reviewBigNum: { fontSize: 38, fontFamily: fonts.extraBold, color: P.gold, letterSpacing: -1 },
  reviewCountText: { fontSize: 10, fontFamily: fonts.medium, color: P.muted, marginTop: 2 },
  reviewBarsBlock: { flex: 1, gap: 5 },
  reviewBarRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  reviewBarStar: { fontSize: 10, fontFamily: fonts.medium, color: P.muted, width: 8 },
  reviewBarTrack: { flex: 1, height: 5, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" },
  reviewBarFill: { height: "100%", backgroundColor: P.gold, borderRadius: 3 },

  reviewList: { gap: 0 },
  seeAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 4, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  seeAllBtnText: { fontSize: 13, fontFamily: fonts.bold, color: P.gold },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 8 },
    }),
  },
  waBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5, borderColor: "rgba(37,211,102,0.35)",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#25D366", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  bookBtnWrap: { flex: 1, borderRadius: 14, overflow: "hidden" },
  bookBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 13,
  },
  bookBtnLabel: { fontSize: 15, fontFamily: fonts.extraBold, color: P.navy },
  bookBtnSub: { fontSize: 10, fontFamily: fonts.medium, color: "rgba(13,27,42,0.55)", marginTop: 1 },
  bookBtnArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(13,27,42,0.12)",
    alignItems: "center", justifyContent: "center",
  },
});
