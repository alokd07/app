import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "../src/utils/helpers";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const P = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldDim: "rgba(232,168,56,0.12)",
  goldBorder: "rgba(232,168,56,0.30)",
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
};

// ─── Detail Row ────────────────────────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={14} color={P.gold} />
      </View>
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function BookingConfirmationScreen() {
  const { bookingId, teacherName, date, time, amount } = useLocalSearchParams<{
    bookingId: string;
    teacherName: string;
    date: string;
    time: string;
    amount: string;
  }>();

  // Entrance animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const cardTransY = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Pop in the check circle
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // 2. Slide up the detail card
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(cardTransY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 3. Fade in buttons
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* ── Main scrollable area ── */}
      <View style={styles.body}>
        {/* ── Success icon ── */}
        <Animated.View
          style={[
            styles.successWrap,
            { opacity: checkOpacity, transform: [{ scale: checkScale }] },
          ]}
        >
          {/* Outer ring */}
          <View style={styles.successOuterRing}>
            <View style={styles.successInnerRing}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={38} color={P.white} />
              </View>
            </View>
          </View>
          {/* Gold glow dots */}
          <View style={[styles.glowDot, { top: 4, right: 12 }]} />
          <View
            style={[
              styles.glowDot,
              { bottom: 8, left: 8, width: 6, height: 6 },
            ]}
          />
          <View
            style={[
              styles.glowDot,
              { top: 16, left: 0, width: 4, height: 4, opacity: 0.5 },
            ]}
          />
        </Animated.View>

        <Text style={styles.headline}>Booking Confirmed!</Text>
        <Text style={styles.subline}>
          Your session has been booked successfully
        </Text>

        {/* ── Booking ID pill ── */}
        {bookingId && (
          <View style={styles.idPill}>
            <Text style={styles.idPillLabel}>Booking ID</Text>
            <Text style={styles.idPillValue}>
              #{bookingId.slice(-8).toUpperCase()}
            </Text>
          </View>
        )}

        {/* ── Detail card ── */}
        <Animated.View
          style={[
            styles.detailCard,
            { opacity: cardOpacity, transform: [{ translateY: cardTransY }] },
          ]}
        >
          {/* Gold accent line */}
          <LinearGradient
            colors={[P.gold, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccent}
          />

          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Ionicons name="receipt-outline" size={13} color={P.gold} />
            </View>
            <Text style={styles.cardTitle}>Session Details</Text>
          </View>

          <View style={styles.detailsWrap}>
            <DetailRow
              icon="person-outline"
              label="Teacher"
              value={teacherName || "—"}
            />
            <DetailRow
              icon="calendar-outline"
              label="Date"
              value={date || "—"}
            />
            <DetailRow icon="time-outline" label="Time" value={time || "—"} />
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountLeft}>
              <Ionicons name="card-outline" size={14} color={P.gold} />
              <Text style={styles.amountLabel}>Advance Paid</Text>
            </View>
            <Text style={styles.amountValue}>
              {formatCurrency(parseFloat(amount || "0"))}
            </Text>
          </View>
        </Animated.View>

        {/* ── Info note ── */}
        <Animated.View style={[styles.infoNote, { opacity: cardOpacity }]}>
          <View style={styles.infoIconBox}>
            <Ionicons
              name="notifications-outline"
              size={13}
              color={P.success}
            />
          </View>
          <Text style={styles.infoText}>
            You&apos;ll receive confirmation details on your registered number
            shortly.
          </Text>
        </Animated.View>
      </View>

      {/* ── Footer actions ── */}
      <Animated.View style={[styles.footer, { opacity: btnOpacity }]}>
        {/* Primary: View Bookings */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/bookings")}
          activeOpacity={0.88}
          style={styles.primaryBtn}
        >
          <LinearGradient
            colors={[P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtnInner}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
            <View style={styles.primaryBtnArrow}>
              <Ionicons name="arrow-forward" size={14} color={P.gold} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary: Home */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.8}
          style={styles.secondaryBtn}
        >
          <Ionicons
            name="home-outline"
            size={16}
            color={P.mutedDark}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  // Success icon
  successWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: P.successPale,
    borderWidth: 1.5,
    borderColor: P.successBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  successInnerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(39,174,96,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: P.success,
    alignItems: "center",
    justifyContent: "center",
  },
  glowDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: P.gold,
    opacity: 0.7,
  },

  headline: {
    fontSize: 26,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subline: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
  },

  // Booking ID pill
  idPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
  },
  idPillLabel: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: P.mutedDark,
  },
  idPillValue: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: 0.5,
  },

  // Detail card
  detailCard: {
    width: "100%",
    backgroundColor: P.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.border,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAccent: { height: 2 },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  cardIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.ink },
  detailsWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 14,
  },

  detailRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailTexts: { flex: 1 },
  detailLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
  },

  // Amount row
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 14,
    marginTop: 10,
    backgroundColor: P.navy,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
  },
  amountValue: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -0.5,
  },

  // Info note
  infoNote: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: P.successPale,
    borderWidth: 1,
    borderColor: P.successBorder,
    borderRadius: 14,
    padding: 14,
  },
  infoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(39,174,96,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: P.success,
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: P.border,
    backgroundColor: P.cream,
  },
  primaryBtn: { borderRadius: 16, overflow: "hidden" },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 12,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: 0.2,
  },
  primaryBtnArrow: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: P.mutedDark,
  },
});
