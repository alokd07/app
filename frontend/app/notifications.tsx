import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  SectionList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const P = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldDim: "rgba(232,168,56,0.12)",
  goldBorder: "rgba(232,168,56,0.28)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  mutedDark: "#5A7080",
  border: "#E4EAF2",
  inputBg: "#F4F7FB",
  success: "#27AE60",
  successPale: "rgba(39,174,96,0.10)",
  successBorder: "rgba(39,174,96,0.25)",
  error: "#E05252",
  errorPale: "rgba(224,82,82,0.10)",
  errorBorder: "rgba(224,82,82,0.25)",
  info: "#3B82F6",
  infoPale: "rgba(59,130,246,0.10)",
  infoBorder: "rgba(59,130,246,0.20)",
  warning: "#F59E0B",
  warningPale: "rgba(245,158,11,0.10)",
  warningBorder: "rgba(245,158,11,0.22)",
};

// ─── Types ─────────────────────────────────────────────────────────────────────
type NotifType = "booking" | "payment" | "reminder" | "promo" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

// ─── Sample Data ───────────────────────────────────────────────────────────────
const RAW_NOTIFS: Notification[] = [
  {
    id: "n1",
    type: "booking",
    read: false,
    title: "Session Confirmed",
    body: "Your session with Ananya Sharma is confirmed for Apr 5 at 2:00 PM.",
    time: "2 min ago",
    actionLabel: "View Booking",
    actionRoute: "/(tabs)/bookings",
  },
  {
    id: "n2",
    type: "reminder",
    read: false,
    title: "Session in 1 Hour",
    body: "Your Physics session with Rahul Verma starts at 4:00 PM today. Get ready!",
    time: "45 min ago",
    actionLabel: "View Details",
    actionRoute: "/(tabs)/bookings",
  },
  {
    id: "n3",
    type: "payment",
    read: false,
    title: "Payment Received",
    body: "₹500 advance payment for your Mathematics session has been processed.",
    time: "2 hr ago",
  },
  {
    id: "n4",
    type: "booking",
    read: true,
    title: "Session Cancelled",
    body: "Your session with Arjun Mehta on Mar 22 has been cancelled. Refund initiated.",
    time: "Yesterday",
  },
  {
    id: "n5",
    type: "promo",
    read: true,
    title: "🎉 New Teachers Available",
    body: "5 new teachers in Mathematics and Science just joined. Book a free trial session!",
    time: "Yesterday",
    actionLabel: "Explore",
    actionRoute: "/(tabs)/home",
  },
  {
    id: "n6",
    type: "payment",
    read: true,
    title: "Refund Processed",
    body: "₹500 refund for the cancelled session has been credited to your account.",
    time: "2 days ago",
  },
  {
    id: "n7",
    type: "system",
    read: true,
    title: "Profile Updated",
    body: "Your profile information has been updated successfully.",
    time: "3 days ago",
  },
  {
    id: "n8",
    type: "reminder",
    read: true,
    title: "Complete Your Profile",
    body: "Add your subjects and budget to get better teacher matches.",
    time: "4 days ago",
    actionLabel: "Update Profile",
    actionRoute: "/(tabs)/profile",
  },
  {
    id: "n9",
    type: "promo",
    read: true,
    title: "Weekend Special",
    body: "Book 3 sessions this weekend and get ₹100 off. Offer valid till Sunday.",
    time: "5 days ago",
  },
];

// Group into Today / Yesterday / Earlier
function groupNotifications(notifs: Notification[]) {
  const today: Notification[] = notifs.filter(
    (n) => n.time.includes("min") || n.time.includes("hr"),
  );
  const yesterday: Notification[] = notifs.filter(
    (n) => n.time === "Yesterday",
  );
  const earlier: Notification[] = notifs.filter(
    (n) => n.time.includes("days") || n.time.includes("week"),
  );
  const sections = [];
  if (today.length) sections.push({ title: "Today", data: today });
  if (yesterday.length) sections.push({ title: "Yesterday", data: yesterday });
  if (earlier.length) sections.push({ title: "Earlier", data: earlier });
  return sections;
}

// ─── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  NotifType,
  { icon: any; color: string; bg: string; border: string }
> = {
  booking: {
    icon: "calendar",
    color: P.gold,
    bg: P.goldDim,
    border: P.goldBorder,
  },
  payment: {
    icon: "card",
    color: P.success,
    bg: P.successPale,
    border: P.successBorder,
  },
  reminder: {
    icon: "alarm",
    color: P.info,
    bg: P.infoPale,
    border: P.infoBorder,
  },
  promo: {
    icon: "gift",
    color: P.warning,
    bg: P.warningPale,
    border: P.warningBorder,
  },
  system: { icon: "settings", color: P.muted, bg: P.inputBg, border: P.border },
};

// ─── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "booking", label: "Bookings" },
  { key: "payment", label: "Payments" },
  { key: "reminder", label: "Reminders" },
  { key: "promo", label: "Promos" },
];

// ─── Notif Card ────────────────────────────────────────────────────────────────
function NotifCard({
  item,
  onMarkRead,
}: {
  item: Notification;
  onMarkRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[item.type];
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 60,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
    }).start();

  const handlePress = () => {
    if (!item.read) onMarkRead(item.id);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={[styles.card, !item.read && styles.cardUnread]}
      >
        {/* Unread left accent */}
        {!item.read && (
          <LinearGradient
            colors={[cfg.color, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cardLeftAccent}
          />
        )}

        {/* Icon */}
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: cfg.bg, borderColor: cfg.border },
          ]}
        >
          <Ionicons name={cfg.icon} size={17} color={cfg.color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text
              style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.body}
          </Text>

          {item.actionLabel && (
            <TouchableOpacity
              style={styles.cardAction}
              onPress={() =>
                item.actionRoute && router.push(item.actionRoute as any)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.cardActionText}>{item.actionLabel}</Text>
              <Ionicons name="arrow-forward" size={11} color={P.gold} />
            </TouchableOpacity>
          )}
        </View>

        {/* Unread dot */}
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: string }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="notifications-off-outline" size={28} color={P.gold} />
      </View>
      <Text style={styles.emptyTitle}>
        No {filter === "all" ? "" : filter} notifications
      </Text>
      <Text style={styles.emptyBody}>
        {filter === "all"
          ? "You're all caught up! New notifications will appear here."
          : `No ${filter} notifications yet.`}
      </Text>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<Notification[]>(RAW_NOTIFS);
  const [filter, setFilter] = useState("all");

  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(16)).current;

  const unreadCount = notifs.filter((n) => !n.read).length;
  const bookingUnread = notifs.filter(
    (n) => n.type === "booking" && !n.read,
  ).length;
  const paymentUnread = notifs.filter(
    (n) => n.type === "payment" && !n.read,
  ).length;

  const markRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered =
    filter === "all" ? notifs : notifs.filter((n) => n.type === filter);

  const sections = groupNotifications(filtered);

  useEffect(() => {
    if (unreadCount <= 0) return;

    summaryOpacity.setValue(0);
    summaryTranslateY.setValue(16);

    Animated.parallel([
      Animated.timing(summaryOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(summaryTranslateY, {
        toValue: 0,
        damping: 16,
        stiffness: 140,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [summaryOpacity, summaryTranslateY, unreadCount]);

  return (
    <SafeAreaView style={styles.root} edges={["left", "right"]}>
      {unreadCount > 0 && (
        <View style={styles.headerContainer}>
          <Animated.View
            style={{
              opacity: summaryOpacity,
              transform: [{ translateY: summaryTranslateY }],
            }}
          >
            <LinearGradient
              colors={["#FFFFFF", "#FFF7E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={styles.summaryRail} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryMetricCol}>
                  <Text style={styles.summaryMetricValue}>{unreadCount}</Text>
                  <Text style={styles.summaryMetricLabel}>Unread</Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>
                    Inbox needs a quick check
                  </Text>
                  <Text style={styles.summarySubtext}>
                    {bookingUnread} booking{bookingUnread > 1 ? "s" : ""} and{" "}
                    {paymentUnread} payment{paymentUnread > 1 ? "s" : ""}{" "}
                    pending.
                  </Text>

                  <TouchableOpacity
                    onPress={markAllRead}
                    activeOpacity={0.85}
                    style={styles.summaryActionBtn}
                  >
                    <Text style={styles.summaryActionText}>
                      Mark all as read
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={P.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Decorative Background Element */}
              <View style={styles.cardCircle} />
              <View style={styles.cardCircleTwo} />
              <View style={styles.cardCircleThree} />
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* ── Filter chips ── */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(f) => f.key}
              contentContainerStyle={styles.filterStrip}
              renderItem={({ item: f }) => {
                const active = filter === f.key;
                const count =
                  f.key === "all"
                    ? notifs.filter((n) => !n.read).length
                    : notifs.filter((n) => n.type === f.key && !n.read).length;
                return (
                  <TouchableOpacity
                    onPress={() => setFilter(f.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.filterChip,
                      active && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          active && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            active && styles.filterBadgeTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState filter={filter} />}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <NotifCard item={item} onMarkRead={markRead} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: P.cream,
  },
  headerHero: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.05)",
  },
  heroGlowTop: {
    position: "absolute",
    top: -42,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  heroGlowBottom: {
    position: "absolute",
    bottom: -56,
    left: -24,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(232,168,56,0.16)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    marginTop: 6,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  centerTitle: {
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: P.muted,
    letterSpacing: 2,
    marginBottom: -2,
  },
  mainTitle: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: P.ink,
  },
  profileBtn: {
    position: "relative",
  },
  avatarHalo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
  },
  avatarText: {
    color: P.gold,
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
  },
  activeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: P.gold,
    borderWidth: 2,
    borderColor: P.cream,
  },

  // Summary Card
  summaryCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  summaryRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: P.gold,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 3,
  },
  summaryMetricCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 82,
  },
  summaryMetricValue: {
    fontSize: 34,
    lineHeight: 36,
    color: P.navy,
    fontFamily: "Manrope_800ExtraBold",
  },
  summaryMetricLabel: {
    marginTop: 2,
    fontSize: 10,
    color: P.mutedDark,
    fontFamily: "Manrope_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(13,27,42,0.08)",
    marginHorizontal: 12,
  },
  summaryContent: {
    alignItems: "flex-start",
    zIndex: 3,
    flex: 1,
  },
  summaryTitle: {
    color: P.ink,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Manrope_800ExtraBold",
    maxWidth: "100%",
  },
  summarySubtext: {
    color: P.mutedDark,
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 8,
    maxWidth: "100%",
  },
  summaryPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(13,27,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.08)",
  },
  summaryPillText: {
    color: P.navy,
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
  },
  summaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: P.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.3)",
  },
  summaryActionText: {
    color: P.white,
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.2,
  },
  cardCircle: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(232, 168, 56, 0.08)",
    zIndex: 1,
  },
  cardCircleTwo: {
    position: "absolute",
    top: -24,
    right: 60,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 1,
  },
  cardCircleThree: {
    position: "absolute",
    bottom: -45,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(232,168,56,0.06)",
    zIndex: 1,
  },

  // Nav
  nav: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  firstNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // eyebrow: {
  //   fontSize: 10,
  //   fontFamily: "Manrope_600SemiBold",
  //   letterSpacing: 2,
  //   color: P.gold,
  //   textTransform: "uppercase",
  //   marginBottom: 2,
  // },
  navTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    letterSpacing: -0.4,
  },
  navUnreadCount: { color: P.gold },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    marginTop: 6,
  },
  markAllText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: P.gold,
  },

  // Summary banner
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
    overflow: "hidden",
  },
  summaryBannerOrb: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(232,168,56,0.06)",
    top: -50,
    right: -30,
  },
  summaryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    flex: 1,
  },

  // Filter strip
  filterStrip: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
  },
  filterChipActive: { backgroundColor: P.navy, borderColor: P.navy },
  filterChipText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
  },
  filterChipTextActive: { color: P.white },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeActive: { backgroundColor: P.gold, borderColor: P.gold },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
  },
  filterBadgeTextActive: { color: P.navy },

  // List
  listContent: { paddingBottom: 40 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: P.border },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Card wrap
  cardWrap: { paddingHorizontal: 20, marginBottom: 10 },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: P.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: P.border,
    padding: 14,
    overflow: "hidden",
    position: "relative",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: { backgroundColor: "#FDFCF8", borderColor: "#EDE9DF" },
  cardLeftAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 3,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.mutedDark,
    flex: 1,
    paddingRight: 8,
  },
  cardTitleUnread: { fontFamily: "Manrope_700Bold", color: P.ink },
  cardTime: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    flexShrink: 0,
    marginTop: 1,
  },
  cardBody: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    lineHeight: 18,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardActionText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
  },

  // Unread dot
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 4,
  },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 70,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: P.goldDim,
    borderWidth: 1.5,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
