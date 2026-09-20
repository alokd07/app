import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  NativeModules,
  DeviceEventEmitter,
  NativeEventEmitter,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Safely require native Razorpay so Expo Go does not crash on startup
let RazorpayCheckout: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("react-native-razorpay");
  RazorpayCheckout = mod?.default || mod;
} catch {
  // Native module not linked in Expo Go client
}
import { formatCurrency } from "../src/utils/helpers";
import { API_CONFIG, RAZORPAY_CONFIG } from "../src/config/api";
import apiClient from "../src/services/api";
import { useAuthStore } from "../src/store/authStore";
import { fonts } from "../src/theme/colors";

const PAYMENT_FEATURES = [
  {
    icon: "flash-outline",
    title: "Instant UPI Apps",
    desc: "Google Pay, PhonePe, Paytm, BHIM & all UPI apps",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },
  {
    icon: "card-outline",
    title: "Cards & NetBanking",
    desc: "Visa, MasterCard, RuPay & 50+ Top Indian Banks",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
  {
    icon: "wallet-outline",
    title: "Wallets & PayLater",
    desc: "Amazon Pay, MobiKwik, Airtel Money & more",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
];

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const {
    bookingId,
    demoId,
    amount,
    teacherName,
    date,
    time,
    isDemoPayment,
    packageId,
    sessionsCount,
  } = useLocalSearchParams<{
    bookingId: string;
    demoId: string;
    amount: string;
    teacherName: string;
    date: string;
    time: string;
    isDemoPayment: string;
    packageId: string;
    sessionsCount: string;
  }>();

  const [processing, setProcessing] = useState(false);
  const amountNum = parseFloat(amount || "500");
  const targetBookingId = bookingId || demoId || `order_${Date.now()}`;

  const handleSuccess = async (paymentId?: string) => {
    if (isDemoPayment === "true" && demoId) {
      try {
        await apiClient.put(API_CONFIG.ENDPOINTS.DEMO_CONFIRM_PAYMENT(demoId), {
          paymentId: paymentId || `pay_${Date.now()}`,
        });
      } catch (_) {}
      Alert.alert("🎉 Payment Successful!", "Your demo session has been confirmed.", [
        {
          text: "View Demo Status",
          onPress: () => router.replace({ pathname: "/demo/[id]", params: { id: demoId } }),
        },
      ]);
    } else {
      Alert.alert(
        "🎉 Payment Successful!",
        `₹${amountNum} paid successfully for your session with ${teacherName || "Teacher"}.`,
        [
          {
            text: "View Booking",
            onPress: () =>
              router.replace({
                pathname: "/booking-confirmation",
                params: {
                  bookingId: targetBookingId,
                  teacherName: teacherName || "Teacher",
                  date: date || "Scheduled",
                  time: time || "Scheduled",
                  amount: String(amountNum),
                },
              }),
          },
        ]
      );
    }
  };

  const openNativeRazorpay = async (options: any): Promise<any> => {
    // 1. Direct Native Module Check
    const { RNRazorpayCheckout, RazorpayEventEmitter } = NativeModules;

    if (RNRazorpayCheckout && typeof RNRazorpayCheckout.open === "function") {
      return new Promise((resolve, reject) => {
        const eventEmitter =
          Platform.OS === "android"
            ? DeviceEventEmitter
            : new NativeEventEmitter(RazorpayEventEmitter || RNRazorpayCheckout);

        const successSub = eventEmitter.addListener("Razorpay::PAYMENT_SUCCESS", (data: any) => {
          successSub?.remove?.();
          errorSub?.remove?.();
          resolve(data);
        });

        const errorSub = eventEmitter.addListener("Razorpay::PAYMENT_ERROR", (data: any) => {
          successSub?.remove?.();
          errorSub?.remove?.();
          reject(data);
        });

        try {
          RNRazorpayCheckout.open(options);
        } catch (e) {
          successSub?.remove?.();
          errorSub?.remove?.();
          reject(e);
        }
      });
    }

    // 2. Standard RazorpayCheckout npm package call
    if (RazorpayCheckout && typeof RazorpayCheckout.open === "function") {
      return await RazorpayCheckout.open(options);
    }

    // 3. Dynamic require fallback for varied bundle imports
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RazorpayModule = require("react-native-razorpay");
      const RazorpayInstance = RazorpayModule.default || RazorpayModule;
      if (RazorpayInstance && typeof RazorpayInstance.open === "function") {
        return await RazorpayInstance.open(options);
      }
    } catch {
      // Not available in Expo Go
    }

    throw new Error(
      "Razorpay Native SDK is not supported in Expo Go. Run your app via native build (`npx expo run:android`) or use a development build."
    );
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);

    try {
      // 1. Create Order on Backend
      const orderRes = await apiClient.post(API_CONFIG.ENDPOINTS.RAZORPAY_CREATE_ORDER, {
        bookingId: targetBookingId,
        amount: amountNum,
        currency: "INR",
      });

      const orderData = orderRes?.data?.data || orderRes?.data || {};
      const orderId = orderData.orderId || orderData.order_id;
      const orderKey = orderData.keyId || RAZORPAY_CONFIG.KEY_ID;

      if (!orderId) {
        throw new Error(orderRes?.data?.message || "Unable to create payment order.");
      }

      // 2. Prepare user prefill details
      const userName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
      const userEmail = user?.email || "student@bookmysession.com";
      const userPhone = user?.phone || "";
      const description =
        isDemoPayment === "true"
          ? `Demo Booking with ${teacherName || "Teacher"}`
          : sessionsCount
          ? `${sessionsCount} Sessions Package with ${teacherName || "Teacher"}`
          : `Session with ${teacherName || "Teacher"}`;

      // 3. Options for Native Razorpay Checkout
      const options = {
        key: orderKey,
        amount: Math.round(amountNum * 100),
        currency: "INR",
        name: "BookMySession",
        description,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        // theme: {
        //   color: "#6366F1",
        // },
      };

      // 4. Launch 100% Native Mobile SDK Activity
      const result = await openNativeRazorpay(options);

      // 5. Verify Signature on Backend
      await apiClient.post(API_CONFIG.ENDPOINTS.RAZORPAY_VERIFY_PAYMENT, {
        bookingId: targetBookingId,
        razorpay_order_id: result.razorpay_order_id || orderId,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      setProcessing(false);
      handleSuccess(result.razorpay_payment_id);
    } catch (err: any) {
      setProcessing(false);
      const isCancelled =
        err?.code === 0 ||
        err?.code === 2 ||
        err?.description?.toLowerCase?.().includes("cancelled") ||
        err?.message?.toLowerCase?.().includes("cancel");

      if (isCancelled) {
        Alert.alert("Payment Cancelled", "The payment was cancelled.");
      } else {
        const errorMsg =
          err?.description ||
          err?.response?.data?.message ||
          err?.message ||
          "Payment could not be completed. Please try again.";
        Alert.alert("Payment Info", errorMsg);
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["#020817", "#1A3050"]}
            style={styles.heroGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroLabel}>Total Amount Payable</Text>
            <Text style={styles.heroAmount}>{formatCurrency(amountNum)}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.heroBadgeText}>100% Native Mobile SDK · Razorpay</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={18} color="#6366F1" />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teacher</Text>
            <Text style={styles.infoVal}>{teacherName || "Teacher"}</Text>
          </View>

          {date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoVal}>{date}</Text>
            </View>
          )}

          {time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoVal}>{time}</Text>
            </View>
          )}

          {sessionsCount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sessions</Text>
              <Text style={styles.infoVal}>{sessionsCount} Sessions Package</Text>
            </View>
          )}

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Payment Type</Text>
            <Text style={styles.infoVal}>
              {isDemoPayment === "true"
                ? "Demo Session Fee"
                : sessionsCount
                ? "Package Full Payment"
                : "Session Booking Advance"}
            </Text>
          </View>
        </View>

        {/* Payment Gateway Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={18} color="#6366F1" />
            <Text style={styles.cardTitle}>Native Payment Methods</Text>
          </View>

          <View style={styles.featureList}>
            {PAYMENT_FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.securityFooter}>
            <Ionicons name="lock-closed" size={14} color="#6B7280" />
            <Text style={styles.securityText}>
              Bank-grade 256-bit encryption powered by Razorpay Native Gateway.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, processing && { opacity: 0.7 }]}
          onPress={handleRazorpayPayment}
          disabled={processing}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#6366F1", "#4F46E5"]}
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {processing ? (
              <View style={styles.btnRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.ctaText}>Opening Razorpay Native...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.ctaText}>Pay {formatCurrency(amountNum)} with Razorpay</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  heroCard: { marginBottom: 16, borderRadius: 18, overflow: "hidden" },
  heroGrad: { padding: 24, alignItems: "center" },
  heroLabel: { fontSize: 13, fontFamily: fonts.medium, color: "#94A3B8" },
  heroAmount: { fontSize: 36, fontFamily: fonts.bold, color: "#E8A838", marginVertical: 6 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: { fontSize: 12, fontFamily: fonts.medium, color: "#10B981" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0F172A" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B" },
  infoVal: { fontSize: 13, fontFamily: fonts.semiBold, color: "#0F172A" },
  featureList: { gap: 12 },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#1E293B" },
  featureDesc: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  securityText: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B", flex: 1 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
});
