import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useUserStore } from "../../src/store/userStore";

const GRADE_OPTIONS = [
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10 (CBSE)",
  "Class 10 (ICSE)",
  "Class 11",
  "Class 12",
  "JEE Prep",
  "NEET Prep",
];

const SUBJECT_LIST = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "Computer Science",
  "French",
  "Social Studies",
];

export default function AddChildScreen() {
  const { addChild } = useUserStore();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("2012-08-15");
  const [grade, setGrade] = useState("Class 9");
  const [school, setSchool] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Mathematics"]);
  const [goals, setGoals] = useState("");
  const [preferredFormat, setPreferredFormat] = useState<"online" | "in-person" | "both">("both");

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter the child's full name.");
      return;
    }

    addChild({
      name: name.trim(),
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
      dob,
      grade,
      school: school.trim() || "School",
      subjects: selectedSubjects,
      learningGoals: goals.trim() || "Excel in academics",
      preferredFormat,
    });

    Alert.alert("Child Added!", `${name} has been added to your profile.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Child Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        {/* Child Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Child's Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Aarav Sharma"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Grade Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Grade / Class *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {GRADE_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, grade === g && styles.chipActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* School Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>School Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Delhi Public School, R.K. Puram"
            placeholderTextColor="#94A3B8"
            value={school}
            onChangeText={setSchool}
          />
        </View>

        {/* Preferred Subjects */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subjects Needing Tuition</Text>
          <View style={styles.chipsWrap}>
            {SUBJECT_LIST.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSubject(sub)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {isSelected ? "✓ " : ""}{sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred Learning Format */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Learning Format</Text>
          <View style={styles.formatRow}>
            {[
              { id: "both", label: "Both Formats" },
              { id: "online", label: "💻 Online Video" },
              { id: "in-person", label: "🏠 Home Tuition" },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.formatChip, preferredFormat === f.id && styles.formatChipActive]}
                onPress={() => setPreferredFormat(f.id as any)}
              >
                <Text style={[styles.formatChipText, preferredFormat === f.id && styles.formatChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learning Goals */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Learning Goals & Notes</Text>
          <TextInput
            style={[styles.input, { height: 80, paddingTop: 10 }]}
            placeholder="e.g. Prepare for CBSE Board Exams and build solid fundamentals."
            placeholderTextColor="#94A3B8"
            multiline
            value={goals}
            onChangeText={setGoals}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Add Child Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 8 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: fonts.regular, color: "#0D1B2A" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  chipActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  chipText: { fontSize: 12, fontFamily: fonts.medium, color: "#475569" },
  chipTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  formatRow: { flexDirection: "row", gap: 8 },
  formatChip: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  formatChipActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  formatChipText: { fontSize: 11, fontFamily: fonts.medium, color: "#475569" },
  formatChipTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  saveBtn: { backgroundColor: "#E8A838", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#0D1B2A", fontSize: 15, fontFamily: fonts.bold },
});
