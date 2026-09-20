import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../../src/theme/colors";

export default function AccountTypeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>WELCOME TO BOOKMYSESSION</Text>
          <Text style={styles.title}>One App for Students & Parents</Text>
          <Text style={styles.subtitle}>
            Book personalized home tuition and online classes. Manage your own learning or track your child's progress effortlessly.
          </Text>
        </View>

        {/* Unified Capabilities Card */}
        <View style={styles.card}>
          <LinearGradient
            colors={["#0D1B2A", "#1A3050"]}
            style={styles.cardGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={22} color="#E8A838" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Student Self-Learning</Text>
                <Text style={styles.featureDesc}>
                  Discover top teachers, schedule sessions, attend live classes, and get exam ready.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="people" size={22} color="#E8A838" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Parent Child Management</Text>
                <Text style={styles.featureDesc}>
                  Create profiles for multiple children (e.g., Aarav, Ananya), book tutors, track spending & progress.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { flex: 1, padding: 24, justifyContent: "space-between" },
  header: { marginTop: 20 },
  badge: { fontSize: 10, fontFamily: fonts.extraBold, color: "#E8A838", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: "#0D1B2A", lineHeight: 36, marginBottom: 12 },
  subtitle: { fontSize: 14, fontFamily: fonts.regular, color: "#64748B", lineHeight: 22 },

  card: { borderRadius: 20, overflow: "hidden", marginVertical: 20, elevation: 4 },
  cardGrad: { padding: 20 },
  featureRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(232,168,56,0.15)", alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#FFFFFF", marginBottom: 4 },
  featureDesc: { fontSize: 13, fontFamily: fonts.regular, color: "#94A3B8", lineHeight: 19 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 16 },

  continueBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  btnGrad: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  continueText: { color: "#FFFFFF", fontSize: 16, fontFamily: fonts.bold },
});
