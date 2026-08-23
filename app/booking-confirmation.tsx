import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../src/utils/helpers";
import { appColors, fonts } from "../src/theme/colors";

const P = appColors;

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { bookingId, teacherName, date, time, amount } = useLocalSearchParams<{
    bookingId: string;
    teacherName: string;
    date: string;
    time: string;
    amount: string;
  }>();

  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const amountNum = parseFloat(amount || "0");

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animated Check Icon */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark-sharp" size={48} color="#fff" />
        </Animated.View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your session with {teacherName || "your teacher"} has been booked successfully.
        </Text>

        {/* Booking ID */}
        {bookingId && (
          <View style={styles.idPill}>
            <Text style={styles.idPillLabel}>Booking ID:</Text>
            <Text style={styles.idPillVal}>#{bookingId.slice(-8).toUpperCase()}</Text>
          </View>
        )}

        {/* Session Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Summary</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="person-outline" size={16} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Teacher</Text>
              <Text style={styles.infoVal}>{teacherName || "Teacher"}</Text>
            </View>
          </View>

          {date && (
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={16} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoVal}>{date}</Text>
              </View>
            </View>
          )}

          {time && (
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="time-outline" size={16} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoVal}>{time}</Text>
              </View>
            </View>
          )}

          {amountNum > 0 && (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconBox}>
                <Ionicons name="cash-outline" size={16} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Amount Paid</Text>
                <Text style={[styles.infoVal, { color: "#10B981", fontFamily: fonts.bold }]}>
                  {formatCurrency(amountNum)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Confirmation note */}
        <View style={styles.noteBox}>
          <Ionicons name="mail-unread-outline" size={18} color="#6366F1" />
          <Text style={styles.noteText}>
            Session details and calendar invite have been sent to your registered account.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/(tabs)/bookings")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  scrollContent: { alignItems: "center", padding: 20, paddingTop: 40 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 24, fontFamily: fonts.bold, color: "#111827", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  idPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  idPillLabel: { fontSize: 12, fontFamily: fonts.medium, color: "#6366F1" },
  idPillVal: { fontSize: 12, fontFamily: fonts.bold, color: "#4F46E5" },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#111827", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 11, fontFamily: fonts.medium, color: "#6B7280" },
  infoVal: { fontSize: 13, fontFamily: fonts.semiBold, color: "#111827", marginTop: 1 },
  noteBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF2FF",
    padding: 14,
    borderRadius: 12,
  },
  noteText: { flex: 1, fontSize: 12, fontFamily: fonts.medium, color: "#4F46E5", lineHeight: 18 },
  actions: { paddingHorizontal: 20, gap: 12 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  primaryBtnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryBtnText: { fontSize: 14, fontFamily: fonts.semiBold, color: "#374151" },
});
