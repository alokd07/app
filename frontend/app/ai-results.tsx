import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
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
  cream: "#FAF7F2",
  white: "#FFFFFF",
  muted: "#8A9BB0",
  success: "#27AE60",
};

// ─── Sub-Component: Match Card ──────────────────────────────────────────────
function ResultCard({ teacher, isHero, index }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ marginBottom: 20 }}>
      <Animated.View
        style={[
          isHero ? styles.heroCard : styles.standardCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push(`/teacher/${teacher.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: teacher.image }}
                style={styles.profileImage}
              />
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{teacher.match}% Match</Text>
              </View>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.subjectText}>
                {teacher.subject} • {teacher.exp} yrs exp
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={palette.gold} />
                <Text style={styles.ratingText}>
                  {teacher.rating} ({teacher.reviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* AI Reasoning Tags */}
          <View style={styles.tagRow}>
            {teacher.reasons.map((reason: string, i: number) => (
              <View key={i} style={styles.reasonTag}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={palette.success}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <LinearGradient
            colors={[palette.gold, "#D4922A"]}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity onPress={() => console.log("Book Demo")}>
              <Text style={styles.bookBtnText}>Instant Demo Request</Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
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
    reasons: ["Available in your slot", "Expert in CBSE", "Near your area"],
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
      reasons: ["Highly rated for 10th", "Affordable"],
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
      reasons: ["Matches your language"],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={["#FFF8EC", "#F7E9CD", "#F4E1BD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={22} color={palette.navy} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Your AI Matches</Text>
            <Text style={styles.subtitle}>
              Curated based on your preferences
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Our Top Recommendation</Text>
        <ResultCard teacher={topMatch} isHero={true} index={0} />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Other High Matches
        </Text>
        {otherMatches.map((t, idx) => (
          <ResultCard key={t.id} teacher={t} isHero={false} index={idx + 1} />
        ))}

        <TouchableOpacity style={styles.retryBtn}>
          <Ionicons name="refresh-outline" size={18} color={palette.gold} />
          <Text style={styles.retryText}>Adjust Preferences & Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.cream },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: palette.cream,
  },
  header: {
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.06)",
    gap: 10,
  },
  heroGlowTop: {
    position: "absolute",
    top: -42,
    right: -28,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  heroGlowBottom: {
    position: "absolute",
    bottom: -52,
    left: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(232,168,56,0.14)",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  eyebrow: {
    fontSize: 9,
    color: palette.muted,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 1.8,
    marginBottom: -1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.navy,
  },
  subtitle: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 1,
    fontFamily: "Manrope_500Medium",
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.navy,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 15,
  },
  // Cards
  heroCard: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: palette.gold,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  standardCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  cardHeader: { flexDirection: "row", gap: 15 },
  imageContainer: { position: "relative" },
  profileImage: { width: 70, height: 70, borderRadius: 20 },
  matchBadge: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    backgroundColor: palette.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: { color: palette.gold, fontSize: 10, fontWeight: "800" },
  headerInfo: { flex: 1, justifyContent: "center" },
  teacherName: { fontSize: 18, fontWeight: "700", color: palette.navy },
  subjectText: { fontSize: 13, color: palette.muted, marginVertical: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, color: palette.navy, fontWeight: "600" },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
    marginBottom: 15,
  },
  reasonTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(39,174,96,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  reasonText: { fontSize: 11, color: palette.success, fontWeight: "600" },
  bookBtn: { borderRadius: 14, marginTop: 5, overflow: "hidden" },
  bookBtnText: {
    textAlign: "center",
    paddingVertical: 12,
    color: palette.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 8,
  },
  retryText: { color: palette.gold, fontWeight: "600", fontSize: 14 },
});
