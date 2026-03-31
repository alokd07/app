import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { Booking, Teacher } from "../../src/types";
import {
  formatDate,
  formatTime,
  formatCurrency,
} from "../../src/utils/helpers";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.10)",
  goldBorder: "rgba(232,168,56,0.25)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#E4EAF2",
  inputBg: "#F4F7FB",
  success: "#27AE60",
  successPale: "rgba(39,174,96,0.10)",
  error: "#E05252",
  errorPale: "rgba(224,82,82,0.10)",
};

type TabType = "upcoming" | "completed" | "cancelled";

// ─── Sample Booking Data ──────────────────────────────────────────────────────
const sampleBookings = [
  {
    _id: "b1",
    status: "upcoming",
    date: "2026-04-05",
    timeSlot: {
      startTime: "14:00",
      endTime: "15:00",
    },
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
    timeSlot: {
      startTime: "10:30",
      endTime: "11:30",
    },
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
    timeSlot: {
      startTime: "16:00",
      endTime: "17:00",
    },
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
    timeSlot: {
      startTime: "15:00",
      endTime: "16:00",
    },
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
    timeSlot: {
      startTime: "11:00",
      endTime: "12:00",
    },
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
    timeSlot: {
      startTime: "14:30",
      endTime: "15:30",
    },
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
    timeSlot: {
      startTime: "09:00",
      endTime: "10:00",
    },
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
    timeSlot: {
      startTime: "13:00",
      endTime: "14:00",
    },
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

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_BOOKINGS, {
        params: { status: activeTab },
      });

      if (response.data.data) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Use dummy data for development
      const filteredBookings = sampleBookings.filter(
        (b) => b.status === activeTab,
      );
      setBookings(filteredBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return palette.gold;
      case "completed":
        return palette.success;
      case "cancelled":
        return palette.error;
      default:
        return palette.muted;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return palette.goldPale;
      case "completed":
        return palette.successPale;
      case "cancelled":
        return palette.errorPale;
      default:
        return "rgba(138,155,176,0.10)";
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const teacher = typeof item.teacher === "object" ? item.teacher : null;
    const statusColor = getStatusColor(item.status);
    const statusBgColor = getStatusBgColor(item.status);

    return (
      <TouchableOpacity
        style={styles.cardWrap}
        onPress={() => router.push(`/booking/${item._id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.teacherInfo}>
              {teacher?.profileImage ? (
                <Image
                  source={{ uri: teacher.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color={palette.muted} />
                </View>
              )}
              <View style={styles.teacherDetails}>
                <Text style={styles.teacherName}>
                  {teacher?.name || "Teacher"}
                </Text>
                <Text style={styles.teacherSubject}>
                  {teacher?.subject || "Subject"}
                </Text>
              </View>
            </View>

            <View
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={palette.gold}
                />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Ionicons name="time-outline" size={16} color={palette.gold} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {formatTime(item.timeSlot.startTime)} -{" "}
                  {formatTime(item.timeSlot.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Ionicons
                  name={
                    item.mode === "online"
                      ? "videocam-outline"
                      : "location-outline"
                  }
                  size={16}
                  color={palette.gold}
                />
              </View>
              <View>
                <Text style={styles.detailLabel}>Mode</Text>
                <Text style={styles.detailValue}>
                  {item.mode === "online" ? "Online" : "Offline"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Ionicons name="cash-outline" size={16} color={palette.gold} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Paid Amount</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(item.advancePaid)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <LinearGradient
              colors={[palette.gold, palette.goldLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewDetailsBtn}
            >
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
              <Ionicons name="arrow-forward" size={14} color={palette.navy} />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="calendar-outline" size={56} color={palette.gold} />
        </View>
        <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
        <Text style={styles.emptySubtitle}>
          Your {activeTab} sessions will appear here
        </Text>
        {activeTab === "upcoming" && (
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={() => router.push("/book-session")}
          >
            <Text style={styles.bookNowBtnText}>Book a Session</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        {(["upcoming", "completed", "cancelled"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          scrollEnabled={true}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[palette.gold]}
              tintColor={palette.gold}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  headerContainer: {
    backgroundColor: palette.cream,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    letterSpacing: -0.5,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: palette.gold,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: palette.navy,
    fontFamily: "Manrope_700Bold",
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  cardWrap: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  teacherInfo: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: palette.inputBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  teacherSubject: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 14,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.goldPale,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
  },
  cardFooter: {
    overflow: "hidden",
    borderRadius: 12,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 6,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: palette.goldPale,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: palette.goldBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  bookNowBtn: {
    backgroundColor: palette.navy,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 8,
  },
  bookNowBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: 0.2,
  },
});
