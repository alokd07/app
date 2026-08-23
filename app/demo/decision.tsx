import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { appColors, fonts } from "../../src/theme/colors";

export default function DemoDecisionScreen() {
  const insets = useSafeAreaInsets();
  const { demoId, teacherId, teacherName, pricePerHour } = useLocalSearchParams<{
    demoId: string;
    teacherId: string;
    teacherName: string;
    pricePerHour: string;
  }>();

  const [loading, setLoading] = useState(false);

  const handleChoice = async (decision: "continue" | "not_continue") => {
    setLoading(true);
    try {
      if (demoId) {
        await apiClient.put(API_CONFIG.ENDPOINTS.DEMO_DECISION(demoId), {
          decision,
        });
      }

      if (decision === "continue") {
        router.push({
          pathname: "/select-package",
          params: {
            teacherId,
            teacherName: teacherName || "Teacher",
            pricePerHour: pricePerHour || "500",
          },
        });
      } else {
        Alert.alert(
          "Feedback Saved",
          "Thanks for letting us know! You can browse other available teachers anytime.",
          [
            {
              text: "Browse Teachers",
              onPress: () => router.replace("/(tabs)/home"),
            },
          ]
        );
      }
    } catch (e: any) {
      console.error("Error saving decision:", e);
      if (decision === "continue") {
        router.push({
          pathname: "/select-package",
          params: {
            teacherId,
            teacherName: teacherName || "Teacher",
            pricePerHour: pricePerHour || "500",
          },
        });
      } else {
        router.replace("/(tabs)/home");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        <View style={styles.heroBox}>
          <Ionicons name="sparkles" size={32} color="#E8A838" />
          <Text style={styles.heroTitle}>How was your demo?</Text>
          <Text style={styles.heroSub}>
            Did you enjoy learning with {teacherName || "your teacher"}? Select how you'd like to proceed.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 32 }} />
        ) : (
          <View style={styles.cardsContainer}>
            {/* Continue Option */}
            <TouchableOpacity
              style={styles.cardPrimary}
              activeOpacity={0.9}
              onPress={() => handleChoice("continue")}
            >
              <LinearGradient
                colors={["#020817", "#1A3050"]}
                style={styles.cardGrad}
              >
                <View style={styles.badgeRow}>
                  <View style={styles.badgeGold}>
                    <Text style={styles.badgeGoldText}>RECOMMENDED</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={styles.cardTitleLight}>
                  Continue with {teacherName || "Teacher"}
                </Text>
                <Text style={styles.cardSubLight}>
                  Lock in regular class packages (4, 8, or 12 sessions) and start your structured learning journey.
                </Text>

                <View style={styles.btnActionGold}>
                  <Text style={styles.btnActionGoldText}>Select Package</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Don't Continue Option */}
            <TouchableOpacity
              style={styles.cardSecondary}
              activeOpacity={0.85}
              onPress={() => handleChoice("not_continue")}
            >
              <View style={styles.cardBodySec}>
                <Ionicons name="search-outline" size={28} color="#6B7280" />
                <Text style={styles.cardTitleDark}>Try Another Teacher</Text>
                <Text style={styles.cardSubDark}>
                  Not the perfect match? Browse other qualified subject experts in your area.
                </Text>

                <View style={styles.btnActionOutlined}>
                  <Text style={styles.btnActionOutlinedText}>Browse Others</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  heroBox: { alignItems: "center", marginVertical: 20 },
  heroTitle: { fontSize: 22, fontFamily: fonts.bold, color: "#111827", marginTop: 8 },
  heroSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 16,
  },
  cardsContainer: { gap: 16, marginTop: 12 },
  cardPrimary: { borderRadius: 20, overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  cardGrad: { padding: 20 },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badgeGold: { backgroundColor: "#E8A838", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeGoldText: { color: "#fff", fontSize: 10, fontFamily: fonts.bold },
  cardTitleLight: { fontSize: 18, fontFamily: fonts.bold, color: "#fff", marginBottom: 6 },
  cardSubLight: { fontSize: 13, fontFamily: fonts.regular, color: "#94A3B8", lineHeight: 18, marginBottom: 20 },
  btnActionGold: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8A838",
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnActionGoldText: { color: "#fff", fontSize: 14, fontFamily: fonts.bold },
  cardSecondary: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
  },
  cardBodySec: { alignItems: "flex-start" },
  cardTitleDark: { fontSize: 16, fontFamily: fonts.bold, color: "#111827", marginTop: 12, marginBottom: 4 },
  cardSubDark: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280", lineHeight: 18, marginBottom: 16 },
  btnActionOutlined: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  btnActionOutlinedText: { color: "#374151", fontSize: 14, fontFamily: fonts.semiBold },
});
