import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../src/theme/colors";

type NotifCategory = "tuition" | "payment" | "demo" | "system" | "message";

interface NotifItem {
  id: string;
  category: NotifCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: NotifItem[] = [
  {
    id: "n-1",
    category: "demo",
    title: "Demo Confirmed",
    message: "Demo class confirmed for Aarav on Sunday, Sep 21 at 4:00 PM",
    time: "2h ago",
    read: true,
  },
  {
    id: "n-2",
    category: "payment",
    title: "Payment Due",
    message: "Monthly tuition bill of ₹6,000 is due for October",
    time: "5h ago",
    read: false,
  },
  {
    id: "n-3",
    category: "message",
    title: "New Message",
    message: "Mrs. Priya Sharma sent you a message",
    time: "1d ago",
    read: false,
  },
  {
    id: "n-4",
    category: "tuition",
    title: "Attendance Update",
    message: "Aarav attended 12/12 classes this month - Perfect Attendance!",
    time: "2d ago",
    read: true,
  },
  {
    id: "n-5",
    category: "system",
    title: "Account Verified",
    message: "BookMySession: Your account was verified successfully",
    time: "3d ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);
  const [activeTab, setActiveTab] = useState<string>("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Tuition" && n.category === "tuition") return true;
    if (activeTab === "Payment" && n.category === "payment") return true;
    if (activeTab === "System" && n.category === "system") return true;
    return false;
  });

  const getIconConfig = (category: NotifCategory) => {
    switch (category) {
      case "tuition":
        return { name: "book-outline" as const, bg: "#EFF6FF", color: "#3B82F6" };
      case "payment":
        return { name: "card-outline" as const, bg: "#ECFDF5", color: "#10B981" };
      case "demo":
        return { name: "star-outline" as const, bg: "#FFFBEB", color: "#F59E0B" };
      case "system":
        return { name: "information-circle-outline" as const, bg: "#F1F5F9", color: "#64748B" };
      case "message":
        return { name: "chatbubble-outline" as const, bg: "#F0FDFA", color: "#14B8A6" };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={appColors.navy} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {["All", "Tuition", "Payment", "System"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const iconConfig = getIconConfig(item.category);
            return (
              <View
                key={item.id}
                style={[
                  styles.notifCard,
                  !item.read && styles.notifUnread
                ]}
              >
                {!item.read && <View style={styles.unreadIndicatorBar} />}
                
                <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>{item.time}</Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                  </View>
                  <Text style={styles.msgText}>{item.message}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F0F4F8" 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#FFFFFF", 
    alignItems: "center", 
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: { 
    fontSize: 24, 
    fontFamily: fonts.bold, 
    color: appColors.navy 
  },
  badge: {
    backgroundColor: appColors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  markReadText: { 
    fontSize: 14, 
    fontFamily: fonts.semiBold, 
    color: appColors.gold 
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabsContent: { 
    paddingHorizontal: 20, 
    gap: 10,
    paddingVertical: 8,
  },
  tabPill: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabPillActive: { 
    backgroundColor: appColors.navy, 
  },
  tabText: { 
    fontSize: 14, 
    fontFamily: fonts.medium, 
    color: "#64748B" 
  },
  tabTextActive: { 
    color: "#FFFFFF", 
    fontFamily: fonts.semiBold 
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 60,
    gap: 12,
  },
  notifCard: { 
    flexDirection: "row", 
    backgroundColor: "#FFFFFF", 
    padding: 16, 
    borderRadius: 14, 
    gap: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notifUnread: { 
    backgroundColor: "#FEFDF8", 
  },
  unreadIndicatorBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: appColors.gold,
  },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  cardContent: { 
    flex: 1,
    justifyContent: "center",
  },
  titleRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleText: { 
    flex: 1,
    fontSize: 14, 
    fontFamily: fonts.bold, 
    color: appColors.navy,
    marginRight: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: { 
    fontSize: 10, 
    fontFamily: fonts.regular, 
    color: "#94A3B8" 
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: appColors.gold,
  },
  msgText: { 
    fontSize: 12, 
    fontFamily: fonts.regular, 
    color: "#64748B", 
    lineHeight: 18 
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: "#64748B",
  },
});
