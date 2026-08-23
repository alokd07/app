import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../src/services/api";
import { API_CONFIG } from "../src/config/api";
import { formatTime, formatCurrency, formatDate } from "../src/utils/helpers";
import { appColors, fonts } from "../src/theme/colors";

const P = appColors;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_FALLBACK_SLOTS = [
  { startTime: "09:00", endTime: "10:00", isBooked: false },
  { startTime: "11:00", endTime: "12:00", isBooked: false },
  { startTime: "14:00", endTime: "15:00", isBooked: false },
  { startTime: "16:00", endTime: "17:00", isBooked: false },
  { startTime: "18:00", endTime: "19:00", isBooked: false },
];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function BookSessionScreen() {
  const insets = useSafeAreaInsets();
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [teacher, setTeacher] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number>(1); // 1=Date, 2=Time, 3=Mode, 4=Summary

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeacher = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(teacherId));
      if (res.data?.data) {
        setTeacher(res.data.data);
      }
    } catch {
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  useEffect(() => {
    if (selectedDate) {
      if (teacher?.availability && Array.isArray(teacher.availability)) {
        const day = teacher.availability.find((a: any) => (a.date ? a.date.split("T")[0] : "") === selectedDate);
        if (day?.slots && day.slots.length > 0) {
          setAvailableSlots(day.slots);
        } else {
          setAvailableSlots(DEFAULT_FALLBACK_SLOTS);
        }
      } else {
        setAvailableSlots(DEFAULT_FALLBACK_SLOTS);
      }
      setSelectedSlot(null);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, teacher?.availability]);

  const toggleStep = (step: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStep((prev) => (prev === step ? 0 : step));
  };

  const handleSelectDate = (day: number) => {
    const dStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dStr);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStep(2); // Automatically open Step 2 (Time Slot)
  };

  const handleSelectSlot = (slot: any) => {
    setSelectedSlot(slot);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStep(3); // Automatically open Step 3 (Mode)
  };

  const handleSelectMode = (m: "online" | "in-person") => {
    setMode(m);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStep(4); // Automatically open Step 4 (Summary)
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Missing Selection", "Please select both a date and time slot.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.BOOKINGS, {
        teacherId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        mode,
      });

      if (res.status === 200 || res.status === 201) {
        const b = res.data?.data || res.data;
        const bookingId = b?._id;
        const payableAmount = b?.advancePaid ?? b?.amount ?? teacher?.pricePerHour ?? 500;

        if (!bookingId) throw new Error("Booking created but ID was missing.");

        router.push({
          pathname: "/payment",
          params: {
            bookingId,
            amount: String(payableAmount),
            teacherName: teacher?.name || "Teacher",
            date: selectedDate,
            time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`,
          },
        });
      } else {
        throw new Error(res.data?.message || "Failed to create booking.");
      }
    } catch (e: any) {
      Alert.alert("Booking Failed", e.response?.data?.message || e.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  const cells = buildCalendarDays(calYear, calMonth);
  const price = teacher?.pricePerHour || teacher?.fees || 500;
  const readyToBook = !!selectedDate && !!selectedSlot;
  const availableDateSet = new Set(
    (teacher?.availability || []).map((a: any) => (a.date ? a.date.split("T")[0] : ""))
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* ── Teacher Banner ── */}
        <View style={styles.teacherBanner}>
          <LinearGradient
            colors={["#020817", "#1A3050"]}
            style={styles.bannerGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.teacherRow}>
              {teacher?.profileImage ? (
                <Image source={{ uri: teacher.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{teacher?.name?.[0] || "T"}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.teacherName}>{teacher?.name}</Text>
                <Text style={styles.teacherSub}>
                  {teacher?.subjects?.slice(0, 2).join(" · ") || "Subject Expert"}
                </Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceVal}>{formatCurrency(price)}</Text>
                <Text style={styles.priceLbl}>/ hour</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>

          {/* ── ACCORDION STEP 1: CHOOSE DATE ── */}
          <View style={[styles.accordionCard, expandedStep === 1 && styles.accordionCardExpanded]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleStep(1)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepBadge, !!selectedDate && styles.stepBadgeDone]}>
                {selectedDate ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>1</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.accordionTitle}>Choose Date</Text>
                {selectedDate && expandedStep !== 1 && (
                  <Text style={styles.accordionSummaryText}>{formatDate(selectedDate)}</Text>
                )}
              </View>

              <Ionicons
                name={expandedStep === 1 ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {expandedStep === 1 && (
              <View style={styles.accordionBody}>
                {/* Month Nav */}
                <View style={styles.calNav}>
                  <TouchableOpacity
                    style={styles.calNavBtn}
                    onPress={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear((y) => y - 1);
                      } else setCalMonth((m) => m - 1);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={18} color="#4B5563" />
                  </TouchableOpacity>

                  <Text style={styles.calMonthText}>
                    {MONTHS[calMonth]} {calYear}
                  </Text>

                  <TouchableOpacity
                    style={styles.calNavBtn}
                    onPress={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear((y) => y + 1);
                      } else setCalMonth((m) => m + 1);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                {/* Day Headers */}
                <View style={styles.dayHeaderRow}>
                  {DAY_HEADERS.map((d) => (
                    <Text key={d} style={styles.dayHeaderCell}>{d}</Text>
                  ))}
                </View>

                {/* Grid */}
                <View style={styles.calGrid}>
                  {cells.map((day, i) => {
                    if (!day) return <View key={`e-${i}`} style={styles.calCell} />;
                    const dStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isPast = dStr < todayStr;
                    const isSelected = dStr === selectedDate;
                    const isToday = dStr === todayStr;
                    const isAvail = availableDateSet.has(dStr);

                    return (
                      <TouchableOpacity
                        key={dStr}
                        style={styles.calCell}
                        onPress={() => !isPast && handleSelectDate(day)}
                        activeOpacity={isPast ? 1 : 0.7}
                        disabled={isPast}
                      >
                        <View
                          style={[
                            styles.dayCircle,
                            isSelected && styles.dayCircleSelected,
                            isToday && !isSelected && styles.dayCircleToday,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calDayText,
                              isSelected && { color: "#fff", fontFamily: fonts.bold },
                              isPast && { color: "#D1D5DB" },
                              isToday && !isSelected && { color: "#6366F1", fontFamily: fonts.bold },
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                        {isAvail && !isSelected && !isPast && <View style={styles.availDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* ── ACCORDION STEP 2: PICK TIME SLOT ── */}
          <View style={[styles.accordionCard, expandedStep === 2 && styles.accordionCardExpanded]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => {
                if (!selectedDate) {
                  Alert.alert("Select Date First", "Please select a date in Step 1.");
                  return;
                }
                toggleStep(2);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.stepBadge, !!selectedSlot && styles.stepBadgeDone]}>
                {selectedSlot ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>2</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.accordionTitle}>Pick Time Slot</Text>
                {selectedSlot && expandedStep !== 2 && (
                  <Text style={styles.accordionSummaryText}>
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </Text>
                )}
              </View>

              <Ionicons
                name={expandedStep === 2 ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {expandedStep === 2 && (
              <View style={styles.accordionBody}>
                <Text style={styles.selectedDateSub}>
                  Available slots for {formatDate(selectedDate)}
                </Text>

                <View style={styles.slotsGrid}>
                  {availableSlots.map((slot: any, idx: number) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    const isBooked = slot.isBooked;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.slotChip,
                          isSelected && styles.slotChipSelected,
                          isBooked && styles.slotChipBooked,
                        ]}
                        onPress={() => !isBooked && handleSelectSlot(slot)}
                        disabled={isBooked}
                        activeOpacity={isBooked ? 1 : 0.7}
                      >
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "time-outline"}
                          size={15}
                          color={isSelected ? "#fff" : isBooked ? "#9CA3AF" : "#6366F1"}
                        />
                        <Text
                          style={[
                            styles.slotText,
                            isSelected && { color: "#fff" },
                            isBooked && { color: "#9CA3AF", textDecorationLine: "line-through" },
                          ]}
                        >
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* ── ACCORDION STEP 3: CHOOSE MODE ── */}
          <View style={[styles.accordionCard, expandedStep === 3 && styles.accordionCardExpanded]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleStep(3)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepBadge, styles.stepBadgeDone]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.accordionTitle}>Choose Mode</Text>
                {mode && expandedStep !== 3 && (
                  <Text style={styles.accordionSummaryText}>
                    {mode === "online" ? "Online Video Class" : "In-Person Class"}
                  </Text>
                )}
              </View>

              <Ionicons
                name={expandedStep === 3 ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {expandedStep === 3 && (
              <View style={styles.accordionBody}>
                <View style={styles.modeRow}>
                  {(["online", "in-person"] as const).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.modeChip, mode === m && styles.modeChipSelected]}
                      onPress={() => handleSelectMode(m)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={m === "online" ? "videocam-outline" : "location-outline"}
                        size={20}
                        color={mode === m ? "#fff" : "#4B5563"}
                      />
                      <Text style={[styles.modeText, mode === m && { color: "#fff" }]}>
                        {m === "online" ? "Online Class" : "In-Person Class"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ── ACCORDION STEP 4: SUMMARY & CONFIRM ── */}
          <View style={[styles.accordionCard, expandedStep === 4 && styles.accordionCardExpanded]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleStep(4)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepBadge, readyToBook && styles.stepBadgeDone]}>
                {readyToBook ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>4</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.accordionTitle}>Booking Summary</Text>
                {readyToBook && expandedStep !== 4 && (
                  <Text style={styles.accordionSummaryText}>Total Payable: {formatCurrency(price)}</Text>
                )}
              </View>

              <Ionicons
                name={expandedStep === 4 ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {expandedStep === 4 && (
              <View style={styles.accordionBody}>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>Teacher</Text>
                  <Text style={styles.sumVal}>{teacher?.name || "Teacher"}</Text>
                </View>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>Date</Text>
                  <Text style={styles.sumVal}>{selectedDate ? formatDate(selectedDate) : "Not selected"}</Text>
                </View>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>Time</Text>
                  <Text style={styles.sumVal}>
                    {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : "Not selected"}
                  </Text>
                </View>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>Mode</Text>
                  <Text style={styles.sumVal}>{mode === "online" ? "Online Video" : "In-Person Class"}</Text>
                </View>
                <View style={[styles.sumRow, { borderBottomWidth: 0, paddingTop: 12 }]}>
                  <Text style={styles.sumTotalLabel}>Total Amount</Text>
                  <Text style={styles.sumTotalVal}>{formatCurrency(price)}</Text>
                </View>

                <View style={styles.guaranteeBox}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.guaranteeText}>
                    Free cancellation up to 24 hours before session.
                  </Text>
                </View>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, (!readyToBook || submitting) && { opacity: 0.5 }]}
          onPress={handleBook}
          disabled={!readyToBook || submitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#E8A838", "#C47F0A"]}
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {readyToBook ? `Proceed to Pay · ${formatCurrency(price)}` : "Select Date & Time"}
                </Text>
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
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 13, fontFamily: fonts.medium, color: "#6B7280" },
  teacherBanner: { margin: 16, marginBottom: 0, borderRadius: 16, overflow: "hidden" },
  bannerGrad: { padding: 16 },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontFamily: fonts.bold },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#fff" },
  teacherSub: { fontSize: 12, fontFamily: fonts.regular, color: "#94A3B8", marginTop: 2 },
  priceTag: { alignItems: "flex-end" },
  priceVal: { fontSize: 16, fontFamily: fonts.bold, color: "#E8A838" },
  priceLbl: { fontSize: 10, fontFamily: fonts.regular, color: "#94A3B8" },
  accordionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  accordionCardExpanded: {
    borderColor: "#6366F1",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeDone: { backgroundColor: "#10B981" },
  stepBadgeText: { fontSize: 12, fontFamily: fonts.bold, color: "#6366F1" },
  accordionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#111827" },
  accordionSummaryText: { fontSize: 12, fontFamily: fonts.medium, color: "#4F46E5", marginTop: 2 },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  calNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  calNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  calMonthText: { fontSize: 15, fontFamily: fonts.semiBold, color: "#111827" },
  dayHeaderRow: { flexDirection: "row", marginBottom: 6 },
  dayHeaderCell: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: fonts.semiBold, color: "#9CA3AF" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: { backgroundColor: "#6366F1" },
  dayCircleToday: { borderWidth: 1.5, borderColor: "#6366F1" },
  calDayText: { fontSize: 13, fontFamily: fonts.medium, color: "#374151" },
  availDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#E8A838", marginTop: 2 },
  selectedDateSub: { fontSize: 12, fontFamily: fonts.medium, color: "#6B7280", marginBottom: 12 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  slotChipSelected: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  slotChipBooked: { backgroundColor: "#F9FAFB", opacity: 0.5 },
  slotText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  modeRow: { flexDirection: "row", gap: 12 },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  modeChipSelected: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  modeText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sumLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280" },
  sumVal: { fontSize: 13, fontFamily: fonts.semiBold, color: "#111827" },
  sumTotalLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#111827" },
  sumTotalVal: { fontSize: 16, fontFamily: fonts.bold, color: "#4F46E5" },
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
  },
  guaranteeText: { flex: 1, fontSize: 12, fontFamily: fonts.medium, color: "#065F46" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
});
