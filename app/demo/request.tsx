import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated, Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { appColors, fonts } from "../../src/theme/colors";

const { width: SW } = Dimensions.get("window");
const P = appColors;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function DemoRequestScreen() {
  const insets = useSafeAreaInsets();
  const { teacherId, teacherName, teacherSubject, pricePerHour } = useLocalSearchParams<{
    teacherId: string; teacherName: string; teacherSubject: string; pricePerHour: string;
  }>();

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [slots, setSlots] = useState<{ startTime: string; endTime: string; isBooked: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quota, setQuota] = useState<{ isFreeAvailable: boolean; freeDemosRemaining: number; nextDemoCost: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.DEMO_QUOTA);
      if (res.data?.success) setQuota(res.data.data);
    } catch (_) {}
  };

  const fetchSlots = useCallback(async (dateStr: string) => {
    if (!teacherId) return;
    setLoadingSlots(true);
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(teacherId));
      const avail = res.data?.data?.availability || [];
      const day = avail.find((a: any) => a.date === dateStr);
      setSlots(day?.slots || [
        { startTime: "09:00", endTime: "10:00", isBooked: false },
        { startTime: "11:00", endTime: "12:00", isBooked: false },
        { startTime: "14:00", endTime: "15:00", isBooked: false },
        { startTime: "16:00", endTime: "17:00", isBooked: false },
      ]);
    } catch (_) {
      setSlots([
        { startTime: "09:00", endTime: "10:00", isBooked: false },
        { startTime: "11:00", endTime: "12:00", isBooked: false },
        { startTime: "14:00", endTime: "15:00", isBooked: false },
        { startTime: "16:00", endTime: "17:00", isBooked: false },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  }, [teacherId]);

  const handleSelectDate = (day: number) => {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(d);
    setSelectedSlot(null);
    fetchSlots(d);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Missing info", "Please select a date and time slot.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.DEMO_REQUEST, {
        teacherId,
        requestedDate: selectedDate,
        requestedTime: selectedSlot,
        mode,
      });
      if (res.data?.success) {
        const demo = res.data.data;
        if (res.data.requiresPayment) {
          // Navigate to payment for ₹49
          router.push({
            pathname: "/payment",
            params: {
              demoId: demo._id,
              amount: String(res.data.paymentAmount),
              teacherName: teacherName || "Teacher",
              date: selectedDate,
              time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
              isDemoPayment: "true",
            },
          });
        } else {
          router.replace({ pathname: "/demo/[id]", params: { id: demo._id } });
        }
      } else {
        Alert.alert("Error", res.data?.message || "Failed to submit demo request.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const cells = buildCalendarDays(calYear, calMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const isFree = quota?.isFreeAvailable ?? true;
  const demoCost = isFree ? 0 : (quota?.nextDemoCost ?? 49);

  return (
    <View style={styles.root}>
      <Animated.ScrollView showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim }}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Quota Banner */}
        {quota && (
          <View style={[styles.quotaBanner, !isFree && styles.quotaBannerPaid]}>
            <Ionicons name={isFree ? "gift-outline" : "alert-circle-outline"} size={16}
              color={isFree ? "#10B981" : "#F59E0B"} />
            <Text style={[styles.quotaText, !isFree && { color: "#F59E0B" }]}>
              {isFree
                ? `${quota.freeDemosRemaining} free demo${quota.freeDemosRemaining !== 1 ? "s" : ""} remaining this month`
                : `Monthly free demos used — this demo costs ₹${demoCost}`}
            </Text>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.card}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#6366F1" />
            </TouchableOpacity>
            <Text style={styles.calTitle}>{MONTHS[calMonth]} {calYear}</Text>
            <TouchableOpacity onPress={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <View style={styles.dayHeaderRow}>
            {DAY_HEADERS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={styles.calCell} />;
              const dStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast = dStr < todayStr;
              const isSelected = dStr === selectedDate;
              const isToday = dStr === todayStr;
              return (
                <TouchableOpacity key={dStr} style={[styles.calCell,
                  isSelected && styles.calCellSelected,
                  isToday && !isSelected && styles.calCellToday,
                  isPast && styles.calCellPast]}
                  onPress={() => !isPast && handleSelectDate(day)}
                  activeOpacity={isPast ? 1 : 0.7} disabled={isPast}>
                  <Text style={[styles.calDayText,
                    isSelected && { color: "#fff", fontFamily: fonts.bold },
                    isPast && { color: "#D1D5DB" },
                    isToday && !isSelected && { color: "#6366F1", fontFamily: fonts.bold }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Ionicons name="time-outline" size={16} color="#6366F1" />
              <Text style={styles.sectionTitle}>Available Slots</Text>
            </View>
            {loadingSlots ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.emptyText}>No slots available for this date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <TouchableOpacity key={slot.startTime}
                      style={[styles.slotChip, isSelected && styles.slotChipSelected, slot.isBooked && styles.slotChipBooked]}
                      onPress={() => !slot.isBooked && setSelectedSlot(slot)}
                      activeOpacity={slot.isBooked ? 1 : 0.7} disabled={slot.isBooked}>
                      <Text style={[styles.slotText, isSelected && { color: "#fff" }, slot.isBooked && { color: "#9CA3AF" }]}>
                        {slot.startTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Mode */}
        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Ionicons name="laptop-outline" size={16} color="#6366F1" />
            <Text style={styles.sectionTitle}>Session Mode</Text>
          </View>
          <View style={styles.modeRow}>
            {(["online", "in-person"] as const).map(m => (
              <TouchableOpacity key={m} style={[styles.modeChip, mode === m && styles.modeChipSelected]}
                onPress={() => setMode(m)} activeOpacity={0.7}>
                <Ionicons name={m === "online" ? "videocam-outline" : "location-outline"} size={16}
                  color={mode === m ? "#fff" : "#6B7280"} />
                <Text style={[styles.modeText, mode === m && { color: "#fff" }]}>
                  {m === "online" ? "Online" : "In-Person"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Demo Summary */}
        {selectedDate && selectedSlot && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Demo Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Teacher</Text>
              <Text style={styles.summaryValue}>{teacherName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{selectedDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{selectedSlot.startTime} – {selectedSlot.endTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mode</Text>
              <Text style={styles.summaryValue}>{mode === "online" ? "Online" : "In-Person"}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Cost</Text>
              <Text style={[styles.summaryValue, { color: isFree ? "#10B981" : "#E8A838", fontFamily: fonts.bold }]}>
                {isFree ? "FREE" : `₹${demoCost}`}
              </Text>
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={[styles.ctaBtn, (!selectedDate || !selectedSlot) && { opacity: 0.5 }]}
          onPress={handleSubmit} activeOpacity={0.85} disabled={!selectedDate || !selectedSlot || submitting}>
          <LinearGradient colors={["#E8A838", "#C47F0A"]} style={styles.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.ctaText}>Request Demo</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  headerSub: { fontSize: 12, fontFamily: fonts.regular, color: "#6B7280" },
  demoBadge: { marginLeft: "auto", backgroundColor: "#10B981", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  demoBadgeText: { color: "#fff", fontFamily: fonts.bold, fontSize: 12 },
  quotaBanner: { margin: 16, marginBottom: 0, backgroundColor: "#ECFDF5", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  quotaBannerPaid: { backgroundColor: "#FFFBEB" },
  quotaText: { flex: 1, fontSize: 13, fontFamily: fonts.medium, color: "#10B981" },
  card: { margin: 16, marginBottom: 0, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  calHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calTitle: { fontSize: 15, fontFamily: fonts.semiBold, color: "#111827" },
  dayHeaderRow: { flexDirection: "row", marginBottom: 6 },
  dayHeader: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: fonts.semiBold, color: "#9CA3AF" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  calCellSelected: { backgroundColor: "#6366F1", borderRadius: 999 },
  calCellToday: { borderWidth: 1.5, borderColor: "#6366F1", borderRadius: 999 },
  calCellPast: {},
  calDayText: { fontSize: 13, fontFamily: fonts.medium, color: "#374151" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.semiBold, color: "#111827" },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontFamily: fonts.regular, paddingVertical: 12 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F3F4F6", borderWidth: 1.5, borderColor: "transparent" },
  slotChipSelected: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  slotChipBooked: { backgroundColor: "#F9FAFB", opacity: 0.5 },
  slotText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  modeRow: { flexDirection: "row", gap: 12 },
  modeChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F3F4F6", borderWidth: 1.5, borderColor: "transparent" },
  modeChipSelected: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  modeText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  summaryCard: { margin: 16, marginBottom: 0, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  summaryTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#111827", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  summaryLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280" },
  summaryValue: { fontSize: 13, fontFamily: fonts.semiBold, color: "#111827" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  ctaText: { color: "#fff", fontFamily: fonts.bold, fontSize: 16 },
});
