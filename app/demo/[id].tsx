import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { appColors, fonts } from "../../src/theme/colors";

const P = appColors;

export default function DemoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchDemo = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.DEMO_BY_ID(id));
      if (res.data?.success) {
        setDemo(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching demo:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemo();
    // Poll status every 8 seconds if pending
    const interval = setInterval(() => {
      if (demo?.status === "pending") {
        fetchDemo(false);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [id, demo?.status]);

  useEffect(() => {
    if (demo?.status === "pending") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [demo?.status]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Demo",
      "Are you sure you want to cancel this demo request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await apiClient.put(
                API_CONFIG.ENDPOINTS.DEMO_CANCEL(id),
                { cancelledBy: "student" }
              );
              if (res.data?.success) {
                fetchDemo(false);
              }
            } catch (e) {
              Alert.alert("Error", "Failed to cancel demo.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading demo details...</Text>
      </View>
    );
  }

  if (!demo) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Demo request not found</Text>
        <TouchableOpacity
          style={styles.backBtnSimple}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const teacher = demo.teacher;
  const isPending = demo.status === "pending";
  const isAccepted = demo.status === "accepted";
  const isRejected = demo.status === "rejected";
  const isCompleted = demo.status === "completed";
  const isCancelled = demo.status === "cancelled";

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, padding: 16 }}
      >
        {/* Status Card Banner */}
        {isPending && (
          <Animated.View
            style={[
              styles.statusBanner,
              styles.statusBannerPending,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.statusIconWrapPending}>
              <Ionicons name="time" size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitlePending}>
                Waiting for Teacher Approval
              </Text>
              <Text style={styles.statusBannerSubPending}>
                The teacher will review your slot request shortly.
              </Text>
            </View>
          </Animated.View>
        )}

        {isAccepted && (
          <View style={[styles.statusBanner, styles.statusBannerAccepted]}>
            <View style={styles.statusIconWrapAccepted}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitleAccepted}>
                Demo Confirmed!
              </Text>
              <Text style={styles.statusBannerSubAccepted}>
                Your demo has been accepted by the teacher. Be ready at the scheduled time!
              </Text>
            </View>
          </View>
        )}

        {isRejected && (
          <View style={[styles.statusBanner, styles.statusBannerRejected]}>
            <View style={styles.statusIconWrapRejected}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitleRejected}>
                Demo Request Declined
              </Text>
              <Text style={styles.statusBannerSubRejected}>
                {demo.teacherNote
                  ? `Note: ${demo.teacherNote}`
                  : "Teacher is unavailable at the requested time slot."}
              </Text>
            </View>
          </View>
        )}

        {isCompleted && (
          <View style={[styles.statusBanner, styles.statusBannerCompleted]}>
            <View style={styles.statusIconWrapCompleted}>
              <Ionicons name="school" size={24} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitleCompleted}>
                Demo Completed!
              </Text>
              <Text style={styles.statusBannerSubCompleted}>
                Hope your demo session went well! Choose if you'd like to continue.
              </Text>
            </View>
          </View>
        )}

        {isCancelled && (
          <View style={[styles.statusBanner, styles.statusBannerCancelled]}>
            <View style={styles.statusIconWrapCancelled}>
              <Ionicons name="ban-outline" size={24} color="#6B7280" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitleCancelled}>
                Demo Cancelled
              </Text>
              <Text style={styles.statusBannerSubCancelled}>
                This demo request was cancelled by {demo.cancelledBy || "user"}.
              </Text>
            </View>
          </View>
        )}

        {/* Teacher Info Card */}
        {teacher && (
          <View style={styles.card}>
            <View style={styles.teacherRow}>
              {teacher.profileImage ? (
                <Image
                  source={{ uri: teacher.profileImage }}
                  style={styles.teacherAvatar}
                />
              ) : (
                <View style={styles.teacherAvatarPlaceholder}>
                  <Text style={styles.teacherAvatarInitials}>
                    {teacher.name?.[0] || "T"}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherSubject}>{teacher.subject}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#E8A838" />
                  <Text style={styles.ratingText}>{teacher.rating || 4.8}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Demo Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6366F1" />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoVal}>
              {new Date(demo.requestedDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#6366F1" />
            <Text style={styles.infoLabel}>Time Slot:</Text>
            <Text style={styles.infoVal}>
              {demo.requestedTime?.startTime} - {demo.requestedTime?.endTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="videocam-outline" size={18} color="#6366F1" />
            <Text style={styles.infoLabel}>Mode:</Text>
            <Text style={styles.infoVal}>
              {demo.mode === "online" ? "Online Video Call" : "In-Person"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color="#6366F1" />
            <Text style={styles.infoLabel}>Demo Fee:</Text>
            <Text style={[styles.infoVal, { color: demo.isFree ? "#10B981" : "#E8A838" }]}>
              {demo.isFree ? "FREE" : `₹${demo.amount}`}
            </Text>
          </View>
        </View>

        {/* Action Buttons based on status */}
        {isCompleted && (
          <TouchableOpacity
            style={styles.decisionBtn}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/demo/decision",
                params: {
                  demoId: demo._id,
                  teacherId: teacher?._id,
                  teacherName: teacher?.name,
                  pricePerHour: String(teacher?.pricePerHour || 500),
                },
              })
            }
          >
            <LinearGradient
              colors={["#E8A838", "#C47F0A"]}
              style={styles.btnGrad}
            >
              <Text style={styles.btnText}>Choose Next Step</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isRejected && (
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/home")}
          >
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              style={styles.btnGrad}
            >
              <Text style={styles.btnText}>Browse Other Teachers</Text>
              <Ionicons name="search" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {(isPending || isAccepted) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.7}
          >
            {cancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Demo Request</Text>
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
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: fonts.medium, color: "#6B7280" },
  errorText: { marginTop: 12, fontSize: 16, fontFamily: fonts.semiBold, color: "#374151" },
  backBtnSimple: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#6366F1", borderRadius: 8 },
  backBtnText: { color: "#fff", fontFamily: fonts.semiBold },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  statusBanner: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  statusBannerPending: { backgroundColor: "#FEF3C7", borderWidth: 1, borderColor: "#FDE68A" },
  statusIconWrapPending: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  statusBannerTitlePending: { fontSize: 15, fontFamily: fonts.bold, color: "#92400E" },
  statusBannerSubPending: { fontSize: 12, fontFamily: fonts.regular, color: "#B45309", marginTop: 2 },
  statusBannerAccepted: { backgroundColor: "#D1FAE5", borderWidth: 1, borderColor: "#A7F3D0" },
  statusIconWrapAccepted: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#A7F3D0", alignItems: "center", justifyContent: "center" },
  statusBannerTitleAccepted: { fontSize: 15, fontFamily: fonts.bold, color: "#065F46" },
  statusBannerSubAccepted: { fontSize: 12, fontFamily: fonts.regular, color: "#047857", marginTop: 2 },
  statusBannerRejected: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5" },
  statusIconWrapRejected: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FCA5A5", alignItems: "center", justifyContent: "center" },
  statusBannerTitleRejected: { fontSize: 15, fontFamily: fonts.bold, color: "#991B1B" },
  statusBannerSubRejected: { fontSize: 12, fontFamily: fonts.regular, color: "#B91C1C", marginTop: 2 },
  statusBannerCompleted: { backgroundColor: "#DBEAFE", borderWidth: 1, borderColor: "#BFDBFE" },
  statusIconWrapCompleted: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#BFDBFE", alignItems: "center", justifyContent: "center" },
  statusBannerTitleCompleted: { fontSize: 15, fontFamily: fonts.bold, color: "#1E40AF" },
  statusBannerSubCompleted: { fontSize: 12, fontFamily: fonts.regular, color: "#1D4ED8", marginTop: 2 },
  statusBannerCancelled: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  statusIconWrapCancelled: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  statusBannerTitleCancelled: { fontSize: 15, fontFamily: fonts.bold, color: "#374151" },
  statusBannerSubCancelled: { fontSize: 12, fontFamily: fonts.regular, color: "#4B5563", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  teacherAvatar: { width: 52, height: 52, borderRadius: 26 },
  teacherAvatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center" },
  teacherAvatarInitials: { color: "#fff", fontSize: 20, fontFamily: fonts.bold },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  teacherSubject: { fontSize: 13, fontFamily: fonts.medium, color: "#6B7280", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#374151" },
  cardTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#111827", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  infoLabel: { fontSize: 13, fontFamily: fonts.medium, color: "#6B7280", width: 90 },
  infoVal: { flex: 1, fontSize: 13, fontFamily: fonts.semiBold, color: "#111827" },
  decisionBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  browseBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  btnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  btnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
  cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: "#FCA5A5" },
  cancelBtnText: { color: "#EF4444", fontFamily: fonts.semiBold, fontSize: 14 },
});
