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

const REPORT_REASONS = [
  "Inappropriate behavior",
  "Fraud / payment issue outside platform",
  "Harassment or safety concern",
  "Teacher misrepresentation of qualifications",
  "Unpunctual / Frequent cancellations",
  "Other issue",
];

export default function ReportTeacherScreen() {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert("Missing Details", "Please provide a brief description of the issue.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Teacher / Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      {submitted ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle-sharp" size={64} color="#059669" />
          <Text style={styles.successTitle}>Your report has been submitted.</Text>
          <Text style={styles.successDesc}>
            Our Trust & Safety team will review your report immediately and take appropriate action. You will receive an update via email.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text style={styles.subTitle}>Select Reason for Report</Text>

          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(reason)}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={isSelected ? "#0D1B2A" : "#94A3B8"}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            );
          })}

          <Text style={[styles.subTitle, { marginTop: 20 }]}>Description of Issue *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please provide specific details about what happened..."
            placeholderTextColor="#94A3B8"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Report</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  subTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  reasonRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  reasonText: { fontSize: 14, fontFamily: fonts.medium, color: "#0D1B2A" },

  textArea: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 14, height: 120, textAlignVertical: "top", fontSize: 14, fontFamily: fonts.regular, color: "#0D1B2A" },
  submitBtn: { backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 24 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontFamily: fonts.bold },

  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  successTitle: { fontSize: 20, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 16, textAlign: "center" },
  successDesc: { fontSize: 14, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 22 },
  doneBtn: { marginTop: 24, backgroundColor: "#0D1B2A", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  doneBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: fonts.bold },
});
