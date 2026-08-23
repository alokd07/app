import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/authStore";
import { appColors, fonts } from "../src/theme/colors";

const P = appColors;

const PACKAGES = [
  {
    id: "pkg_4",
    title: "Starter Package",
    sessions: 4,
    discountPct: 5,
    tag: "Popular",
    desc: "1 session/week for 1 month. Perfect for getting started.",
  },
  {
    id: "pkg_8",
    title: "Pro Learner",
    sessions: 8,
    discountPct: 10,
    tag: "Best Value",
    desc: "2 sessions/week for 1 month. Recommended for steady progress.",
  },
  {
    id: "pkg_12",
    title: "Mastery Pack",
    sessions: 12,
    discountPct: 15,
    tag: "Max Savings",
    desc: "3 sessions/week for 1 month. Ideal for intensive exam prep.",
  },
];

export default function SelectPackageScreen() {
  const insets = useSafeAreaInsets();
  const { teacherId, teacherName, pricePerHour } = useLocalSearchParams<{
    teacherId: string;
    teacherName: string;
    pricePerHour: string;
  }>();

  const user = useAuthStore((state) => state.user);
  const baseRate = parseInt(pricePerHour || "500", 10);
  const [selectedPkgId, setSelectedPkgId] = useState("pkg_8");

  const selectedPkg = PACKAGES.find((p) => p.id === selectedPkgId) || PACKAGES[1];
  const rawTotal = baseRate * selectedPkg.sessions;
  const discountAmount = Math.round((rawTotal * selectedPkg.discountPct) / 100);
  const finalTotal = rawTotal - discountAmount;
  const perSessionEffective = Math.round(finalTotal / selectedPkg.sessions);

  const handleProceedToPayment = () => {
    router.push({
      pathname: "/payment",
      params: {
        studentId: user?._id || "",
        teacherId: teacherId || "",
        teacherName: teacherName || "Teacher",
        packageId: selectedPkg.id,
        sessionsCount: String(selectedPkg.sessions),
        amount: String(finalTotal),
        perSessionRate: String(perSessionEffective),
      },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <Text style={styles.sectionHeading}>Choose a Learning Plan</Text>
        <Text style={styles.sectionSub}>
          Save more per session by choosing a multi-session package.
        </Text>

        <View style={styles.pkgList}>
          {PACKAGES.map((pkg) => {
            const isSelected = pkg.id === selectedPkgId;
            const pkgRaw = baseRate * pkg.sessions;
            const pkgDiscount = Math.round((pkgRaw * pkg.discountPct) / 100);
            const pkgFinal = pkgRaw - pkgDiscount;
            const pkgPerSession = Math.round(pkgFinal / pkg.sessions);

            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.pkgCard,
                  isSelected && styles.pkgCardSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedPkgId(pkg.id)}
              >
                {/* Tag */}
                <View style={styles.pkgHeader}>
                  <Text
                    style={[
                      styles.pkgTitle,
                      isSelected && styles.pkgTitleSelected,
                    ]}
                  >
                    {pkg.title}
                  </Text>
                  {pkg.tag && (
                    <View
                      style={[
                        styles.tagBadge,
                        isSelected && styles.tagBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          isSelected && styles.tagTextSelected,
                        ]}
                      >
                        {pkg.tag}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.pkgDesc}>{pkg.desc}</Text>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.finalPrice}>₹{pkgFinal.toLocaleString()}</Text>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      <Text style={styles.rawPrice}>₹{pkgRaw}</Text>
                      <Text style={styles.discountBadge}>
                        {pkg.discountPct}% OFF
                      </Text>
                    </View>
                  </View>
                  <View style={styles.perSessionWrap}>
                    <Text style={styles.perSessionVal}>₹{pkgPerSession}</Text>
                    <Text style={styles.perSessionLabel}>/ session</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Rate</Text>
            <Text style={styles.summaryVal}>₹{baseRate} / session</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sessions Count</Text>
            <Text style={styles.summaryVal}>{selectedPkg.sessions} sessions</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package Savings</Text>
            <Text style={[styles.summaryVal, { color: "#10B981" }]}>
              -₹{discountAmount} ({selectedPkg.discountPct}% off)
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingTop: 12 }]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{finalTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={handleProceedToPayment}
        >
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>Proceed to Payment · ₹{finalTotal.toLocaleString()}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  headerSub: { fontSize: 12, fontFamily: fonts.regular, color: "#6B7280" },
  sectionHeading: { fontSize: 18, fontFamily: fonts.bold, color: "#111827", marginTop: 8 },
  sectionSub: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280", marginTop: 4, marginBottom: 16 },
  pkgList: { gap: 12 },
  pkgCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  pkgCardSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  pkgHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  pkgTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  pkgTitleSelected: { color: "#4F46E5" },
  tagBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagBadgeSelected: { backgroundColor: "#6366F1" },
  tagText: { fontSize: 11, fontFamily: fonts.bold, color: "#4B5563" },
  tagTextSelected: { color: "#fff" },
  pkgDesc: { fontSize: 12, fontFamily: fonts.regular, color: "#6B7280", marginBottom: 14 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  finalPrice: { fontSize: 20, fontFamily: fonts.bold, color: "#111827" },
  rawPrice: { fontSize: 13, fontFamily: fonts.medium, color: "#9CA3AF", textDecorationLine: "line-through" },
  discountBadge: { fontSize: 12, fontFamily: fonts.bold, color: "#10B981" },
  perSessionWrap: { alignItems: "flex-end" },
  perSessionVal: { fontSize: 15, fontFamily: fonts.bold, color: "#4F46E5" },
  perSessionLabel: { fontSize: 11, fontFamily: fonts.regular, color: "#6B7280" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  summaryHeading: { fontSize: 14, fontFamily: fonts.bold, color: "#111827", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  summaryLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280" },
  summaryVal: { fontSize: 13, fontFamily: fonts.semiBold, color: "#111827" },
  totalLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#111827" },
  totalVal: { fontSize: 16, fontFamily: fonts.bold, color: "#4F46E5" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
});
