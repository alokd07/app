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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../src/services/api";
import { API_CONFIG } from "../src/config/api";
import { formatTime, formatCurrency, formatDate } from "../src/utils/helpers";

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
  error: "#E05252",
  errorPale: "rgba(224,82,82,0.10)",
  errorBorder: "rgba(224,82,82,0.25)",
};

// ─── Sample fallback data ──────────────────────────────────────────────────────
const SAMPLE_TEACHER = {
  _id: "t1",
  name: "Ananya Sharma",
  pricePerHour: 600,
  availability: [
    {
      // date: new Date().toISOString().split("T")[0],
      date: "2026-04-20",
      slots: [
        { startTime: "09:00", endTime: "10:00", isBooked: false },
        { startTime: "11:00", endTime: "12:00", isBooked: true },
        { startTime: "14:00", endTime: "15:00", isBooked: false },
        { startTime: "16:00", endTime: "17:00", isBooked: false },
      ],
    },
  ],
};

// ─── Atoms ─────────────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={card.wrap}>
      <View style={card.header}>
        <View style={card.iconBox}>
          <Ionicons name={icon} size={13} color={P.gold} />
        </View>
        <Text style={card.title}>{title}</Text>
      </View>
      <View style={card.body}>{children}</View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={sum.row}>
      <Text style={sum.label}>{label}</Text>
      <Text style={[sum.value, highlight && sum.valueHighlight]}>{value}</Text>
    </View>
  );
}

function PressBtn({ onPress, children, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 60,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 60,
          }).start()
        }
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function BookSessionScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const fetchTeacher = useCallback(async () => {
    try {
      const res = await apiClient.get(
        API_CONFIG.ENDPOINTS.TEACHER_DETAIL(teacherId),
      );
      if (res.data.data) setTeacher(res.data.data);
    } catch {
      setTeacher(SAMPLE_TEACHER);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);
  useEffect(() => {
    if (selectedDate && teacher?.availability) {
      const day = teacher.availability.find(
        (a: any) => a.date === selectedDate,
      );
      setAvailableSlots(day?.slots || []);
      setSelectedSlot(null);
    }
  }, [selectedDate, teacher?.availability]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Missing info", "Please select a date and time slot");
      return;
    }

    setBooking(true);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.BOOKINGS, {
        teacherId,
        date: selectedDate,
        timeSlot: selectedSlot,
        mode,
      });
      if (res.data.data) {
        const b = res.data.data;
        router.push({
          pathname: "/payment",
          params: {
            bookingId: b._id,
            amount: b.advancePaid.toString(),
            teacherName: teacher?.name || "Teacher",
            date: selectedDate,
            time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`,
          },
        });
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to create booking",
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: P.cream,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={P.gold} />
      </SafeAreaView>
    );
  }

  // Marked dates for calendar
  const today = new Date().toISOString().split("T")[0];
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
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* ── Nav ── */}
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={18} color={P.ink} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Book Session</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Hero banner ── */}
        <LinearGradient colors={[P.navy, P.navyMid]} style={styles.heroBanner}>
          <View style={styles.heroOrb} />
          <View style={styles.heroLeft}>
            <Text style={styles.heroEyebrow}>Booking with</Text>
            <Text style={styles.heroName}>{teacher?.name}</Text>
          </View>
          <View style={styles.heroPriceChip}>
            <Text style={styles.heroPriceAmount}>
              {formatCurrency(teacher?.pricePerHour || 0)}
            </Text>
            <Text style={styles.heroPriceLabel}>/hr</Text>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step 1: Date ── */}
          <SectionCard title="Select Date" icon="calendar-outline">
            <Calendar
              current={today}
              minDate={today}
              onDayPress={(day: any) => {
                setSelectedDate(day.dateString);
                setSelectedSlot(null);
              }}
              markedDates={markedDates}
              style={{ borderRadius: 12, overflow: "hidden" }}
              theme={{
                backgroundColor: P.white,
                calendarBackground: P.white,
                todayTextColor: P.gold,
                todayBackgroundColor: P.goldDim,
                selectedDayBackgroundColor: P.navy,
                selectedDayTextColor: P.white,
                arrowColor: P.gold,
                dotColor: P.gold,
                textDayFontFamily: "Manrope_500Medium",
                textMonthFontFamily: "Manrope_700Bold",
                textDayHeaderFontFamily: "Manrope_600SemiBold",
                textDayFontSize: 13,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 11,
                dayTextColor: P.ink,
                textDisabledColor: P.muted,
                monthTextColor: P.ink,
              }}
            />
          </SectionCard>

          {/* ── Step 2: Time Slots ── */}
          {selectedDate && (
            <SectionCard title="Available Time Slots" icon="time-outline">
              {availableSlots.length === 0 ? (
                <View style={styles.emptySlots}>
                  <Ionicons name="calendar-outline" size={28} color={P.muted} />
                  <Text style={styles.emptySlotsText}>
                    No slots available for this date
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
                          styles.slotChip,
                          isBooked && styles.slotChipBooked,
                          isSelected && styles.slotChipSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={11}
                            color={P.navy}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.slotChipText,
                            isBooked && styles.slotChipTextBooked,
                            isSelected && styles.slotChipTextSelected,
                          ]}
                        >
                          {formatTime(slot.startTime)} –{" "}
                          {formatTime(slot.endTime)}
                        </Text>
                        {isBooked && (
                          <View style={styles.slotBookedBadge}>
                            <Text style={styles.slotBookedBadgeText}>Full</Text>
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
            <SectionCard title="Session Mode" icon="options-outline">
              <View style={styles.modeRow}>
                {(["online", "offline"] as const).map((m) => {
                  const active = mode === m;
                  return (
                    <PressBtn
                      key={m}
                      onPress={() => setMode(m)}
                      style={{ flex: 1 }}
                    >
                      <View
                        style={[
                          styles.modeCard,
                          active && styles.modeCardActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.modeIconBox,
                            active && styles.modeIconBoxActive,
                          ]}
                        >
                          <Ionicons
                            name={m === "online" ? "videocam" : "location"}
                            size={18}
                            color={active ? P.navy : P.muted}
                          />
                        </View>
                        <Text
                          style={[
                            styles.modeLabel,
                            active && styles.modeLabelActive,
                          ]}
                        >
                          {m === "online" ? "Online" : "In-person"}
                        </Text>
                        <Text
                          style={[
                            styles.modeSub,
                            active && { color: P.mutedDark },
                          ]}
                        >
                          {m === "online"
                            ? "Via video call"
                            : "At your location"}
                        </Text>
                        {active && (
                          <View style={styles.modeCheck}>
                            <Ionicons
                              name="checkmark"
                              size={11}
                              color={P.navy}
                            />
                          </View>
                        )}
                      </View>
                    </PressBtn>
                  );
                })}
              </View>
            </SectionCard>
          )}

          {/* ── Booking Summary ── */}
          {readyToBook && (
            <View style={styles.summaryCard}>
              {/* Gold accent line */}
              <LinearGradient
                colors={[P.gold, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.summaryAccent}
              />
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIconBox}>
                  <Ionicons name="receipt-outline" size={13} color={P.gold} />
                </View>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
              </View>
              <View style={styles.summaryBody}>
                <SummaryRow label="Teacher" value={teacher?.name || "—"} />
                <SummaryRow label="Date" value={formatDate(selectedDate)} />
                <SummaryRow
                  label="Time"
                  value={`${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`}
                />
                <SummaryRow
                  label="Mode"
                  value={mode === "online" ? "Online" : "In-person"}
                />
                <View style={styles.summaryDivider} />
                <SummaryRow
                  label="Total Amount"
                  value={formatCurrency(teacher?.pricePerHour || 0)}
                  highlight
                />
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ── Footer CTA ── */}
        {readyToBook && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.ctaBtn, booking && { opacity: 0.65 }]}
              onPress={handleBook}
              disabled={booking}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[P.gold, P.goldLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaBtnInner}
              >
                {booking ? (
                  <ActivityIndicator color={P.navy} />
                ) : (
                  <>
                    <Text style={styles.ctaBtnText}>Proceed to Payment</Text>
                    <View style={styles.ctaArrow}>
                      <Ionicons name="arrow-forward" size={14} color={P.gold} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─── Card atom styles ──────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.ink },
  body: { padding: 16 },
});

// ─── Summary row styles ────────────────────────────────────────────────────────
const sum = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: { fontSize: 13, fontFamily: "Manrope_500Medium", color: P.muted },
  value: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: P.ink },
  valueHighlight: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
  },
});

// ─── Layout styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  // Nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
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
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroOrb: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(232,168,56,0.06)",
    top: -60,
    right: -30,
  },
  heroLeft: {},
  heroEyebrow: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: P.muted,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  heroName: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: P.cream,
    letterSpacing: -0.3,
  },
  heroPriceChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroPriceAmount: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: -0.5,
  },
  heroPriceLabel: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
  },

  scroll: { paddingBottom: 24 },

  // Slots
  emptySlots: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptySlotsText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    textAlign: "center",
  },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  slotChipSelected: { backgroundColor: P.gold, borderColor: P.gold },
  slotChipBooked: {
    backgroundColor: P.inputBg,
    borderColor: P.border,
    opacity: 0.55,
  },
  slotChipText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
  },
  slotChipTextSelected: { color: P.navy, fontFamily: "Manrope_700Bold" },
  slotChipTextBooked: { color: P.muted, textDecorationLine: "line-through" },
  slotBookedBadge: {
    marginLeft: 6,
    backgroundColor: P.errorPale,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  slotBookedBadgeText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: P.error,
  },

  // Mode
  modeRow: { flexDirection: "row", gap: 12 },
  modeCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.inputBg,
    padding: 14,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  modeCardActive: { backgroundColor: P.goldDim, borderColor: P.goldBorder },
  modeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modeIconBoxActive: { backgroundColor: P.gold, borderColor: P.gold },
  modeLabel: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.muted },
  modeLabelActive: { color: P.navy },
  modeSub: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    textAlign: "center",
  },
  modeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: P.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary card
  summaryCard: {
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
  summaryAccent: { height: 2 },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  summaryIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: { fontSize: 13, fontFamily: "Manrope_700Bold", color: P.ink },
  summaryBody: { padding: 18 },
  summaryDivider: { height: 1, backgroundColor: P.border, marginVertical: 12 },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: P.cream,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  ctaBtn: { borderRadius: 16, overflow: "hidden" },
  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  ctaBtnText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
