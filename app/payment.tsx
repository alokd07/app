import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../src/utils/helpers";
import { API_CONFIG, RAZORPAY_CONFIG } from "../src/config/api";
import apiClient from "../src/services/api";
import { appColors, fonts } from "../src/theme/colors";

const { width: SW } = Dimensions.get("window");
const P = appColors;

// ─── Payment method config ─────────────────────────────────────────────────────
const METHODS = [
  { id: "upi",  icon: "phone-portrait-outline", label: "UPI",         sub: "GPay · PhonePe · Paytm",  badge: "Instant" },
  { id: "card", icon: "card-outline",           label: "Card",        sub: "Credit / Debit card",      badge: null },
  { id: "net",  icon: "business-outline",       label: "Net Banking", sub: "All major banks",          badge: null },
];

// ─── Trust badges ──────────────────────────────────────────────────────────────
const TRUST = [
  { icon: "shield-checkmark",   label: "256-bit SSL",   color: "#22C55E" },
  { icon: "lock-closed",        label: "PCI DSS",       color: P.gold     },
  { icon: "checkmark-circle",   label: "RBI Approved",  color: "#3B82F6" },
];

// ─── Detail row atom ───────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <View style={s.detailIcon}>
        <Ionicons name={icon} size={14} color={P.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.detailLabel}>{label}</Text>
        <Text style={s.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const { bookingId, amount, teacherName, date, time } = useLocalSearchParams<{
    bookingId: string; amount: string; teacherName: string; date: string; time: string;
  }>();

  const [processing, setProcessing]     = useState(false);
  const [selectedMethod, setMethod]     = useState("upi");
  const insets = useSafeAreaInsets();

  // Entrance animations
  const fade    = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(30)).current;
  const heroScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
    ]).start();

    // Subtle pulse on the amount
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const amountNum = parseFloat(amount || "0");

  const completeAndNavigate = () => {
    router.replace({
      pathname: "/booking-confirmation",
      params: { bookingId, teacherName, date, time, amount },
    });
  };

  const runDemoPayment = () => {
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        "🎉 Payment Successful!",
        `₹${amountNum} paid for your session with ${teacherName}.`,
        [{ text: "View Booking", onPress: completeAndNavigate }],
        { cancelable: false }
      );
    }, 1800);
  };

  const handlePayment = async () => {
    setProcessing(true);

    if (!RAZORPAY_CONFIG.ENABLED) {
      runDemoPayment();
      return;
    }

    if (Platform.OS === "web") {
      setProcessing(false);
      Alert.alert("Unsupported Platform", "Razorpay is available only on Android/iOS builds.");
      return;
    }

    try {
      const orderRes = await apiClient.post(API_CONFIG.ENDPOINTS.RAZORPAY_CREATE_ORDER, {
        bookingId, amount: amountNum, currency: "INR",
      });
      const orderData = orderRes?.data?.data || orderRes?.data || {};
      const orderId = orderData.orderId || orderData.order_id;
      if (!orderId) throw new Error("Unable to create Razorpay order");

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RazorpayCheckout = require("react-native-razorpay").default;
      const result = await RazorpayCheckout.open({
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: Math.round(amountNum * 100),
        currency: orderData.currency || "INR",
        name: "BookMySession",
        description: `Session with ${teacherName || "teacher"}`,
        order_id: orderId,
        prefill: { name: "Student" },
        theme: { color: P.navy },
      });

      await apiClient.post(API_CONFIG.ENDPOINTS.RAZORPAY_VERIFY_PAYMENT, {
        bookingId,
        razorpay_order_id: result?.razorpay_order_id,
        razorpay_payment_id: result?.razorpay_payment_id,
        razorpay_signature: result?.razorpay_signature,
      });

      setProcessing(false);
      Alert.alert("Payment Successful!", "Your booking has been confirmed.", [
        { text: "View Booking", onPress: completeAndNavigate },
      ]);
    } catch (err: any) {
      setProcessing(false);
      const msg = err?.description || err?.error?.description ||
        err?.response?.data?.message || err?.message || "Payment failed. Please try again.";
      if ((typeof msg === "string" && msg.toLowerCase().includes("cancel")) || err?.code === 2) {
        Alert.alert("Payment Cancelled", "You cancelled the payment flow.");
        return;
      }
      Alert.alert("Payment Failed", msg);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>

          {/* ── Hero amount card ── */}
          <Animated.View style={[s.heroWrap, { transform: [{ scale: heroScale }] }]}>
            <LinearGradient
              colors={[P.navy, "#112030", P.navyMid]}
              style={s.heroBanner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              {/* Decorative orbs */}
              <View style={[s.orb, { width: 180, height: 180, top: -70, right: -50, opacity: 0.07 }]} />
              <View style={[s.orb, { width: 100, height: 100, bottom: -30, left: -20, opacity: 0.05 }]} />

              {/* Lock ring */}
              <View style={s.lockRingOuter}>
                <LinearGradient
                  colors={[P.gold, P.goldLight, P.gold]}
                  style={s.lockRingGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <View style={s.lockRingInner}>
                    <Ionicons name="shield-checkmark" size={28} color={P.gold} />
                  </View>
                </LinearGradient>
              </View>

              <Text style={s.heroEyebrow}>Amount Due</Text>
              <Animated.Text style={[s.heroAmount, { transform: [{ scale: pulseAnim }] }]}>
                {formatCurrency(amountNum)}
              </Animated.Text>
              <Text style={s.heroSub}>Advance · Remaining after session</Text>

              {/* Trust strip */}
              <View style={s.trustStrip}>
                {TRUST.map((t) => (
                  <View key={t.label} style={s.trustItem}>
                    <Ionicons name={t.icon as any} size={11} color={t.color} />
                    <Text style={s.trustText}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ── Booking summary ── */}
          <View style={s.card}>
            <LinearGradient
              colors={[P.gold, "transparent"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.cardTopBar}
            />
            <View style={s.cardHead}>
              <View style={s.cardIconBox}>
                <Ionicons name="receipt-outline" size={14} color={P.gold} />
              </View>
              <Text style={s.cardTitle}>Booking Summary</Text>
            </View>
            <View style={s.cardBody}>
              <DetailRow icon="person-outline"   label="Teacher" value={teacherName || "—"} />
              <View style={s.rowDivider} />
              <DetailRow icon="calendar-outline" label="Date"    value={date || "—"} />
              <View style={s.rowDivider} />
              <DetailRow icon="time-outline"     label="Time"    value={time || "—"} />
            </View>
            <View style={s.totalRow}>
              <View>
                <Text style={s.totalLabel}>Advance Due Now</Text>
                <Text style={s.totalSub}>Remaining after session</Text>
              </View>
              <Text style={s.totalAmount}>{formatCurrency(amountNum)}</Text>
            </View>
            <View style={s.infoNote}>
              <Ionicons name="information-circle-outline" size={14} color="#3B82F6" />
              <Text style={s.infoNoteText}>
                Only the advance is charged now. Balance is settled directly with the teacher.
              </Text>
            </View>
          </View>

          {/* ── Demo mode banner ── */}
          {!RAZORPAY_CONFIG.ENABLED && (
            <View style={s.demoBanner}>
              <View style={s.demoBannerLeft}>
                <View style={s.demoIconBox}>
                  <Ionicons name="construct-outline" size={14} color="#F59E0B" />
                </View>
                <Text style={s.demoBannerTitle}>Demo Mode</Text>
              </View>
              <Text style={s.demoBannerText}>
                Payment is simulated — no real money is charged. Tap Pay Now to proceed.
              </Text>
            </View>
          )}

          {/* ── Payment method picker ── */}
          <View style={s.card}>
            <View style={s.cardHead}>
              <View style={s.cardIconBox}>
                <Ionicons name="card-outline" size={14} color={P.gold} />
              </View>
              <Text style={s.cardTitle}>Payment Method</Text>
            </View>
            <View style={s.methodsList}>
              {METHODS.map((m) => {
                const active = selectedMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.methodRow, active && s.methodRowActive]}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.8}
                  >
                    {/* Radio */}
                    <View style={[s.radio, active && s.radioActive]}>
                      {active && <View style={s.radioDot} />}
                    </View>

                    {/* Icon */}
                    <LinearGradient
                      colors={active ? [P.gold, "#D4922A"] : ["#F8FAFC", "#F1F5F9"]}
                      style={s.methodIconBox}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={m.icon as any} size={16} color={active ? P.navy : P.muted} />
                    </LinearGradient>

                    {/* Labels */}
                    <View style={{ flex: 1 }}>
                      <Text style={[s.methodLabel, active && s.methodLabelActive]}>{m.label}</Text>
                      <Text style={s.methodSub}>{m.sub}</Text>
                    </View>

                    {/* Badge */}
                    {m.badge && (
                      <View style={s.methodBadge}>
                        <Text style={s.methodBadgeText}>{m.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Powered by ── */}
          <View style={s.poweredBy}>
            <Ionicons name="shield-checkmark-outline" size={13} color={P.muted} />
            <Text style={s.poweredByText}>Payments secured by Razorpay</Text>
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── Sticky pay CTA ── */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Summary line */}
        <View style={s.footerSummary}>
          <Text style={s.footerSummaryLabel}>
            Paying via {METHODS.find((m) => m.id === selectedMethod)?.label}
          </Text>
          <Text style={s.footerSummaryAmount}>{formatCurrency(amountNum)}</Text>
        </View>

        <TouchableOpacity
          onPress={handlePayment}
          disabled={processing}
          activeOpacity={0.88}
          style={[s.payBtn, processing && { opacity: 0.7 }]}
        >
          <LinearGradient
            colors={[P.gold, "#D4922A"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.payBtnInner}
          >
            {processing ? (
              <View style={s.payBtnRow}>
                <ActivityIndicator color={P.navy} size="small" />
                <Text style={s.payBtnText}>Processing…</Text>
              </View>
            ) : (
              <View style={s.payBtnRow}>
                <Text style={s.payBtnText}>Pay {formatCurrency(amountNum)} Securely</Text>
                <View style={s.payArrow}>
                  <Ionicons name="arrow-forward" size={15} color={P.navy} />
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  // Nav
  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 10,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  navCenter: { flexDirection: "row", alignItems: "center", gap: 5 },
  navTitle: { fontSize: 15, fontFamily: fonts.bold, color: P.ink, letterSpacing: -0.2 },

  scroll: { paddingTop: 4 },

  // Hero
  heroWrap: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 24, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: P.navy, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 8 },
    }),
  },
  heroBanner: {
    alignItems: "center",
    paddingTop: 32, paddingBottom: 28,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  orb: { position: "absolute", borderRadius: 999, backgroundColor: P.gold },

  lockRingOuter: { marginBottom: 20 },
  lockRingGrad: {
    width: 80, height: 80, borderRadius: 22,
    padding: 3, alignItems: "center", justifyContent: "center",
  },
  lockRingInner: {
    width: 74, height: 74, borderRadius: 20,
    backgroundColor: "#0D1B2A",
    alignItems: "center", justifyContent: "center",
  },

  heroEyebrow: {
    fontSize: 11, fontFamily: fonts.semiBold,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase", letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 42, fontFamily: fonts.extraBold,
    color: P.gold, letterSpacing: -1.5, marginBottom: 4,
  },
  heroSub: {
    fontSize: 12, fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.38)",
    marginBottom: 22,
  },

  trustStrip: {
    flexDirection: "row", gap: 0,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  trustItem: {
    flex: 1, flexDirection: "column", alignItems: "center",
    gap: 4, paddingVertical: 10, paddingHorizontal: 8,
    borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.07)",
  },
  trustText: { fontSize: 9, fontFamily: fonts.bold, color: "rgba(255,255,255,0.5)", textAlign: "center" },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 20, borderWidth: 1, borderColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#0D1B2A", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  cardTopBar: { height: 3 },
  cardHead: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC",
  },
  cardIconBox: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontFamily: fonts.bold, color: P.ink },
  cardBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },

  // Detail rows
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  detailIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(232,168,56,0.08)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.18)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  detailLabel: { fontSize: 10, fontFamily: fonts.medium, color: P.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  detailValue: { fontSize: 13, fontFamily: fonts.semiBold, color: P.ink },
  rowDivider: { height: 1, backgroundColor: "#F8FAFC" },

  // Total row
  totalRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontFamily: fonts.bold, color: P.ink, marginBottom: 2 },
  totalSub: { fontSize: 11, fontFamily: fonts.regular, color: P.muted },
  totalAmount: { fontSize: 24, fontFamily: fonts.extraBold, color: P.gold, letterSpacing: -0.5 },

  // Info note
  infoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "rgba(59,130,246,0.06)",
    borderWidth: 1, borderColor: "rgba(59,130,246,0.18)",
    borderRadius: 12, padding: 12,
  },
  infoNoteText: { flex: 1, fontSize: 12, fontFamily: fonts.regular, color: "#1D4ED8", lineHeight: 18 },

  // Demo banner
  demoBanner: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.25)",
    borderRadius: 16, padding: 14,
  },
  demoBannerLeft: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  demoIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  demoBannerTitle: { fontSize: 13, fontFamily: fonts.bold, color: "#D97706" },
  demoBannerText: { fontSize: 12, fontFamily: fonts.regular, color: "#92400E", lineHeight: 18 },

  // Methods
  methodsList: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  methodRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  methodRowActive: {
    borderColor: P.gold,
    backgroundColor: "rgba(232,168,56,0.05)",
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center",
  },
  radioActive: { borderColor: P.gold, borderWidth: 2 },
  radioDot: {
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: P.gold,
  },
  methodIconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  methodLabel: { fontSize: 14, fontFamily: fonts.semiBold, color: P.mutedDark, marginBottom: 1 },
  methodLabelActive: { color: P.ink, fontFamily: fonts.bold },
  methodSub: { fontSize: 11, fontFamily: fonts.regular, color: P.muted },
  methodBadge: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1, borderColor: "rgba(34,197,94,0.25)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  methodBadgeText: { fontSize: 10, fontFamily: fonts.bold, color: "#16A34A" },

  // Powered by
  poweredBy: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    marginBottom: 8, paddingVertical: 4,
  },
  poweredByText: { fontSize: 11, fontFamily: fonts.medium, color: P.muted },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
    paddingHorizontal: 16, paddingTop: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 10 },
    }),
  },
  footerSummary: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  footerSummaryLabel: { fontSize: 12, fontFamily: fonts.medium, color: P.muted },
  footerSummaryAmount: { fontSize: 16, fontFamily: fonts.extraBold, color: P.ink },

  payBtn: { borderRadius: 16, overflow: "hidden" },
  payBtnInner: { paddingVertical: 16, paddingHorizontal: 20 },
  payBtnRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  payLock: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: "rgba(13,27,42,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  payBtnText: { fontSize: 16, fontFamily: fonts.extraBold, color: P.navy, letterSpacing: -0.2 },
  payArrow: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: "rgba(13,27,42,0.12)",
    alignItems: "center", justifyContent: "center",
  },
});
