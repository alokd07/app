import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../src/services/api";
import { API_CONFIG } from "../src/config/api";
import { appColors, fonts } from "../src/theme/colors";

export default function RateSessionScreen() {
  const insets = useSafeAreaInsets();
  const { appointmentId, teacherId, teacherName, subject } = useLocalSearchParams<{
    appointmentId: string;
    teacherId: string;
    teacherName: string;
    subject: string;
  }>();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      Alert.alert("Rating required", "Please select at least 1 star.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.SUBMIT_RATING, {
        appointmentId,
        teacherId,
        rating,
        comment,
      });

      if (res.data?.success) {
        Alert.alert(
          "Thank You! 🎉",
          "Your review has been submitted successfully.",
          [
            {
              text: "Done",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Error", res.data?.message || "Failed to submit rating.");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Something went wrong while submitting your rating."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        >
          <View style={styles.teacherBox}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitial}>{teacherName?.[0] || "T"}</Text>
            </View>
            <Text style={styles.teacherName}>{teacherName || "Teacher"}</Text>
            <Text style={styles.subjectText}>{subject || "Class Session"}</Text>
          </View>

          {/* Star Selector */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How was your class?</Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color={star <= rating ? "#E8A838" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabelText}>
              {rating === 5 && "⭐ Excellent"}
              {rating === 4 && "👍 Very Good"}
              {rating === 3 && "👌 Good"}
              {rating === 2 && "😐 Fair"}
              {rating === 1 && "👎 Needs Improvement"}
            </Text>
          </View>

          {/* Feedback Text Input */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Write a Review (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Share what you liked about the teaching style, explanation, or patience..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#E8A838", "#C47F0A"]}
              style={styles.submitGrad}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Submit Review</Text>
                  <Ionicons name="checkmark-sharp" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#111827" },
  teacherBox: { alignItems: "center", marginVertical: 16 },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitial: { color: "#fff", fontSize: 24, fontFamily: fonts.bold },
  teacherName: { fontSize: 18, fontFamily: fonts.bold, color: "#111827" },
  subjectText: { fontSize: 13, fontFamily: fonts.regular, color: "#6B7280", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#111827", marginBottom: 14 },
  starRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabelText: { textAlign: "center", fontSize: 14, fontFamily: fonts.semiBold, color: "#4F46E5", marginTop: 4 },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#111827",
    minHeight: 100,
  },
  submitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  submitGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  submitText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
});
