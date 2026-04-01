import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.15)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  muted: "#8A9BB0",
  success: "#27AE60",
  successPale: "rgba(39,174,96,0.10)",
};

// ─── AI Reasons Mapping ────────────────────────────────────────────────────────
// Maps key phrases to specific icons
const getIconForReason = (reason: string) => {
  if (reason.includes("slot")) return "time-outline";
  if (reason.includes("Expert")) return "bookmark-outline";
  if (reason.includes("area")) return "location-outline";
  if (reason.includes("language")) return "language-outline";
  if (reason.includes("Affordable")) return "cash-outline";
  return "checkmark-circle-outline";
};

// ─── Match Card (Staggered Entrance Animation) ──────────────────────────────
function ResultCard({ teacher, isHero, index }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120, // Staggered delay based on index
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  // Standard Card Layout (Rahul, Sana)
  if (!isHero) {
    return (
      <Animated.View
        style={[
          styles.standardCardWrap,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push(`/teacher/${teacher.id}`)}
          style={styles.standardCard}
        >
          <View style={styles.contentRow}>
            <Image
              source={{ uri: teacher.image }}
              style={styles.profileImage}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.subjectText}>{teacher.subject}</Text>
              <Text style={styles.statsText}>
                {teacher.exp} Yrs Exp • {teacher.rating} ({teacher.reviews}{" "}
                reviews)
              </Text>
            </View>
          </View>

          {/* AI Tags - Standard */}
          <View style={styles.tagRow}>
            {teacher.reasons.map((reason: string, i: number) => (
              <View key={i} style={styles.reasonTag}>
                <Ionicons
                  name={getIconForReason(reason)}
                  size={12}
                  color={palette.success}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.demoBtnSmall}>
            <Text style={styles.demoBtnTextSmall}>Demo</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Hero Card Layout (Ananya)
  return (
    <Animated.View
      style={[
        styles.heroCardWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.97}
        onPress={() => router.push(`/teacher/${teacher.id}`)}
        style={styles.heroCard}
      >
        <Image source={{ uri: teacher.image }} style={styles.heroImage} />

        {/* Match Percentage Badge */}
        <View style={styles.matchBadgeHero}>
          <Text style={styles.matchTextHero}>{teacher.match}% Match</Text>
        </View>

        <Text style={styles.heroName}>{teacher.name}</Text>
        <Text style={styles.heroSubject}>{teacher.subject}</Text>

        <View style={styles.statsRowHero}>
          <Text style={styles.statsTextHero}>{teacher.exp} Yrs Exp</Text>
          <View style={styles.heroStatDivider} />
          <View style={styles.ratingHero}>
            <Ionicons name="star" size={14} color={palette.gold} />
            <Text style={styles.statsTextHero}>
              {teacher.rating} ({teacher.reviews} reviews)
            </Text>
          </View>
        </View>

        {/* AI Tags - Hero */}
        <View style={styles.tagRowHero}>
          {teacher.reasons.map((reason: string, i: number) => (
            <View key={i} style={styles.reasonTagHero}>
              <Ionicons
                name={getIconForReason(reason)}
                size={12}
                color={palette.success}
              />
              <Text style={styles.reasonTextHero}>{reason}</Text>
            </View>
          ))}
        </View>

        {/* CTA Hero */}
        <LinearGradient
          colors={[palette.gold, "#D4922A"]}
          style={styles.bookBtnHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bookBtnTextHero}>INSTANT DEMO REQUEST</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.navy} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AIResults() {
  const topMatch = {
    id: "t1",
    name: "Dr. Ananya Sharma",
    subject: "Physics & Maths",
    match: 98,
    exp: 12,
    rating: 4.9,
    reviews: 156,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    reasons: ["Available Evenings", "CBSE Expert", "Near Connaught Place"],
  };

  const otherMatches = [
    {
      id: "t2",
      name: "Rahul Verma",
      subject: "Mathematics",
      match: 92,
      exp: 5,
      rating: 4.7,
      reviews: 89,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      reasons: ["Near Lajpat Nagar", "Affordable"],
    },
    {
      id: "t3",
      name: "Sana Khan",
      subject: "Science",
      match: 88,
      exp: 8,
      rating: 4.8,
      reviews: 112,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      reasons: ["Evening Batches"],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.cream} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={palette.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titleNew}>Your AI Matches</Text>
          <Text style={styles.subtitleNew}>
            Curated based on your preferences
          </Text>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitleNew}>Our Top Recommendation</Text>
        <ResultCard teacher={topMatch} isHero={true} index={0} />

        <Text style={[styles.sectionTitleNew, { marginTop: 24 }]}>
          Other Highly Compatible Matches
        </Text>
        <View style={styles.alternativeWrap}>
          {otherMatches.map((t, idx) => (
            <ResultCard key={t.id} teacher={t} isHero={false} index={idx + 1} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: palette.white,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  titleNew: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.navy,
    letterSpacing: -0.4,
  },
  subtitleNew: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    marginTop: 1,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitleNew: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },

  // ── HERO CARD ──
  heroCardWrap: { marginBottom: 16 },
  heroCard: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: palette.gold,
    shadowColor: palette.gold, // Gold-tinted shadow
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  heroImage: { width: 100, height: 100, borderRadius: 30, marginBottom: 12 },
  matchBadgeHero: {
    backgroundColor: palette.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  matchTextHero: {
    color: palette.gold,
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
  },
  heroName: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.navy,
    marginBottom: 4,
  },
  heroSubject: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: palette.gold,
    marginBottom: 10,
  },
  statsRowHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  statsTextHero: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  heroStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.muted,
    opacity: 0.4,
  },
  ratingHero: { flexDirection: "row", alignItems: "center", gap: 4 },

  // Tags Hero
  tagRowHero: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  reasonTagHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.successPale,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(39,174,96,0.15)",
  },
  reasonTextHero: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.success,
  },

  // CTA Hero
  bookBtnHero: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  bookBtnTextHero: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.navy,
    letterSpacing: 0.5,
  },

  // ── STANDARD CARD ( rahul, sana ) ──
  alternativeWrap: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 10,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  standardCardWrap: { marginBottom: 12 },
  standardCard: {
    backgroundColor: palette.cream,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  contentRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  profileImage: { width: 50, height: 50, borderRadius: 16 },
  headerInfo: { flex: 1, justifyContent: "center" },
  teacherName: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
  },
  subjectText: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: palette.gold,
    marginTop: 1,
  },
  statsText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    marginTop: 3,
  },

  // Tags Standard
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 5 },
  reasonTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(39,174,96,0.1)",
  },
  reasonText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: palette.success,
  },

  // CTA Standard
  demoBtnSmall: {
    position: "absolute",
    right: 14,
    top: 14,
    backgroundColor: palette.goldPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.gold,
  },
  demoBtnTextSmall: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
  },
});
