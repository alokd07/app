import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../src/theme/colors";
import { useTeacherStore } from "../src/store/teacherStore";
import { useUserStore } from "../src/store/userStore";
import { useBookingStore } from "../src/store/bookingStore";

const DURATION_OPTIONS = [30, 60, 90, 120];

const TIME_SLOTS = [
  { time: "09:00 AM - 10:00 AM", isBooked: true },
  { time: "11:00 AM - 12:00 PM", isBooked: false },
  { time: "02:00 PM - 03:00 PM", isBooked: false },
  { time: "04:00 PM - 05:00 PM", isBooked: false },
  { time: "06:00 PM - 07:00 PM", isBooked: false },
];

export default function BookSessionScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const { getTeacherById } = useTeacherStore();
  const { children, addresses } = useUserStore();
  const { setWizardData } = useBookingStore();

  const teacher = getTeacherById(teacherId || "tch-1") || getTeacherById("tch-1")!;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLearnerId, setSelectedLearnerId] = useState(children[0]?.id || "child-1");
  const [selectedDate, setSelectedDate] = useState("2026-09-22");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[1].time);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [sessionFormat, setSessionFormat] = useState<"online" | "in-person">("online");
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "addr-1");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const activeLearner = children.find((c) => c.id === selectedLearnerId) || children[0];

  const hourlyPrice = teacher.pricePerHour || 750;
  const subtotal = Math.round((hourlyPrice * selectedDuration) / 60);
  const platformFee = 50;
  const totalPayable = Math.max(0, subtotal + platformFee - discount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "LEARN100") {
      setDiscount(100);
      Alert.alert("Coupon Applied!", "₹100 discount applied to your order.");
    } else if (promoCode.trim()) {
      Alert.alert("Invalid Coupon", "Use promo code LEARN100 for ₹100 off.");
    }
  };

  const handleProceedToPayment = () => {
    setWizardData({
      teacherId: teacher.id,
      learnerId: selectedLearnerId,
      subject: teacher.subjects[0],
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      durationMinutes: selectedDuration,
      format: sessionFormat,
      addressId: selectedAddressId,
      promoCode,
      discountAmount: discount,
    });

    router.push({
      pathname: "/payment",
      params: {
        amount: String(totalPayable),
        teacherName: teacher.name,
        date: selectedDate,
        time: selectedTimeSlot,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* STEP INDICATOR BAR */}
      <View style={styles.stepBar}>
        {[
          { step: 1, label: "Learner" },
          { step: 2, label: "Schedule" },
          { step: 3, label: "Format" },
          { step: 4, label: "Review" },
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <TouchableOpacity
              key={item.step}
              style={styles.stepItem}
              onPress={() => setCurrentStep(item.step)}
            >
              <View
                style={[
                  styles.stepBadge,
                  isActive && styles.stepBadgeActive,
                  isDone && styles.stepBadgeDone,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>
                    {item.step}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* TEACHER BANNER */}
        <View style={styles.teacherBanner}>
          <Image source={{ uri: teacher.profileImage }} style={styles.teacherAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherSub}>{teacher.subjects.join(" · ")}</Text>
          </View>
          <Text style={styles.priceTag}>₹{hourlyPrice}/hr</Text>
        </View>

        {/* ── STEP 1: SELECT LEARNER ── */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Who is this session for?</Text>
            {children.map((child) => {
              const isSelected = child.id === selectedLearnerId;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.learnerCard, isSelected && styles.learnerCardSelected]}
                  onPress={() => setSelectedLearnerId(child.id)}
                >
                  <Image source={{ uri: child.avatar }} style={styles.learnerAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.learnerName}>{child.name}</Text>
                    <Text style={styles.learnerGrade}>{child.grade} · {child.school}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#0D1B2A" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── STEP 2: SCHEDULE & DURATION ── */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Duration & Schedule</Text>

            <Text style={styles.subLabel}>Session Duration</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationChip,
                    selectedDuration === dur && styles.durationChipActive,
                  ]}
                  onPress={() => setSelectedDuration(dur)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === dur && styles.durationTextActive,
                    ]}
                  >
                    {dur} mins
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.subLabel, { marginTop: 16 }]}>Available Time Slots</Text>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  disabled={slot.isBooked}
                  style={[
                    styles.slotRow,
                    isSelected && styles.slotRowSelected,
                    slot.isBooked && styles.slotBooked,
                  ]}
                  onPress={() => setSelectedTimeSlot(slot.time)}
                >
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "time-outline"}
                    size={20}
                    color={isSelected ? "#0D1B2A" : slot.isBooked ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.slotText,
                      slot.isBooked && { textDecorationLine: "line-through", color: "#94A3B8" },
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── STEP 3: SESSION FORMAT & ADDRESS ── */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Session Format</Text>

            <View style={styles.formatRow}>
              {[
                { id: "online", label: "💻 Online Video Class", desc: "Live video class with interactive whiteboard" },
                { id: "in-person", label: "🏠 Home Tuition", desc: "Teacher visits your home address" },
              ].map((fmt) => (
                <TouchableOpacity
                  key={fmt.id}
                  style={[
                    styles.formatCard,
                    sessionFormat === fmt.id && styles.formatCardSelected,
                  ]}
                  onPress={() => setSessionFormat(fmt.id as any)}
                >
                  <Text style={styles.formatTitle}>{fmt.label}</Text>
                  <Text style={styles.formatDesc}>{fmt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {sessionFormat === "in-person" && (
              <View style={{ marginTop: 18 }}>
                <Text style={styles.subLabel}>Select Home Tuition Address</Text>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.addrCard, isSelected && styles.addrCardSelected]}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <Ionicons name="location" size={20} color="#0D1B2A" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.addrLabel}>{addr.label}</Text>
                        <Text style={styles.addrFull}>{addr.houseNo}, {addr.street}, {addr.area}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#0D1B2A" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── STEP 4: REVIEW BOOKING ── */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Booking Summary</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Tutor</Text>
                <Text style={styles.sumVal}>{teacher.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Learner</Text>
                <Text style={styles.sumVal}>{activeLearner?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Subject</Text>
                <Text style={styles.sumVal}>{teacher.subjects[0]}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Date & Time</Text>
                <Text style={styles.sumVal}>{selectedDate} ({selectedTimeSlot})</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Format</Text>
                <Text style={styles.sumVal}>
                  {sessionFormat === "online" ? "Online Video" : "Home Tuition"}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Tuition Fee ({selectedDuration} mins)</Text>
                <Text style={styles.sumVal}>₹{subtotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Platform Service Fee</Text>
                <Text style={styles.sumVal}>₹{platformFee}</Text>
              </View>

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.sumLabel, { color: "#059669" }]}>Promo Discount</Text>
                  <Text style={[styles.sumVal, { color: "#059669" }]}>-₹{discount}</Text>
                </View>
              )}

              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>₹{totalPayable}</Text>
              </View>
            </View>

            {/* Promo Code Input */}
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code (e.g. LEARN100)"
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER NAV CTAS */}
      <View style={styles.footerBar}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.footerBackBtn}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Text style={styles.footerBackText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.footerNextBtn}
          onPress={() => {
            if (currentStep < 4) {
              setCurrentStep((prev) => prev + 1);
            } else {
              handleProceedToPayment();
            }
          }}
        >
          <Text style={styles.footerNextText}>
            {currentStep === 4 ? `Proceed to Pay · ₹${totalPayable}` : "Continue"}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#0D1B2A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  stepBar: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#FFFFFF", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  stepItem: { alignItems: "center", gap: 4 },
  stepBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  stepBadgeActive: { backgroundColor: "#0D1B2A" },
  stepBadgeDone: { backgroundColor: "#059669" },
  stepNum: { fontSize: 11, fontFamily: fonts.bold, color: "#64748B" },
  stepNumActive: { color: "#FFFFFF" },
  stepLabel: { fontSize: 11, fontFamily: fonts.medium, color: "#64748B" },
  stepLabelActive: { color: "#0D1B2A", fontFamily: fonts.bold },

  teacherBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  teacherAvatar: { width: 44, height: 44, borderRadius: 22 },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  teacherSub: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B" },
  priceTag: { fontSize: 14, fontFamily: fonts.bold, color: "#E8A838" },

  stepContent: {},
  stepTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 14 },
  subLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 8 },

  learnerCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  learnerCardSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  learnerAvatar: { width: 44, height: 44, borderRadius: 22 },
  learnerName: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  learnerGrade: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },

  durationRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  durationChip: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  durationChipActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  durationText: { fontSize: 12, fontFamily: fonts.medium, color: "#475569" },
  durationTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  slotRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  slotBooked: { opacity: 0.5, backgroundColor: "#F1F5F9" },
  slotText: { fontSize: 13, fontFamily: fonts.medium, color: "#0D1B2A" },

  formatRow: { gap: 10 },
  formatCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  formatCardSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  formatTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  formatDesc: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 4 },

  addrCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  addrCardSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  addrLabel: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A" },
  addrFull: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },

  summaryCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  sumLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B" },
  sumVal: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  totalLabel: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  totalVal: { fontSize: 18, fontFamily: fonts.bold, color: "#4F46E5" },

  promoRow: { flexDirection: "row", gap: 8 },
  promoInput: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, fontSize: 13, fontFamily: fonts.medium, color: "#0D1B2A" },
  applyBtn: { backgroundColor: "#0D1B2A", paddingHorizontal: 18, justifyContent: "center", borderRadius: 12 },
  applyText: { color: "#FFFFFF", fontSize: 13, fontFamily: fonts.bold },

  footerBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 12, padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  footerBackBtn: { paddingHorizontal: 20, justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  footerBackText: { fontSize: 14, fontFamily: fonts.bold, color: "#64748B" },
  footerNextBtn: { flex: 1, backgroundColor: "#E8A838", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12 },
  footerNextText: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
});
