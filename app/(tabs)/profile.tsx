import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useUserStore } from "../../src/store/userStore";
import { useAuthStore } from "../../src/store/authStore";
import { useTuitionStore } from "../../src/store/tuitionStore";

/* ── Design tokens matching progress.tsx & tuition.tsx ── */
const C = {
  ink: "#0D1B2A",
  inkSoft: "#1E3A5F",
  amber: "#E8A838",
  amberDeep: "#B7791F",
  amberTint: "#FFF7E6",
  amberLine: "#F6E3B4",
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#E8ECF1",
  track: "#EEF1F5",
  muted: "#64748B",
  faint: "#94A3B8",
  green: "#10B981",
  greenTint: "#ECFDF5",
  red: "#EF4444",
  redTint: "#FEF2F2",
  orange: "#F59E0B",
  orangeTint: "#FEF3C7",
  indigo: "#4F46E5",
  indigoTint: "#EEF2FF",
  cyan: "#0D9488",
  cyanTint: "#F0FDFA",
  purple: "#9333EA",
  purpleTint: "#F3E8FF",
  blue: "#2563EB",
  blueTint: "#DBEAFE",
};

export default function ProfileScreen() {
  const { user, children, addresses, paymentMethods, activeChildId, setActiveChildId } =
    useUserStore();
  const { activeTuitions, getLatestInvoiceForChild } = useTuitionStore();
  const logout = useAuthStore((s) => s.logout);

  const hasDueInvoice = children.some((c) => {
    const inv = getLatestInvoiceForChild(c.id);
    return inv && inv.status === "DUE";
  });

  const liveTuitionsCount = activeTuitions.filter(
    (t) => t.status === "ACTIVE"
  ).length;

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your BookMySession parent account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Parent Profile</Text>
          <Text style={styles.subtitle}>
            Account, family & session settings
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => router.push("/profile/settings")}
          activeOpacity={0.85}
        >
          <Ionicons name="settings-outline" size={20} color={C.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── PROFILE SPOTLIGHT (MODERN & CARDLESS) ── */}
        <View style={styles.profileSpotlight}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.verifiedIconWrap}>
                <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.statusBadgeRow}>
                <View style={styles.verifiedBadge}>
                  <View style={styles.verifiedDot} />
                  <Text style={styles.verifiedBadgeText}>Verified Parent</Text>
                </View>
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={12} color={C.muted} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {user.location || "Vasant Vihar, New Delhi"}
                  </Text>
                </View>
              </View>

              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userContact}>
                {user.phone} · {user.email}
              </Text>
            </View>
          </View>

          {/* Quick Action Pill Row */}
          <View style={styles.profileActionRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/profile/personal-details")}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="account-edit" size={18} color={C.ink} />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addressPillBtn}
              onPress={() => router.push("/profile/addresses")}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="home-edit" size={18} color={C.amberDeep} />
              <Text style={styles.addressPillBtnText}>
                {addresses.length} Saved Address
                {addresses.length > 1 ? "es" : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FAMILY & ACCOUNT STATS BANNER ── */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{children.length}</Text>
              <Text style={styles.statLabel}>Enrolled children</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: C.green }]}>
                {liveTuitionsCount}
              </Text>
              <Text style={styles.statLabel}>Active home tuitions</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{paymentMethods.length}</Text>
              <Text style={styles.statLabel}>Payment methods</Text>
            </View>
          </View>
        </View>

        {/* ── CHILDREN SECTION ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <TouchableOpacity
            style={styles.addChildPill}
            onPress={() => router.push("/parent/add-child")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color={C.amberDeep} />
            <Text style={styles.addChildPillText}>Add Child</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {children.map((child, index) => {
            const isChildActive = child.id === activeChildId;
            const childActiveTuition = activeTuitions.find(
              (t) => t.childId === child.id && t.status === "ACTIVE",
            );

            return (
              <TouchableOpacity
                key={child.id}
                activeOpacity={0.75}
                onPress={() => {
                  setActiveChildId(child.id);
                  router.push("/(tabs)/tuition");
                }}
                style={[
                  styles.childRow,
                  index < children.length - 1 && styles.rowBorderBottom,
                  isChildActive && styles.childActive,
                ]}
              >
                <View style={styles.childAvatarWrap}>
                  <Image
                    source={{ uri: child.avatar }}
                    style={styles.childAvatar}
                  />
                  {isChildActive && (
                    <View style={styles.activeChildIndicator} />
                  )}
                </View>

                <View style={styles.childInfo}>
                  <View style={styles.childNameRow}>
                    <Text style={styles.childName}>{child.name}</Text>
                    {isChildActive && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>Active</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.childGrade}>
                    {child.grade} · {child.school}
                  </Text>

                  <View style={styles.childSubjectsRow}>
                    {child.subjects.slice(0, 3).map((sub, i) => (
                      <View key={i} style={styles.subjectChip}>
                        <Text style={styles.subjectChipText}>{sub}</Text>
                      </View>
                    ))}
                    {childActiveTuition && (
                      <View style={styles.tuitionStatusChip}>
                        <View style={styles.tuitionActiveDot} />
                        <Text style={styles.tuitionStatusText}>
                          {childActiveTuition.teacherName.split(" ")[0]} Sir
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={C.faint} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── LEARNING & TUITION MANAGEMENT ── */}
        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Learning & Tuition
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/tuition")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.amberTint }]}>
              <Ionicons name="school-outline" size={20} color={C.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>My Home Tuition Hub</Text>
              <Text style={styles.menuSub}>
                Manage active tutors, schedule & classes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/progress")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.indigoTint }]}>
              <Ionicons name="analytics-outline" size={20} color={C.indigo} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Academic Progress & Tests</Text>
              <Text style={styles.menuSub}>
                Test scores, syllabus tracking & analytics
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/billing")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.greenTint }]}>
              <Ionicons name="receipt-outline" size={20} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Monthly Bills & Invoices</Text>
              <Text style={styles.menuSub}>
                Tuition fee receipts & monthly statements
              </Text>
            </View>
            {hasDueInvoice ? (
              <View style={styles.dueBadge}>
                <Text style={styles.dueBadgeText}>DUE</Text>
              </View>
            ) : (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAID</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => router.push("/favorites")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.redTint }]}>
              <Ionicons name="heart-outline" size={20} color={C.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Saved Favorite Teachers</Text>
              <Text style={styles.menuSub}>Shortlisted tutors for booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>
        </View>

        {/* ── ACCOUNT & PREFERENCES ── */}
        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Account & Preferences
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/personal-details")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="person-outline" size={20} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Personal & Contact Details</Text>
              <Text style={styles.menuSub}>Name, phone number & email</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/addresses")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.orangeTint }]}>
              <Ionicons name="location-outline" size={20} color={C.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Saved Home Addresses</Text>
              <Text style={styles.menuSub}>
                {addresses.length} verified location
                {addresses.length > 1 ? "s" : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/payments")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.blueTint }]}>
              <Ionicons name="card-outline" size={20} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Payment Methods</Text>
              <Text style={styles.menuSub}>
                {paymentMethods.length} saved (UPI & Cards)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/notification-settings")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.purpleTint }]}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={C.purple}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Notifications & Alerts</Text>
              <Text style={styles.menuSub}>
                Session reminders & billing alerts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.rowBorderBottom]}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/help")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.cyanTint }]}>
              <Ionicons name="help-buoy-outline" size={20} color={C.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Help & Parent Support</Text>
              <Text style={styles.menuSub}>
                FAQs, WhatsApp assistance & guidelines
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/report-teacher")}
          >
            <View style={[styles.menuIcon, { backgroundColor: C.redTint }]}>
              <Ionicons name="flag-outline" size={20} color={C.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: C.red }]}>
                Report an Issue
              </Text>
              <Text style={styles.menuSub}>
                Feedback on teacher conduct or safety
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </TouchableOpacity>
        </View>

        {/* ── APP INFO FOOTER ── */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appInfoBrand}>BookMySession</Text>
          <Text style={styles.appInfoText}>
            Version 2.0 · Home Tutoring Made Safe & Seamless
          </Text>
        </View>

        {/* ── LOGOUT BUTTON ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={C.red} />
          <Text style={styles.logoutText}>Log Out from Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 28 : 12,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: C.muted,
    marginTop: 2,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    ...softShadow,
  },

  /* ── Profile Spotlight (Cardless Hero) ── */
  profileSpotlight: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...softShadow,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: C.amber,
  },
  verifiedIconWrap: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.surface,
  },
  profileInfo: {
    flex: 1,
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.greenTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: C.green,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.track,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  locationText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: C.muted,
  },
  userName: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: C.ink,
    letterSpacing: -0.3,
  },
  userContact: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: C.muted,
    marginTop: 2,
  },

  /* Action Buttons in Spotlight */
  profileActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.track,
    paddingVertical: 9,
    borderRadius: 12,
  },
  editProfileBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.ink,
  },
  addressPillBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.amberTint,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addressPillBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.amberDeep,
  },

  /* ── Card (Progress.tsx styling) ── */
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...softShadow,
  },

  /* ── Stats Row ── */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: C.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: C.line,
  },

  /* ── Section Header ── */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: C.ink,
    letterSpacing: -0.3,
  },
  sectionGap: {
    marginTop: 14,
    marginBottom: 12,
  },
  addChildPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.amberTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addChildPillText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: C.amberDeep,
  },

  /* ── Children List Rows ── */
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  childActive:{
    backgroundColor: C.amberTint,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
    paddingLeft: 5,
  },
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  childAvatarWrap: {
    position: "relative",
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  activeChildIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: C.amber,
    borderWidth: 2,
    borderColor: C.surface,
  },
  childInfo: {
    flex: 1,
  },
  childNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  childName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  selectedPill: {
    backgroundColor: C.amberTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedPillText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: C.amberDeep,
  },
  childGrade: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: C.muted,
    marginTop: 2,
  },
  childSubjectsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  subjectChip: {
    backgroundColor: C.track,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectChipText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: C.ink,
  },
  tuitionStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.greenTint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tuitionActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.green,
  },
  tuitionStatusText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: C.green,
  },

  /* ── Menu Rows ── */
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  menuSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: C.muted,
    marginTop: 2,
  },
  dueBadge: {
    backgroundColor: C.redTint,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
  },
  dueBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: C.red,
  },
  paidBadge: {
    backgroundColor: C.greenTint,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
  },
  paidBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: C.green,
  },

  /* ── App Info ── */
  appInfoContainer: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  appInfoBrand: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: C.faint,
    marginTop: 2,
  },

  /* ── Logout Button ── */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.redTint,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 40,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: C.red,
  },
});
