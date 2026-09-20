import React, { useState } from "react";
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
import { appColors, fonts } from "../../src/theme/colors";
import { useTeacherStore } from "../../src/store/teacherStore";
import { useUserStore } from "../../src/store/userStore";
import { useTuitionStore } from "../../src/store/tuitionStore";

const TIME_SLOTS = [
  "04:00 PM – 05:00 PM",
  "05:00 PM – 06:00 PM",
  "06:00 PM – 07:00 PM",
  "07:00 PM – 08:00 PM",
];

export default function RequestDemoScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const { getTeacherById } = useTeacherStore();
  const { children, addresses } = useUserStore();
  const { createDemoRequest } = useTuitionStore();

  const teacher = getTeacherById(teacherId || "tch-1") || getTeacherById("tch-1")!;

  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || "child-1");
  const [selectedSubject, setSelectedSubject] = useState(teacher.subjects[0] || "Mathematics");
  const [selectedDate, setSelectedDate] = useState("2026-09-22");
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "addr-1");
  const [note, setNote] = useState("");

  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleSubmitDemo = () => {
    createDemoRequest({
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.profileImage,
      childId: activeChild.id,
      childName: activeChild.name,
      subject: selectedSubject,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      location: `${activeAddress.houseNo}, ${activeAddress.street}, ${activeAddress.area}`,
      noteForTeacher: note.trim(),
      demoFee: teacher.demoFee,
    });

    Alert.alert(
      "Demo Request Sent!",
      `Your demo class request has been sent to ${teacher.name}. The teacher will confirm shortly.`,
      [
        {
          text: "View Status",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Demo Class</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Teacher Card */}
        <View style={styles.teacherBanner}>
          <Image source={{ uri: teacher.profileImage }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherSub}>{teacher.qualifications[0]}</Text>
          </View>
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE DEMO</Text>
          </View>
        </View>

        {/* Step 1: Select Child */}
        <Text style={styles.sectionTitle}>1. Select Child</Text>
        {children.map((c) => {
          const isSelected = c.id === selectedChildId;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setSelectedChildId(c.id)}
            >
              <Image source={{ uri: c.avatar }} style={styles.childAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{c.name}</Text>
                <Text style={styles.childGrade}>{c.grade} · {c.school}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color="#0D1B2A" />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Step 2: Select Subject */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>2. Select Subject</Text>
        <View style={styles.chipsRow}>
          {teacher.subjects.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedSubject(sub)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step 3 & 4: Preferred Date & Time */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>3. Preferred Time Slot</Text>
        {TIME_SLOTS.map((slot) => {
          const isSelected = selectedTime === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotRow, isSelected && styles.slotRowSelected]}
              onPress={() => setSelectedTime(slot)}
            >
              <Ionicons
                name={isSelected ? "checkmark-circle" : "time-outline"}
                size={20}
                color={isSelected ? "#0D1B2A" : "#94A3B8"}
              />
              <Text style={styles.slotText}>{slot}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Step 5: Home Address */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>4. Confirm Home Address</Text>
        <View style={styles.addrCard}>
          <Ionicons name="location" size={20} color="#0D1B2A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.addrLabel}>{activeAddress.label}</Text>
            <Text style={styles.addrFull}>
              {activeAddress.houseNo}, {activeAddress.street}, {activeAddress.area}
            </Text>
          </View>
        </View>

        {/* Step 6: Note for Teacher */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>5. Note for Teacher (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="e.g. Focus on algebra fundamentals and school test preparation."
          placeholderTextColor="#94A3B8"
          multiline
          value={note}
          onChangeText={setNote}
        />
      </ScrollView>

      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitDemo}>
          <Text style={styles.submitBtnText}>Submit Demo Request</Text>
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

  teacherBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  teacherSub: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B" },
  freeBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  freeText: { fontSize: 10, fontFamily: fonts.bold, color: "#059669" },

  sectionTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 10 },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  optionCardSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  childAvatar: { width: 36, height: 36, borderRadius: 18 },
  childName: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  childGrade: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B" },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  chipActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  chipText: { fontSize: 12, fontFamily: fonts.medium, color: "#64748B" },
  chipTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  slotRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  slotText: { fontSize: 13, fontFamily: fonts.medium, color: "#0D1B2A" },

  addrCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  addrLabel: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A" },
  addrFull: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },

  noteInput: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, height: 80, textAlignVertical: "top", fontSize: 13, fontFamily: fonts.regular, color: "#0D1B2A" },

  footerBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  submitBtn: { backgroundColor: "#E8A838", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#0D1B2A", fontSize: 15, fontFamily: fonts.bold },
});
