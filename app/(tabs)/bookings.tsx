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

const sampleBookings = [
  {
    _id: "b1",
    status: "upcoming",
    date: "2026-04-05",
    timeSlot: { startTime: "14:00", endTime: "15:00" },
    mode: "online",
    advancePaid: 500,
    teacher: {
      _id: "t1",
      name: "Ananya Sharma",
      subject: "Mathematics",
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    _id: "b2",
    status: "upcoming",
    date: "2026-04-08",
    timeSlot: { startTime: "10:30", endTime: "11:30" },
    mode: "offline",
    advancePaid: 600,
    teacher: {
      _id: "t2",
      name: "Priya Singh",
      subject: "English Literature",
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  },
  {
    _id: "b3",
    status: "upcoming",
    date: "2026-04-12",
    timeSlot: { startTime: "16:00", endTime: "17:00" },
    mode: "online",
    advancePaid: 550,
    teacher: {
      _id: "t3",
      name: "Rahul Verma",
      subject: "Physics",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    _id: "b4",
    status: "completed",
    date: "2026-03-28",
    timeSlot: { startTime: "15:00", endTime: "16:00" },
    mode: "online",
    advancePaid: 500,
    teacher: {
      _id: "t1",
      name: "Ananya Sharma",
      subject: "Mathematics",
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    _id: "b5",
    status: "completed",
    date: "2026-03-25",
    timeSlot: { startTime: "11:00", endTime: "12:00" },
    mode: "offline",
    advancePaid: 600,
    teacher: {
      _id: "t2",
      name: "Priya Singh",
      subject: "English Literature",
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  },
  {
    _id: "b6",
    status: "completed",
    date: "2026-03-20",
    timeSlot: { startTime: "14:30", endTime: "15:30" },
    mode: "online",
    advancePaid: 550,
    teacher: {
      _id: "t4",
      name: "Neha Gupta",
      subject: "Biology",
      profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    },
  },
  {
    _id: "b7",
    status: "cancelled",
    date: "2026-03-22",
    timeSlot: { startTime: "09:00", endTime: "10:00" },
    mode: "online",
    advancePaid: 500,
    teacher: {
      _id: "t5",
      name: "Arjun Mehta",
      subject: "Chemistry",
      profileImage: "https://randomuser.me/api/portraits/men/76.jpg",
    },
  },
  {
    _id: "b8",
    status: "cancelled",
    date: "2026-03-18",
    timeSlot: { startTime: "13:00", endTime: "14:00" },
    mode: "offline",
    advancePaid: 650,
    teacher: {
      _id: "t3",
      name: "Rahul Verma",
      subject: "Physics",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
];

// ─── Component: Interactive Tab ──────────────────────────────────────────────
function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: any) => void;
}) {
  const tabs = ["upcoming", "completed", "cancelled"];
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    Animated.spring(translateX, {
      toValue: index * ((width - 40) / 3),
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  }, [activeTab]);

  return (
    <View style={styles.tabContainer}>
      <Animated.View
        style={[styles.tabSlider, { transform: [{ translateX }] }]}
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
    item.status === "upcoming"
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
              <Image
                source={{ uri: item.teacher.profileImage }}
                style={styles.teacherAvatar}
              />
              <View>
                <Text style={styles.passTeacherName}>{item.teacher.name}</Text>
                <Text style={styles.passSubject}>{item.teacher.subject}</Text>
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
              <Text style={styles.modeTextNew}>{item.mode.toUpperCase()}</Text>
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
                {formatTime(item.timeSlot.startTime)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.paidText}>₹{item.advancePaid}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  // Stats Logic
  const stats = [
    { label: "Active", value: "3", icon: "flash" },
    { label: "Hours", value: "24", icon: "time" },
    { label: "Saved", value: "₹2.4k", icon: "wallet" },
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
      <FlatList
        data={
          activeTab === "upcoming"
            ? sampleBookings.slice(0, 3)
            : sampleBookings.slice(3, 6)
        }
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <BookingCard item={item} index={index} />
        )}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sessions found.</Text>
        }
      />
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
  paidText: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.success },
  emptyText: { textAlign: "center", color: P.muted, marginTop: 40 },
});
