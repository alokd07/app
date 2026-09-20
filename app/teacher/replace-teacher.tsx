import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../../src/theme/colors";
import { useTeacherStore } from "../../src/store/teacherStore";

export default function ReplaceTeacherScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { setFilters } = useTeacherStore();

  const targetSubject = subject || "Mathematics";

  const handleProceedToDiscover = () => {
    setFilters({ subject: targetSubject });
    router.replace("/(tabs)/find-teacher");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Switch / Replace Tutor</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="swap-horizontal" size={44} color="#D97706" />
          <Text style={styles.cardTitle}>Replacing Tutor for {targetSubject}</Text>
          <Text style={styles.cardDesc}>
            BookMySession allows you to switch your assigned tutor at any time if you feel the teaching fit isn't 100% optimal.
          </Text>
        </View>

        {/* Policy & Fee Details */}
        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>Replacement Guarantee Policy</Text>

          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.policyText}>Zero Switch Fee (Covered under 100% Satisfaction Guarantee)</Text>
          </View>

          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.policyText}>Unused session credits will be transferred to your new tutor</Text>
          </View>

          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.policyText}>Current tutor will be notified respectfully by BookMySession team</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceedToDiscover}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.proceedText}>Find Replacement Tutor for {targetSubject}</Text>
            <Ionicons name="arrow-forward" size={18} color="#0D1B2A" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  content: { flex: 1, padding: 20, justifyContent: "space-between" },
  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 24, alignItems: "center", textAlign: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  cardTitle: { fontSize: 20, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 12, marginBottom: 8 },
  cardDesc: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", lineHeight: 20 },

  policyBox: { backgroundColor: "#FEF3C7", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#FDE68A", gap: 12 },
  policyTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#92400E" },
  policyRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  policyText: { fontSize: 12, fontFamily: fonts.medium, color: "#78350F", flex: 1, lineHeight: 18 },

  proceedBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  btnGrad: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  proceedText: { color: "#0D1B2A", fontSize: 14, fontFamily: fonts.bold },
});
