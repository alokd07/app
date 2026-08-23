import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  formatDate,
  formatTime,
  formatCurrency,
} from "../../src/utils/helpers";
import Avatar from "@/components/Avatar";
import { appColors } from "../../src/theme/colors";
import { useAuthStore } from "@/src/store/authStore";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";

const { width } = Dimensions.get("window");

const P = {
  ...appColors,
  navy: appColors.midnight,
  navyMid: appColors.midnightMid,
  muted: appColors.mutedSlate,
  border: appColors.borderSlate,
  success: appColors.successAlt,
  error: appColors.errorAlt,
  goldSoft: appColors.goldPale,
};


// ─── Component: Interactive Tab ──────────────────────────────────────────────
function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: any) => void;
}) {
  const tabs = ["upcoming", "demos", "completed", "cancelled"];
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    Animated.spring(translateX, {
      toValue: index * ((width - 40) / 4),
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  }, [activeTab]);

  return (
    <View style={styles.tabContainer}>
      <Animated.View
        style={[styles.tabSlider, { width: (width - 40) / 4, transform: [{ translateX }] }]}
      />
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabChange(tab);
          }}
          style={styles.tabItem}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Component: Demo Pass Card ────────────────────────────────────────────────
function DemoCard({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  const badgeColor =
    item.status === "accepted" ? "#10B981" : item.status === "pending" ? "#F59E0B" : item.status === "rejected" ? "#EF4444" : "#6B7280";

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.passCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/demo/${item._id}`)}
      >
        <View style={[styles.passLeft, { backgroundColor: badgeColor }]} />
        <View style={styles.passMain}>
          <View style={styles.passHeader}>
            <View style={styles.teacherRow}>
              {item.teacher?.profileImage ? (
                <Image source={{ uri: item.teacher.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.teacher?.name?.[0] || "T"}</Text>
                </View>
              )}
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.teacherNameNew}>{item.teacher?.name || "Teacher"}</Text>
                  <View style={{ backgroundColor: item.isFree ? "#ECFDF5" : "#FFFBEB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Manrope_700Bold", color: item.isFree ? "#059669" : "#B45309" }}>
                      {item.isFree ? "FREE DEMO" : `₹${item.amount}`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.teacherSubNew}>{item.teacher?.subject || "Demo Class"}</Text>
              </View>
            </View>
            <View style={[styles.modeBadgeNew, { backgroundColor: `${badgeColor}15` }]}>
              <Text style={[styles.modeTextNew, { color: badgeColor }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.passDivider} />

          <View style={styles.passDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={P.muted} />
              <Text style={styles.detailText}>
                {new Date(item.requestedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={P.muted} />
              <Text style={styles.detailText}>
                {item.requestedTime?.startTime} - {item.requestedTime?.endTime}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Component: Booking Card (The "Learning Pass") ───────────────────────────
function BookingCard({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statusColor =
    item.status === "upcoming" || item.status === "pending" || item.status === "confirmed"
      ? P.gold
      : item.status === "completed"
        ? P.success
        : P.error;

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={styles.passCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/booking/${item._id}`)}
      >
        {/* Left Side: Vertical Accent & Profile */}
        <View style={[styles.passLeft, { backgroundColor: statusColor }]} />

        <View style={styles.passMain}>
          <View style={styles.passHeader}>
            <View style={styles.teacherRow}>
              {item.teacher?.profileImage ? (
                <Image
                  source={{ uri: item.teacher.profileImage }}
                  style={styles.teacherAvatar}
                />
              ) : (
                <View style={[styles.teacherAvatar, { backgroundColor: P.navyMid, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="person" size={20} color={P.gold} />
                </View>
              )}
              <View>
                <Text style={styles.passTeacherName}>{item.teacher?.name || "Teacher"}</Text>
                <Text style={styles.passSubject}>{item.teacher?.subject || "General"}</Text>
              </View>
            </View>
            <View
              style={[styles.modeBadgeNew, { backgroundColor: P.goldSoft }]}
            >
              <Ionicons
                name={item.mode === "online" ? "videocam" : "location"}
                size={10}
                color={P.gold}
              />
              <Text style={styles.modeTextNew}>{(item.mode || "online").toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.passDivider} />

          <View style={styles.passDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={P.muted} />
              <Text style={styles.detailText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={P.muted} />
              <Text style={styles.detailText}>
                {item.timeSlot?.startTime ? formatTime(item.timeSlot.startTime) : "—"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.paidText}>₹{item.advancePaid || 500}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([
        apiClient.get(API_CONFIG.ENDPOINTS.MY_BOOKINGS).catch(() => null),
        apiClient.get(API_CONFIG.ENDPOINTS.MY_DEMOS).catch(() => null),
      ]);
      if (bRes?.data?.success && Array.isArray(bRes.data.data)) {
        setBookings(bRes.data.data);
      } else if (Array.isArray(bRes?.data)) {
        setBookings(bRes.data);
      }
      if (dRes?.data?.success && Array.isArray(dRes.data.data)) {
        setDemos(dRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings(false);
  };

  const getFilteredBookings = () => {
    const now = new Date().getTime();
    return bookings.filter((b) => {
      const sessionDate = new Date(b.date).getTime();
      const isPast = sessionDate < now;

      if (activeTab === "upcoming") {
        return (
          (b.status === "upcoming" || b.status === "pending" || b.status === "confirmed") &&
          !isPast
        );
      }
      if (activeTab === "completed") {
        return (
          b.status === "completed" ||
          ((b.status === "confirmed" || b.status === "pending") && isPast)
        );
      }
      if (activeTab === "cancelled") {
        return b.status === "cancelled";
      }
      return true;
    });
  };

  const now = new Date().getTime();
  const activeCount = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "pending") &&
      new Date(b.date).getTime() >= now
  ).length;

  const completedCount = bookings.filter(
    (b) =>
      b.status === "completed" ||
      ((b.status === "confirmed" || b.status === "pending") &&
        new Date(b.date).getTime() < now)
  ).length;

  // Stats Logic
  const stats = [
    { label: "Active", value: String(activeCount), icon: "flash" },
    { label: "Sessions", value: String(completedCount), icon: "time" },
    { label: "Total", value: String(bookings.length), icon: "wallet" },
  ];

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.headerNew}>
        <View>
          <Text style={styles.greetingNew}>Your Schedule</Text>
          <Text style={styles.titleNew}>Sessions</Text>
        </View>
        <TouchableOpacity style={styles.profileCircle}>
          <Avatar uri={user?.imageUrl} name={user?.firstName} size={44} />
        </TouchableOpacity>
      </View>

      {/* ── Insights Row ── */}
      <View style={styles.insightRow}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.insightCard}>
            <View style={styles.insightIconWrap}>
              <Ionicons name={stat.icon as any} size={14} color={P.gold} />
            </View>
            <View>
              <Text style={styles.insightVal}>{stat.value}</Text>
              <Text style={styles.insightLab}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Tabs ── */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── List ── */}
      {activeTab === "demos" ? (
        <FlatList
          data={demos}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <DemoCard item={item} index={index} />
          )}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[P.gold]} tintColor={P.gold} />
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={P.gold} style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.emptyText}>No demo requests found.</Text>
            )
          }
        />
      ) : (
        <FlatList
          data={getFilteredBookings()}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <BookingCard item={item} index={index} />
          )}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[P.gold]} tintColor={P.gold} />
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={P.gold} style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.emptyText}>No sessions found.</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },
  headerNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greetingNew: {
    fontSize: 13,
    color: P.muted,
    fontFamily: "Manrope_600SemiBold",
  },
  titleNew: {
    fontSize: 28,
    color: P.navy,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -1,
  },
  profileCircle: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Insights
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: P.white,
    padding: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  insightIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: P.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  insightVal: { fontSize: 15, fontFamily: "Manrope_700Bold", color: P.navy },
  insightLab: {
    fontSize: 10,
    color: P.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    marginBottom: 15,
  },
  tabSlider: {
    position: "absolute",
    width: (width - 40) / 3,
    height: 40,
    backgroundColor: P.white,
    borderRadius: 11,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: P.muted },
  tabTextActive: { color: P.navy, fontFamily: "Manrope_700Bold" },

  // Pass Card
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  passCard: {
    flexDirection: "row",
    backgroundColor: P.white,
    borderRadius: 20,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  passLeft: { width: 6 },
  passMain: { flex: 1, padding: 16 },
  passHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  teacherRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  teacherAvatar: { width: 44, height: 44, borderRadius: 12 },
  passTeacherName: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
  },
  passSubject: { fontSize: 12, color: P.muted },
  modeBadgeNew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeTextNew: {
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
    color: P.gold,
  },

  passDivider: {
    height: 1,
    backgroundColor: P.border,
    marginVertical: 12,
    borderStyle: "dashed",
  },

  passDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: P.navy,
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontFamily: "Manrope_700Bold" },
  teacherNameNew: { fontSize: 15, fontFamily: "Manrope_700Bold", color: P.navy },
  teacherSubNew: { fontSize: 12, color: P.muted, marginTop: 2 },
  paidText: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.success },
  emptyText: { textAlign: "center", color: P.muted, marginTop: 40 },
});
