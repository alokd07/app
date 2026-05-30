import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData, removeToken } from "@/src/services/auth";
import Avatar from "@/components/Avatar";
import * as WebBrowser from "expo-web-browser";
import { appColors, fonts } from "../../src/theme/colors";
import { useAuthStore } from "@/src/store/authStore";
import Loader from "@/components/Loader";

const P = {
  ...appColors,
  navy: appColors.midnight,
  navyMid: appColors.midnightMid,
  muted: appColors.mutedSlate,
  success: appColors.successAlt,
  border: appColors.goldBorder,
  goldSoft: appColors.goldSoft,
  glass: appColors.glassStrong,
};

type ProfileData = {
  imageUrl?: string;
  firstName: string;
  lastName: string;
  DOB: string;
  gender: string;
  phoneNumber: string;
  houseNumber: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  schoolName: string;
  schoolAddress: string;
};

const EMPTY_PROFILE: ProfileData = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  DOB: "",
  gender: "",
  phoneNumber: "",
  houseNumber: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  country: "India",
  schoolName: "",
  schoolAddress: "",
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  badge?: string;
  onPress: () => void;
};

function StatPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLab}>{label}</Text>
    </View>
  );
}

function MenuCard({ group }: { group: MenuGroup }) {
  return (
    <View style={styles.menuGroup}>
      <Text style={styles.menuGroupTitle}>{group.title}</Text>
      <View style={styles.menuCard}>
        {group.items.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}
              >
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.menuRowContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              {item.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : (
                <View style={styles.chevronBox}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={P.muted}
                  />
                </View>
              )}
            </TouchableOpacity>
            {index < group.items.length - 1 && (
              <View style={styles.menuDivider} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileCompletion({ percent }: { percent: number }) {
  const segments = 12;
  const filled = Math.round((percent / 100) * segments);
  return (
    <View style={styles.completionContainer}>
      <View style={styles.completionHeader}>
        <Text style={styles.completionLabel}>Profile Completion</Text>
        <Text style={styles.completionPct}>{percent}%</Text>
      </View>
      <View style={styles.completionBar}>
        <View style={[styles.completionFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState<ProfileData>(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const { setAuthenticated, setUser: setAuthUser } = useAuthStore();

  const fullName = useMemo(() => {
    const parts = [user.firstName, user.lastName]
      .map((part) => part?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Student";
  }, [user.firstName, user.lastName]);

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      const first = digits.slice(2, 7);
      const second = digits.slice(7, 12);
      return `+91 ${first} ${second}`;
    }
    return phone;
  };

  const profileCompletion = useMemo(() => {
    const fields: (keyof ProfileData)[] = [
      "firstName", "lastName", "DOB", "gender", "phoneNumber",
      "houseNumber", "area", "pincode", "city", "state",
      "schoolName", "schoolAddress",
    ];
    const filled = fields.filter((f) => {
      const v = user[f];
      return v && typeof v === "string" && v.trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const loadUser = async () => {
    const storedUser = await getUserData();
    const normalizedUser =
      storedUser?.student ??
      storedUser?.data?.student ??
      storedUser?.data ??
      storedUser ??
      {};
    setUser({ ...EMPTY_PROFILE, ...normalizedUser });
  };

  useEffect(() => {
    loadUser();
  }, []);

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          setAuthenticated(false);
          router.replace("/auth/login");
        },
      },
    ]);
  }

  const menuGroups: MenuGroup[] = [
    {
      title: "My Profile",
      items: [
        {
          id: "personal",
          icon: "person-outline",
          label: "Personal Details",
          sublabel: "Name, DOB, gender",
          color: "#6366F1",
          bgColor: "rgba(99,102,241,0.12)",
          onPress: () => router.push("/profile/personal-details"),
        },
        {
          id: "contact",
          icon: "call-outline",
          label: "Contact & Address",
          sublabel: "Phone, location details",
          color: "#0EA5E9",
          bgColor: "rgba(14,165,233,0.12)",
          onPress: () => router.push("/profile/contact-details"),
        },
        {
          id: "education",
          icon: "school-outline",
          label: "Education Details",
          sublabel: "School name & address",
          color: "#10B981",
          bgColor: "rgba(16,185,129,0.12)",
          onPress: () => router.push("/profile/education-details"),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "notifications",
          icon: "notifications-outline",
          label: "Notifications",
          sublabel: "Alerts, sounds, reminders",
          color: "#F59E0B",
          bgColor: "rgba(245,158,11,0.12)",
          badge: "3",
          onPress: () => router.push("/notifications"),
        },
        {
          id: "payments",
          icon: "wallet-outline",
          label: "Payments & Invoices",
          sublabel: "Saved cards, billing history",
          color: "#8B5CF6",
          bgColor: "rgba(139,92,246,0.12)",
          onPress: () => router.push("/profile/payments"),
        },
        {
          id: "privacy",
          icon: "shield-checkmark-outline",
          label: "Privacy & Security",
          sublabel: "Password, data controls",
          color: "#E8A838",
          bgColor: "rgba(232,168,56,0.12)",
          onPress: () => {
            WebBrowser.openBrowserAsync(
              "https://www.bookmysession.in/privacy-policy"
            );
          },
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          icon: "help-circle-outline",
          label: "Help & Support",
          sublabel: "FAQs, contact us",
          color: "#14B8A6",
          bgColor: "rgba(20,184,166,0.12)",
          onPress: () => router.push("/profile/help"),
        },
        {
          id: "about",
          icon: "information-circle-outline",
          label: "About BookMySession",
          sublabel: "Version, terms, privacy",
          color: "#6B7280",
          bgColor: "rgba(107,114,128,0.12)",
          onPress: () => router.push("/profile/about"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Loader visible={isSaving} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[P.navy, P.navyMid]}
            style={StyleSheet.absoluteFill}
          />

          {/* Settings shortcut */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/profile/settings")}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Avatar + name */}
          <View style={styles.heroBody}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarRing} />
              <Avatar
                uri={user.imageUrl}
                name={user.firstName || "Student"}
                size={86}
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                activeOpacity={0.85}
                onPress={() => router.push("/profile/personal-details")}
              >
                <Ionicons name="camera" size={14} color={P.navy} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroName}>{fullName}</Text>
            <Text style={styles.heroPhone}>
              {formatPhoneNumber(user.phoneNumber)}
            </Text>
            <View style={styles.rankPill}>
              <Ionicons name="ribbon" size={12} color={P.gold} />
              <Text style={styles.rankText}>GOLD STUDENT</Text>
            </View>
          </View>

          {/* Stats bar */}
          <View style={styles.statsBar}>
            <StatPill value="12" label="SESSIONS" />
            <View style={styles.statDivider} />
            <StatPill value="4.9" label="RATING" />
            <View style={styles.statDivider} />
            <StatPill value="8" label="COURSES" />
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Completion Bar */}
          <ProfileCompletion percent={profileCompletion} />

          {/* Menu Groups */}
          {menuGroups.map((group) => (
            <MenuCard key={group.title} group={group} />
          ))}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutBtn}
            activeOpacity={0.85}
          >
            <View style={styles.signOutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>BookMySession • v1.0.4</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  // ── Hero ──
  hero: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  settingsBtn: {
    position: "absolute",
    top: 18,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroBody: {
    alignItems: "center",
    marginTop: 8,
  },
  avatarWrapper: {
    width: 104,
    height: 104,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarRing: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2.5,
    borderColor: P.gold,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: P.gold,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: P.navy,
  },
  heroName: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  heroPhone: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232,168,56,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.3)",
  },
  rankText: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
    color: P.gold,
    letterSpacing: 1.2,
  },

  // ── Stats ──
  statsBar: {
    flexDirection: "row",
    marginTop: 22,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statVal: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
  },
  statLab: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: "rgba(255,255,255,0.45)",
    marginTop: 3,
    letterSpacing: 1.2,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
  },

  // ── Content ──
  content: { paddingHorizontal: 18, paddingTop: 20 },

  // ── Completion ──
  completionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  completionLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#374151",
  },
  completionPct: {
    fontSize: 13,
    fontFamily: fonts.extraBold,
    color: P.gold,
  },
  completionBar: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    overflow: "hidden",
  },
  completionFill: {
    height: "100%",
    backgroundColor: P.gold,
    borderRadius: 99,
  },

  // ── Menu Groups ──
  menuGroup: { marginBottom: 18 },
  menuGroupTitle: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: P.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  menuRowContent: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  menuSublabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 74,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  badgePill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },

  // ── Sign Out ──
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  signOutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#EF4444",
    flex: 1,
  },

  versionText: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "#D1D5DB",
    marginBottom: 4,
  },
});
