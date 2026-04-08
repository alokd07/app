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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "../src/utils/helpers";
import { API_CONFIG, RAZORPAY_CONFIG } from "../src/config/api";
import apiClient from "../src/services/api";
import { appColors } from "../src/theme/colors";

const P = appColors;

// ─── Atoms ─────────────────────────────────────────────────────────────────────
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
      <View style={styles.detailIconBox}>
        <Ionicons name={icon} size={13} color={P.gold} />
      </View>
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const { bookingId, amount, teacherName, date, time } = useLocalSearchParams<{
    bookingId: string;
    amount: string;
    teacherName: string;
    date: string;
    time: string;
  }>();

  const [processing, setProcessing] = useState(false);

  type RazorpayOrderResponse = {
    orderId?: string;
    order_id?: string;
    amount?: number;
    currency?: string;
  };

  // Entrance anims
  const fadeY = useRef(new Animated.Value(20)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const heroS = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(fadeY, {
        toValue: 0,
        tension: 55,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(heroS, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, fadeY, heroS]);

  const completePaymentAndNavigate = () => {
    router.replace({
      pathname: "/booking-confirmation",
      params: { bookingId, teacherName, date, time, amount },
    });
  };

  const runDemoPayment = () => {
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        "Payment Successful!",
        "Your booking has been confirmed",
        [
          {
            text: "View Booking",
            onPress: completePaymentAndNavigate,
          },
        ],
        { cancelable: false },
      );
    }, 2000);
  };

  const handlePayment = async () => {
    setProcessing(true);

    if (!RAZORPAY_CONFIG.ENABLED) {
      runDemoPayment();
      return;
    }

    if (Platform.OS === "web") {
      setProcessing(false);
      Alert.alert(
        "Unsupported Platform",
        "Razorpay native checkout is available only on Android/iOS builds.",
      );
      return;
    }

    try {
      const orderRes = await apiClient.post(
        API_CONFIG.ENDPOINTS.RAZORPAY_CREATE_ORDER,
        {
          bookingId,
          amount: amountNum,
          currency: "INR",
        },
      );

      const orderData: RazorpayOrderResponse =
        orderRes?.data?.data || orderRes?.data || {};
      const orderId = orderData.orderId || orderData.order_id;

      if (!orderId) {
        throw new Error("Unable to create Razorpay order");
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RazorpayCheckout = require("react-native-razorpay").default;

      const paymentResult = await RazorpayCheckout.open({
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: Math.round(amountNum * 100),
        currency: orderData.currency || "INR",
        name: "BookMySession",
        description: `Session booking with ${teacherName || "teacher"}`,
        order_id: orderId,
        prefill: {
          name: "Student",
        },
        theme: {
          color: P.navy,
        },
      });

      await apiClient.post(API_CONFIG.ENDPOINTS.RAZORPAY_VERIFY_PAYMENT, {
        bookingId,
        razorpay_order_id: paymentResult?.razorpay_order_id,
        razorpay_payment_id: paymentResult?.razorpay_payment_id,
        razorpay_signature: paymentResult?.razorpay_signature,
      });

      setProcessing(false);
      Alert.alert("Payment Successful!", "Your booking has been confirmed", [
        {
          text: "View Booking",
          onPress: completePaymentAndNavigate,
        },
      ]);
    } catch (err: any) {
      setProcessing(false);

      const errorText =
        err?.description ||
        err?.error?.description ||
        err?.response?.data?.message ||
        err?.message ||
        "Payment failed. Please try again.";

      if (
        (typeof errorText === "string" &&
          errorText.toLowerCase().includes("cancel")) ||
        err?.code === 2
      ) {
        Alert.alert("Payment Cancelled", "You cancelled the payment flow.");
        return;
      }

      Alert.alert("Payment Failed", errorText);
    }
  };

  const amountNum = parseFloat(amount || "0");

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* ── Nav ── */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={18} color={P.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Secure Payment</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fade, transform: [{ translateY: fadeY }] }}
        >
          {/* ── Hero wallet badge ── */}
          <Animated.View
            style={[styles.heroWrap, { transform: [{ scale: heroS }] }]}
          >
            <LinearGradient
              colors={[P.navy, P.navyMid]}
              style={styles.heroBanner}
            >
              <View style={styles.heroOrb} />

              {/* Wallet icon ring */}
              <View style={styles.walletRingOuter}>
                <LinearGradient
                  colors={[P.gold, P.goldLight, P.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.walletRingGrad}
                >
                  <View style={styles.walletRingInner}>
                    <Ionicons name="wallet" size={30} color={P.gold} />
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.heroAmount}>{formatCurrency(amountNum)}</Text>
              <Text style={styles.heroLabel}>Advance Payment</Text>

              {/* SSL badge */}
              <View style={styles.sslBadge}>
                <Ionicons name="shield-checkmark" size={12} color={P.success} />
                <Text style={styles.sslText}>256-bit SSL Encrypted</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ── Booking Summary card ── */}
          <View style={styles.card}>
            <LinearGradient
              colors={[P.gold, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardAccent}
            />
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Ionicons name="receipt-outline" size={13} color={P.gold} />
              </View>
              <Text style={styles.cardTitle}>Booking Summary</Text>
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

            <View style={styles.divider} />

            {/* Amount row */}
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountRowLabel}>Advance Due Now</Text>
                <Text style={styles.amountRowSub}>
                  Remaining payable after session
                </Text>
              </View>
              <Text style={styles.amountRowValue}>
                {formatCurrency(amountNum)}
              </Text>
            </View>

            {/* Info note */}
            <View style={styles.infoNote}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={P.info}
              />
              <Text style={styles.infoNoteText}>
                You only pay an advance now. The remaining balance is settled
                directly with the teacher after your session.
              </Text>
            </View>
          </View>

          {/* ── Test mode banner ── */}
          {!RAZORPAY_CONFIG.ENABLED && (
            <View style={styles.testCard}>
              <View style={styles.testCardHeader}>
                <View style={styles.testIconBox}>
                  <Ionicons
                    name="construct-outline"
                    size={13}
                    color={P.warning}
                  />
                </View>
                <Text style={styles.testCardTitle}>Demo Mode</Text>
              </View>
              <Text style={styles.testCardText}>
                Payment is simulated. Tap Pay Now to complete a mock transaction
                and proceed to confirmation.
              </Text>
            </View>
          )}

          {/* ── Payment methods ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Ionicons name="card-outline" size={13} color={P.gold} />
              </View>
              <Text style={styles.cardTitle}>Pay Via</Text>
            </View>
            <View style={styles.methodsWrap}>
              {[
                {
                  icon: "phone-portrait-outline",
                  label: "UPI",
                  sub: "GPay, PhonePe, Paytm",
                },
                { icon: "card-outline", label: "Card", sub: "Credit / Debit" },
                {
                  icon: "business-outline",
                  label: "Net Banking",
                  sub: "All major banks",
                },
              ].map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.methodChip,
                    i === 0 && styles.methodChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.methodChipIcon,
                      i === 0 && styles.methodChipIconActive,
                    ]}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={14}
                      color={i === 0 ? P.navy : P.muted}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.methodLabel,
                        i === 0 && styles.methodLabelActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                    <Text style={styles.methodSub}>{m.sub}</Text>
                  </View>
                  {i === 0 && (
                    <View style={styles.methodCheck}>
                      <Ionicons name="checkmark" size={10} color={P.navy} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer Pay CTA ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePayment}
          disabled={processing}
          activeOpacity={0.88}
          style={[styles.payBtn, processing && { opacity: 0.65 }]}
        >
          <LinearGradient
            colors={[P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payBtnInner}
          >
            {processing ? (
              <>
                <ActivityIndicator color={P.navy} size="small" />
                <Text style={styles.payBtnText}>Processing...</Text>
              </>
            ) : (
              <>
                <View style={styles.payLockBox}>
                  <Ionicons name="lock-closed" size={13} color={P.gold} />
                </View>
                <Text style={styles.payBtnText}>
                  Pay {formatCurrency(amountNum)}
                </Text>
                <View style={styles.payArrow}>
                  <Ionicons name="arrow-forward" size={14} color={P.gold} />
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },
  scroll: { paddingBottom: 32 },

  // Nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
  navTitle: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    letterSpacing: -0.2,
  },

  // Hero
  heroWrap: { marginHorizontal: 20, marginBottom: 16 },
  heroBanner: {
    borderRadius: 22,
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 24,
    overflow: "hidden",
  },
  heroOrb: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(232,168,56,0.06)",
    top: -60,
    right: -50,
  },
  walletRingOuter: { marginBottom: 16 },
  walletRingGrad: {
    width: 84,
    height: 84,
    borderRadius: 24,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  walletRingInner: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: P.navyMid,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAmount: {
    fontSize: 36,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    marginBottom: 16,
  },
  sslBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: P.successPale,
    borderWidth: 1,
    borderColor: P.successBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sslText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: P.success,
  },

  // Card
  card: {
    backgroundColor: P.white,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.border,
    overflow: "hidden",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardAccent: { height: 2 },
  cardHeader: {
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

  // Details
  detailsWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 14,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailIconBox: {
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

  divider: {
    height: 1,
    backgroundColor: P.border,
    marginHorizontal: 18,
    marginVertical: 4,
  },

  // Amount row
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  amountRowLabel: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: P.ink,
    marginBottom: 2,
  },
  amountRowSub: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
  },
  amountRowValue: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -0.5,
  },

  // Info note
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: P.infoPale,
    borderWidth: 1,
    borderColor: P.infoBorder,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: P.info,
    lineHeight: 18,
  },

  // Test mode
  testCard: {
    backgroundColor: P.warningPale,
    borderWidth: 1,
    borderColor: P.warningBorder,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
  },
  testCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  testIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1,
    borderColor: P.warningBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  testCardTitle: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: P.warning,
  },
  testCardText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: P.mutedDark,
    lineHeight: 18,
  },

  // Payment methods
  methodsWrap: { padding: 16, paddingTop: 14, gap: 10 },
  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.inputBg,
    position: "relative",
  },
  methodChipActive: { backgroundColor: P.goldDim, borderColor: P.goldBorder },
  methodChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
  },
  methodChipIconActive: { backgroundColor: P.gold, borderColor: P.gold },
  methodLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
  },
  methodLabelActive: { color: P.navy },
  methodSub: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    marginTop: 1,
  },
  methodCheck: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: P.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: P.cream,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  payBtn: { borderRadius: 16, overflow: "hidden" },
  payBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  payLockBox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: 0.2,
  },
  payArrow: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
