import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../src/services/api";
import { API_CONFIG } from "../src/config/api";
import { formatTime, formatCurrency, formatDate } from "../src/utils/helpers";
import { appColors, fonts } from "../src/theme/colors";

const { width: SW } = Dimensions.get("window");
const P = appColors;

// ─── Fallback ──────────────────────────────────────────────────────────────────
const SAMPLE_TEACHER = {
  _id: "t1",
  name: "Ananya Sharma",
  pricePerHour: 600,
  subjects: ["Mathematics", "Physics"],
  availability: [
    {
      date: new Date().toISOString().split("T")[0],
      slots: [
        { startTime: "09:00", endTime: "10:00", isBooked: false },
        { startTime: "11:00", endTime: "12:00", isBooked: true },
        { startTime: "14:00", endTime: "15:00", isBooked: false },
        { startTime: "16:00", endTime: "17:00", isBooked: false },
        { startTime: "18:00", endTime: "19:00", isBooked: false },
      ],
    },
  ],
};

// ─── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ["Date", "Time", "Mode", "Confirm"];

function StepBar({ current }: { current: number }) {
  return (
    <View style={sb.wrap}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <View style={sb.item}>
              <View style={[sb.dot, done && sb.dotDone, active && sb.dotActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[sb.dotNum, active && sb.dotNumActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[sb.label, (active || done) && sb.labelActive]}>{label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[sb.line, done && sb.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, step }: {
  title: string; icon: any; children: React.ReactNode; step: number;
}) {
  return (
    <View style={sc.wrap}>
      <View style={sc.head}>
        <View style={sc.stepBadge}>
          <Text style={sc.stepNum}>{step}</Text>
        </View>
        <View style={sc.iconBox}>
          <Ionicons name={icon} size={14} color={P.gold} />
        </View>
        <Text style={sc.title}>{title}</Text>
      </View>
      <View style={sc.body}>{children}</View>
    </View>
  );
}

// ─── Summary row ───────────────────────────────────────────────────────────────
function SumRow({ icon, label, value, gold }: { icon: any; label: string; value: string; gold?: boolean }) {
  return (
    <View style={sr.row}>
      <View style={sr.iconWrap}>
        <Ionicons name={icon} size={13} color={gold ? P.gold : P.muted} />
      </View>
      <Text style={sr.label}>{label}</Text>
      <Text style={[sr.value, gold && sr.valueGold]}>{value}</Text>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function BookSessionScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  // Which step are we on (0-indexed): 0=pick date, 1=pick slot, 2=pick mode, 3=confirm
  const currentStep = !selectedDate ? 0 : !selectedSlot ? 1 : mode === null ? 2 : 3;

  const fetchTeacher = useCallback(async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(teacherId));
      if (res.data?.data) setTeacher(res.data.data);
      else setTeacher(SAMPLE_TEACHER);
    } catch {
      setTeacher(SAMPLE_TEACHER);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => { fetchTeacher(); }, [fetchTeacher]);

  useEffect(() => {
    if (selectedDate && teacher?.availability) {
      const day = teacher.availability.find((a: any) => a.date === selectedDate);
      setAvailableSlots(day?.slots || []);
      setSelectedSlot(null);
    }
  }, [selectedDate, teacher?.availability]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Missing info", "Please select a date and time slot.");
      return;
    }
    setBooking(true);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.BOOKINGS, {
        teacherId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        mode,
      });
      if (res.status === 201) {
        const b = res.data?.data || res.data;
        const bookingId = b?._id;
        const payableAmount = b?.advancePaid ?? b?.amount ?? teacher?.pricePerHour ?? 0;
        if (!bookingId) throw new Error("Booking created but booking id was missing");
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
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={P.gold} />
        <Text style={{ marginTop: 12, fontFamily: fonts.medium, fontSize: 13, color: P.muted }}>
          Loading…
        </Text>
      </View>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Build marked dates
  const markedDates: any = {};
  (teacher?.availability || []).forEach((a: any) => {
    markedDates[a.date] = {
      marked: true,
      dotColor: P.gold,
      ...(a.date === selectedDate && { selected: true, selectedColor: P.navy }),
    };
  });

  const readyToBook = !!selectedDate && !!selectedSlot;

  return (
    <View style={styles.root}>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Teacher mini-card ── */}
        <View style={styles.teacherCard}>
          <LinearGradient
            colors={[P.navy, P.navyMid]}
            style={styles.teacherCardGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.tcDecor} />
            <View style={styles.tcDecor2} />
            <View style={styles.tcLeft}>
              <View style={styles.tcAvatar}>
                <Text style={styles.tcAvatarText}>
                  {teacher?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.tcEyebrow}>Booking with</Text>
                <Text style={styles.tcName}>{teacher?.name}</Text>
                {teacher?.subjects?.length > 0 && (
                  <Text style={styles.tcSubject}>{teacher.subjects.slice(0, 2).join(" · ")}</Text>
                )}
              </View>
            </View>
            <View style={styles.tcPriceBox}>
              <Text style={styles.tcPriceAmt}>{formatCurrency(teacher?.pricePerHour || 0)}</Text>
              <Text style={styles.tcPriceLbl}>per hour</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Step bar ── */}
        <StepBar current={currentStep} />

        {/* ── Step 1: Date ── */}
        <SectionCard title="Choose a Date" icon="calendar-outline" step={1}>
          <Calendar
            current={today}
            minDate={today}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
              setSelectedSlot(null);
            }}
            markedDates={markedDates}
            style={{ borderRadius: 0, overflow: "hidden" }}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              todayTextColor: P.gold,
              todayBackgroundColor: "rgba(232,168,56,0.1)",
              selectedDayBackgroundColor: P.navy,
              selectedDayTextColor: "#fff",
              arrowColor: P.gold,
              dotColor: P.gold,
              textDayFontFamily: fonts.medium,
              textMonthFontFamily: fonts.bold,
              textDayHeaderFontFamily: fonts.semiBold,
              textDayFontSize: 13,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 11,
              dayTextColor: P.ink,
              textDisabledColor: "#CBD5E1",
              monthTextColor: P.ink,
            }}
          />
          {selectedDate && (
            <View style={styles.selectedDateBanner}>
              <Ionicons name="checkmark-circle" size={15} color={P.gold} />
              <Text style={styles.selectedDateText}>
                {formatDate(selectedDate)} selected
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ── Step 2: Time slot ── */}
        {selectedDate && (
          <SectionCard title="Pick a Time Slot" icon="time-outline" step={2}>
            {availableSlots.length === 0 ? (
              <View style={styles.emptySlots}>
                <View style={styles.emptySlotIcon}>
                  <Ionicons name="calendar-outline" size={26} color={P.muted} />
                </View>
                <Text style={styles.emptySlotsTitle}>No slots available</Text>
                <Text style={styles.emptySlotsText}>
                  Try selecting a different date
                </Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {availableSlots.map((slot: any, i: number) => {
                  const isSelected = selectedSlot === slot;
                  const isBooked = slot.isBooked;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                      activeOpacity={0.8}
                      style={[
                        styles.slotPill,
                        isBooked && styles.slotPillBooked,
                        isSelected && styles.slotPillSelected,
                      ]}
                    >
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : isBooked ? "close-circle-outline" : "time-outline"}
                        size={13}
                        color={isSelected ? P.navy : isBooked ? "#CBD5E1" : P.muted}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[
                        styles.slotPillText,
                        isBooked && styles.slotPillTextBooked,
                        isSelected && styles.slotPillTextSelected,
                      ]}>
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </Text>
                      {isBooked && (
                        <View style={styles.bookedBadge}>
                          <Text style={styles.bookedBadgeText}>Full</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </SectionCard>
        )}

        {/* ── Step 3: Mode ── */}
        {selectedSlot && (
          <SectionCard title="Session Mode" icon="options-outline" step={3}>
            <View style={styles.modeRow}>
              {(["online", "in-person"] as const).map((m) => {
                const active = mode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMode(m)}
                    activeOpacity={0.85}
                    style={[styles.modeCard, active && styles.modeCardActive]}
                  >
                    {active && (
                      <View style={styles.modeCheckBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                    <LinearGradient
                      colors={active ? [P.gold, "#D4922A"] : ["#F8FAFC", "#F1F5F9"]}
                      style={styles.modeIconBox}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={m === "online" ? "videocam" : "location"}
                        size={20}
                        color={active ? P.navy : P.muted}
                      />
                    </LinearGradient>
                    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                      {m === "online" ? "Online" : "In-person"}
                    </Text>
                    <Text style={[styles.modeSub, active && styles.modeSubActive]}>
                      {m === "online" ? "Video call" : "At your place"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        )}

        {/* ── Step 4: Booking Summary ── */}
        {readyToBook && (
          <View style={styles.summaryCard}>
            {/* Gold top bar */}
            <LinearGradient
              colors={[P.gold, P.goldLight]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.summaryTopBar}
            />
            <View style={styles.summaryHead}>
              <View style={styles.summaryIconBox}>
                <Ionicons name="receipt-outline" size={14} color={P.gold} />
              </View>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryStepBadge}>
                <Text style={styles.summaryStepText}>Step 4</Text>
              </View>
            </View>

            <View style={styles.summaryBody}>
              <SumRow icon="person-outline" label="Teacher" value={teacher?.name || "—"} />
              <SumRow icon="calendar-outline" label="Date" value={formatDate(selectedDate)} />
              <SumRow
                icon="time-outline"
                label="Time"
                value={`${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`}
              />
              <SumRow
                icon={mode === "online" ? "videocam-outline" : "location-outline"}
                label="Mode"
                value={mode === "online" ? "Online (Video Call)" : "In-person"}
              />
              <View style={styles.summaryDivider} />
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(teacher?.pricePerHour || 0)}</Text>
              </View>
              <View style={styles.summaryNote}>
                <Ionicons name="shield-checkmark-outline" size={13} color={P.success} />
                <Text style={styles.summaryNoteText}>Free cancellation up to 24 hours before</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {readyToBook ? (
          <TouchableOpacity
            onPress={handleBook}
            disabled={booking}
            activeOpacity={0.88}
            style={[styles.ctaBtn, booking && { opacity: 0.65 }]}
          >
            <LinearGradient
              colors={[P.gold, "#D4922A"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaInner}
            >
              {booking ? (
                <ActivityIndicator color={P.navy} />
              ) : (
                <>
                  <View>
                    <Text style={styles.ctaLabel}>Proceed to Payment</Text>
                    <Text style={styles.ctaSub}>{formatCurrency(teacher?.pricePerHour || 0)} · {mode === "online" ? "Online" : "In-person"}</Text>
                  </View>
                  <View style={styles.ctaArrow}>
                    <Ionicons name="arrow-forward" size={16} color={P.navy} />
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.ctaDisabled}>
            <Ionicons name="calendar-outline" size={16} color={P.muted} />
            <Text style={styles.ctaDisabledText}>
              {!selectedDate ? "Select a date to continue" : "Select a time slot to continue"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Step bar styles ───────────────────────────────────────────────────────────
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 6,
  },
  item: { alignItems: "center", gap: 4 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#E2E8F0",
    alignItems: "center", justifyContent: "center",
  },
  dotActive: { backgroundColor: P.navy, ...Platform.select({ ios: { shadowColor: P.navy, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 3 } }) },
  dotDone: { backgroundColor: P.success },
  dotNum: { fontSize: 11, fontFamily: fonts.bold, color: "#94A3B8" },
  dotNumActive: { color: "#fff" },
  label: { fontSize: 9, fontFamily: fonts.medium, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 },
  labelActive: { color: P.ink },
  line: { flex: 1, height: 2, backgroundColor: "#E2E8F0", marginBottom: 14, marginHorizontal: 4 },
  lineDone: { backgroundColor: P.success },
});

// ─── Section card styles ───────────────────────────────────────────────────────
const sc = StyleSheet.create({
  wrap: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#0D1B2A", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  head: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC",
  },
  stepBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: P.navy,
    alignItems: "center", justifyContent: "center",
  },
  stepNum: { fontSize: 11, fontFamily: fonts.bold, color: "#fff" },
  iconBox: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 14, fontFamily: fonts.bold, color: P.ink, flex: 1 },
  body: { padding: 16 },
});

// ─── Summary row styles ────────────────────────────────────────────────────────
const sr = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 9,
  },
  iconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignItems: "center", justifyContent: "center",
  },
  label: { flex: 1, fontSize: 13, fontFamily: fonts.medium, color: P.muted },
  value: { fontSize: 13, fontFamily: fonts.semiBold, color: P.ink },
  valueGold: { fontSize: 16, fontFamily: fonts.extraBold, color: P.gold },
});

// ─── Layout styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  // Nav
  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: "#F5F6FA",
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
  navTitle: { fontSize: 16, fontFamily: fonts.bold, color: P.ink, letterSpacing: -0.2 },

  scroll: { paddingTop: 4 },

  // Teacher card
  teacherCard: {
    marginHorizontal: 16, marginBottom: 20,
    borderRadius: 20, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: P.navy, shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 5 },
    }),
  },
  teacherCardGrad: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 18, gap: 14,
    overflow: "hidden",
  },
  tcDecor: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(232,168,56,0.07)", top: -40, right: 60,
  },
  tcDecor2: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(232,168,56,0.05)", bottom: -30, right: 10,
  },
  tcLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  tcAvatar: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "rgba(232,168,56,0.18)",
    borderWidth: 1.5, borderColor: "rgba(232,168,56,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  tcAvatarText: { fontSize: 17, fontFamily: fonts.extraBold, color: P.gold },
  tcEyebrow: { fontSize: 10, fontFamily: fonts.medium, color: "rgba(255,255,255,0.5)", marginBottom: 2 },
  tcName: { fontSize: 17, fontFamily: fonts.bold, color: "#FFFFFF", letterSpacing: -0.2 },
  tcSubject: { fontSize: 11, fontFamily: fonts.medium, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  tcPriceBox: { alignItems: "flex-end" },
  tcPriceAmt: { fontSize: 20, fontFamily: fonts.extraBold, color: P.gold, letterSpacing: -0.5 },
  tcPriceLbl: { fontSize: 10, fontFamily: fonts.medium, color: "rgba(255,255,255,0.45)", marginTop: 1 },

  // Date selected banner
  selectedDateBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: "rgba(232,168,56,0.08)",
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(232,168,56,0.2)",
  },
  selectedDateText: { fontSize: 13, fontFamily: fonts.semiBold, color: P.gold },

  // Slots
  emptySlots: { alignItems: "center", paddingVertical: 28, gap: 8 },
  emptySlotIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptySlotsTitle: { fontSize: 15, fontFamily: fonts.bold, color: P.ink },
  emptySlotsText: { fontSize: 13, fontFamily: fonts.regular, color: P.muted, textAlign: "center" },

  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotPill: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 30, borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  slotPillSelected: { backgroundColor: P.gold, borderColor: P.gold },
  slotPillBooked: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", opacity: 0.5 },
  slotPillText: { fontSize: 12, fontFamily: fonts.semiBold, color: P.ink },
  slotPillTextSelected: { color: P.navy, fontFamily: fonts.bold },
  slotPillTextBooked: { color: "#CBD5E1", textDecorationLine: "line-through" },
  bookedBadge: {
    marginLeft: 6, backgroundColor: "#FEE2E2",
    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  bookedBadgeText: { fontSize: 9, fontFamily: fonts.bold, color: "#EF4444" },

  // Mode
  modeRow: { flexDirection: "row", gap: 12 },
  modeCard: {
    flex: 1, borderRadius: 16, borderWidth: 1.5,
    borderColor: "#E2E8F0", backgroundColor: "#F8FAFC",
    padding: 16, alignItems: "center", gap: 8,
    position: "relative", overflow: "hidden",
  },
  modeCardActive: { borderColor: P.gold, backgroundColor: "rgba(232,168,56,0.06)" },
  modeCheckBadge: {
    position: "absolute", top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: P.success,
    alignItems: "center", justifyContent: "center",
  },
  modeIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  modeLabel: { fontSize: 14, fontFamily: fonts.bold, color: P.muted },
  modeLabelActive: { color: P.ink },
  modeSub: { fontSize: 11, fontFamily: fonts.medium, color: "#94A3B8", textAlign: "center" },
  modeSubActive: { color: P.muted },

  // Summary card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 20, borderWidth: 1, borderColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#0D1B2A", shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  summaryTopBar: { height: 3 },
  summaryHead: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC",
  },
  summaryIconBox: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1, borderColor: "rgba(232,168,56,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  summaryTitle: { flex: 1, fontSize: 14, fontFamily: fonts.bold, color: P.ink },
  summaryStepBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  summaryStepText: { fontSize: 10, fontFamily: fonts.bold, color: "#64748B" },
  summaryBody: { padding: 16 },
  summaryDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  summaryTotal: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryTotalLabel: { fontSize: 14, fontFamily: fonts.semiBold, color: P.ink },
  summaryTotalValue: { fontSize: 22, fontFamily: fonts.extraBold, color: P.gold, letterSpacing: -0.5 },
  summaryNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 12, padding: 12,
    backgroundColor: "rgba(40,167,69,0.06)",
    borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(40,167,69,0.15)",
  },
  summaryNoteText: { fontSize: 12, fontFamily: fonts.medium, color: P.mutedDark, flex: 1 },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 8 },
    }),
  },
  ctaBtn: { borderRadius: 16, overflow: "hidden" },
  ctaInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 22, paddingVertical: 15,
  },
  ctaLabel: { fontSize: 15, fontFamily: fonts.extraBold, color: P.navy },
  ctaSub: { fontSize: 11, fontFamily: fonts.medium, color: "rgba(13,27,42,0.55)", marginTop: 1 },
  ctaArrow: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(13,27,42,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  ctaDisabled: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  ctaDisabledText: { fontSize: 14, fontFamily: fonts.medium, color: P.muted },
});
