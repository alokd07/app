import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "@/src/services/auth";
import Avatar from "@/components/Avatar";
import * as WebBrowser from "expo-web-browser";

const { width } = Dimensions.get("window");

const P = {
  navy: "#020817",
  navyMid: "#0F172A",
  gold: "#E8A838",
  goldSoft: "rgba(232, 168, 56, 0.15)",
  goldLight: "#F2C26A",
  border: "rgba(232, 168, 56, 0.3)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  muted: "#64748B",
  success: "#10B981",
  glass: "rgba(255, 255, 255, 0.05)",
};

// ─── Component: Premium Menu Item ───────────────────────────────────────────
function SettingsLink({ icon, label, sublabel, danger, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={18} color={danger ? "#EF4444" : P.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuText, danger && { color: "#EF4444" }]}>
          {label}
        </Text>
        {sublabel && <Text style={styles.menuSubtext}>{sublabel}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color={P.muted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
      loadUser();
    }, []);
  
    const loadUser = async () => {
      const userData = await getUserData();
      setUser(userData);
    };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "Phone Number";

    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");

    // Handle Indian numbers (assumes country code 91)
    if (digits.length === 12 && digits.startsWith("91")) {
      const country = "+91";
      const first = digits.slice(2, 7);
      const second = digits.slice(7, 12);
      return `${country} ${first} ${second}`;
    }

    return phone; // fallback if format not matched
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header & Hero ── */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[P.navy, P.navyMid]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
              {/* Progress Ring */}
              <View style={styles.progressRing} />
              <Avatar
                uri={user?.imageUrl}
                name={user?.firstName || "Student"}
                size={84}
              />
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={14} color={P.navy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>
              {user?.firstName + " " + user?.lastName || "Student"}
            </Text>
            <View style={styles.rankPill}>
              <Ionicons name="ribbon" size={12} color={P.gold} />
              <Text style={styles.rankText}>GOLD STUDENT</Text>
            </View>
          </View>

          {/* ── Floating Stats ── */}
          <View style={styles.glassStats}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLab}>SESSIONS</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>4.9</Text>
              <Text style={styles.statLab}>RATING</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>8</Text>
              <Text style={styles.statLab}>COURSES</Text>
            </View>
          </View>
        </View>

        {/* ── Main Content ── */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.infoCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputLocked]}
                value={
                  user ? user.firstName + " " + user.lastName : "Student Name"
                }
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputLocked]}
                value={formatPhoneNumber(user?.phoneNumber)}
                editable={isEditing}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>
            Preferences
          </Text>
            <View style={styles.settingsCard}>
            <SettingsLink
              icon="notifications-outline"
              label="Notifications"
              sublabel="Alerts, sounds, reminders"
            />
            <View style={styles.hDivider} />
            <SettingsLink
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              sublabel="Password, data usage"
              onPress={() => {
              WebBrowser.openBrowserAsync("https://www.bookmysession.in/privacy-policy");
              }}
            />
            <View style={styles.hDivider} />
            <SettingsLink
              icon="wallet-outline"
              label="Payments"
              sublabel="Invoices, saved cards"
            />
            </View>

          <TouchableOpacity style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>BookMySession • v1.0.4</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  // ── Hero ──
  heroSection: {
    height: 340,
    paddingHorizontal: 25,
    paddingTop: 20,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },

  profileInfo: { alignItems: "center", marginTop: 15 },
  avatarWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: P.gold,
    borderRightColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.gold,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: P.navy,
  },
  userName: { fontSize: 24, fontWeight: "900", color: P.white, marginTop: 15 },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232, 168, 56, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  rankText: {
    fontSize: 10,
    fontWeight: "800",
    color: P.gold,
    letterSpacing: 1,
  },

  // ── Glass Stats ──
  glassStats: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "900", color: P.white },
  statLab: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    letterSpacing: 1,
  },
  vDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
  },

  // ── Content ──
  content: { padding: 25 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: P.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: P.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: P.gold,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: P.navy,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    paddingBottom: 8,
  },
  inputLocked: { borderBottomColor: "transparent", color: P.muted },

  settingsCard: {
    backgroundColor: P.white,
    borderRadius: 24,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 15,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: P.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerIcon: { backgroundColor: "rgba(239, 68, 68, 0.08)" },
  menuText: { fontSize: 15, fontWeight: "700", color: P.navy },
  menuSubtext: { fontSize: 12, color: P.muted, marginTop: 2 },
  hDivider: { height: 1, backgroundColor: P.cream, marginHorizontal: 20 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#EF4444" },
  versionText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 11,
    color: P.muted,
  },
});
