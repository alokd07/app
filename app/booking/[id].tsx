import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../../src/theme/colors";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { Booking } from "../../src/types";
import {
  formatDate,
  formatTime,
  formatCurrency,
  openWhatsApp,
} from "../../src/utils/helpers";

const P = appColors;

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.BOOKING_DETAIL(id)
      );
      if (response.data?.data) {
        setBooking(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      Alert.alert("Error", "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: confirmCancelBooking,
        },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    setCancelling(true);
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.CANCEL_BOOKING(id)
      );

      if (response.data?.success) {
        Alert.alert("Success", "Booking cancelled successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to cancel booking"
      );
    } finally {
      setCancelling(false);
    }
  };

  const teacher = typeof booking?.teacher === "object" ? booking.teacher : null;

  const handleContactTeacher = () => {
    if (teacher) {
      const message = `Hi ${teacher.name}, I have a booking with you on ${formatDate(booking!.date)}`;
      openWhatsApp("9876543210", message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.root, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", bg: "#ECFDF5", color: "#059669" };
      case "cancelled":
        return { label: "Cancelled", bg: "#FEE2E2", color: "#DC2626" };
      default:
        return { label: "Confirmed", bg: "#EEF2FF", color: "#4F46E5" };
    }
  };

  const statusBadge = getStatusBadge(booking.status);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {/* Status Badge Banner */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Ionicons name="ellipse" size={8} color={statusBadge.color} />
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.label}
            </Text>
          </View>
          <Text style={styles.bookingIdText}>
            ID: #{booking._id ? booking._id.slice(-8).toUpperCase() : ""}
          </Text>
        </View>

        {/* Teacher Card */}
        {teacher && (
          <View style={styles.card}>
            <View style={styles.teacherRow}>
              {teacher.profileImage ? (
                <Image source={{ uri: teacher.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{teacher.name?.[0] || "T"}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherSub}>{teacher.subject || "Teacher"}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#E8A838" />
                  <Text style={styles.ratingText}>{teacher.rating ? teacher.rating.toFixed(1) : "4.8"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.waBtn}
                onPress={handleContactTeacher}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Session Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={16} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoVal}>{formatDate(booking.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="time-outline" size={16} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Time Slot</Text>
              <Text style={styles.infoVal}>
                {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconBox}>
              <Ionicons
                name={booking.mode === "online" ? "videocam-outline" : "location-outline"}
                size={16}
                color="#6366F1"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Mode</Text>
              <Text style={styles.infoVal}>
                {booking.mode === "online" ? "Online Video Class" : "In-Person Class"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>

          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Total Session Fee</Text>
            <Text style={styles.payVal}>{formatCurrency(booking.amount)}</Text>
          </View>

          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Advance Paid</Text>
            <Text style={[styles.payVal, { color: "#10B981" }]}>
              {formatCurrency(booking.advancePaid)}
            </Text>
          </View>

          <View style={[styles.payRow, { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 10, marginTop: 4 }]}>
            <Text style={styles.payTotalLabel}>Remaining Amount</Text>
            <Text style={styles.payTotalVal}>
              {formatCurrency(booking.remainingAmount)}
            </Text>
          </View>
          <Text style={styles.payNote}>* Remaining balance is settled after session completion.</Text>
        </View>

        {/* Action Buttons */}
        {((booking.status as string) === "completed" || (booking.status as string) === "confirmed") && (
          <TouchableOpacity
            style={styles.rateBtn}
            onPress={() =>
              router.push({
                pathname: "/rate-session",
                params: {
                  appointmentId: booking._id,
                  teacherId: teacher?._id,
                  teacherName: teacher?.name,
                  subject: teacher?.subject,
                },
              })
            }
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#E8A838", "#C47F0A"]} style={styles.rateGrad}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.rateBtnText}>Rate & Review Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {((booking.status as string) === "upcoming" || (booking.status as string) === "pending") && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.5 }]}
            onPress={handleCancelBooking}
            disabled={cancelling}
            activeOpacity={0.7}
          >
            {cancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 13, fontFamily: fonts.medium, color: "#6B7280" },
  errorText: { fontSize: 16, fontFamily: fonts.semiBold, color: "#374151" },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: fonts.bold },
  bookingIdText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#6B7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontFamily: fonts.bold },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  teacherSub: { fontSize: 13, fontFamily: fonts.medium, color: "#6B7280", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#374151" },
  waBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
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
  payRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  payLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280" },
  payVal: { fontSize: 13, fontFamily: fonts.semiBold, color: "#111827" },
  payTotalLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#111827" },
  payTotalVal: { fontSize: 16, fontFamily: fonts.bold, color: "#4F46E5" },
  payNote: { fontSize: 11, fontFamily: fonts.regular, color: "#9CA3AF", fontStyle: "italic", marginTop: 6 },
  rateBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  rateGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  rateBtnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  cancelBtnText: { color: "#EF4444", fontFamily: fonts.semiBold, fontSize: 14 },
});
