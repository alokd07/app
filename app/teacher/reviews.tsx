import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useTeacherStore } from "../../src/store/teacherStore";

export default function TeacherReviewsScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const { getTeacherById } = useTeacherStore();
  const teacher = getTeacherById(teacherId || "tch-1") || getTeacherById("tch-1")!;

  const [selectedFilter, setSelectedFilter] = useState<number | "all">("all");

  const dist = teacher.ratingDistribution;
  const total = teacher.totalReviews || 1;

  const filteredReviews = teacher.reviews.filter((r) => {
    if (selectedFilter === "all") return true;
    return r.rating === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews & Ratings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Rating Breakdown Card */}
        <View style={styles.ratingCard}>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreNum}>{teacher.rating}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={16} color="#E8A838" />
              ))}
            </View>
            <Text style={styles.totalText}>{teacher.totalReviews} total reviews</Text>
          </View>

          <View style={styles.barsCol}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = (dist as any)[star] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <View key={star} style={styles.barRow}>
                  <Text style={styles.starNum}>{star} ★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {["all", 5, 4, 3].map((f) => (
            <TouchableOpacity
              key={String(f)}
              style={[
                styles.filterPill,
                selectedFilter === f && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === f && styles.filterTextActive,
                ]}
              >
                {f === "all" ? "All Reviews" : `${f} Stars`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews for selected filter.</Text>
        ) : (
          filteredReviews.map((rev) => (
            <View key={rev.id} style={styles.revCard}>
              <View style={styles.revHeader}>
                <View>
                  <Text style={styles.authorName}>{rev.authorName}</Text>
                  <Text style={styles.authorRole}>{rev.authorRole} · {rev.date}</Text>
                </View>

                <View style={styles.revRating}>
                  <Ionicons name="star" size={14} color="#E8A838" />
                  <Text style={styles.revRatingVal}>{rev.rating}.0</Text>
                </View>
              </View>

              <Text style={styles.revComment}>{rev.comment}</Text>

              {rev.tags && (
                <View style={styles.tagWrap}>
                  {rev.tags.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  ratingCard: { flexDirection: "row", backgroundColor: "#FFFFFF", padding: 18, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
  scoreCol: { width: 120, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: "#F1F5F9", paddingRight: 14 },
  scoreNum: { fontSize: 36, fontFamily: fonts.extraBold, color: "#0D1B2A" },
  starsRow: { flexDirection: "row", gap: 2, marginVertical: 4 },
  totalText: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B" },

  barsCol: { flex: 1, paddingLeft: 14, justifyContent: "center", gap: 6 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  starNum: { fontSize: 11, fontFamily: fonts.bold, color: "#0D1B2A", width: 26 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#F1F5F9", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#E8A838", borderRadius: 3 },
  pctText: { fontSize: 10, fontFamily: fonts.regular, color: "#64748B", width: 28 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  filterPillActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  filterText: { fontSize: 12, fontFamily: fonts.medium, color: "#64748B" },
  filterTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  revCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  revHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  authorName: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  authorRole: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  revRating: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  revRatingVal: { fontSize: 12, fontFamily: fonts.bold, color: "#D97706" },
  revComment: { fontSize: 13, fontFamily: fonts.regular, color: "#334155", lineHeight: 20 },

  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tagPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, fontFamily: fonts.medium, color: "#475569" },

  noReviews: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", marginVertical: 30 },
});
