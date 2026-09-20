import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appColors, fonts } from "../../src/theme/colors";
import { useBookingStore, SessionItem } from "../../src/store/bookingStore";
import { useUserStore } from "../../src/store/userStore";

const SEGMENTS = ["Upcoming", "Pending", "Completed", "Cancelled"] as const;

export default function SessionsScreen() {
  const { sessions, replaceTeacherForSubject } = useBookingStore();
  const { children } = useUserStore();

  const [activeSegment, setActiveSegment] =
    useState<(typeof SEGMENTS)[number]>("Upcoming");
  const [selectedLearnerFilter, setSelectedLearnerFilter] =
    useState<string>("all");

  const filteredSessions = sessions.filter((s) => {
    // Segment filter
    let matchSegment = false;
    if (activeSegment === "Upcoming") matchSegment = s.status === "upcoming" || s.status === "in_progress";
    if (activeSegment === "Pending") matchSegment = s.status === "pending";
    if (activeSegment === "Completed") matchSegment = s.status === "completed";
    if (activeSegment === "Cancelled") matchSegment = s.status === "cancelled";

    // Learner filter
    let matchLearner = true;
    if (selectedLearnerFilter !== "all") {
      matchLearner = s.learnerId === selectedLearnerFilter;
    }

    return matchSegment && matchLearner;
  });

  const handleReplaceTeacher = (subject: string) => {
    replaceTeacherForSubject(subject);
    router.push({
      pathname: "/teacher/replace-teacher",
      params: { subject },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Sessions</Text>
          <Text style={styles.headerSub}>Manage your booked learning sessions</Text>
        </View>

        {/* Learner Filter Pill */}
        <View style={styles.filterPillContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <TouchableOpacity
              style={[
                styles.learnerPill,
                selectedLearnerFilter === "all" && styles.learnerPillActive,
              ]}
              onPress={() => setSelectedLearnerFilter("all")}
            >
              <Text
                style={[
                  styles.learnerPillText,
                  selectedLearnerFilter === "all" && styles.learnerPillTextActive,
                ]}
              >
                All Learners
              </Text>
            </TouchableOpacity>

            {children.map((c) => {
              const isSelected = selectedLearnerFilter === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.learnerPill, isSelected && styles.learnerPillActive]}
                  onPress={() => setSelectedLearnerFilter(c.id)}
                >
                  <Text
                    style={[
                      styles.learnerPillText,
                      isSelected && styles.learnerPillTextActive,
                    ]}
                  >
                    {c.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── SEGMENTED CONTROL ── */}
      <View style={styles.segmentContainer}>
        {SEGMENTS.map((seg) => {
          const isActive = activeSegment === seg;
          return (
            <TouchableOpacity
              key={seg}
              style={[styles.segmentTab, isActive && styles.segmentTabActive]}
              onPress={() => setActiveSegment(seg)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {seg}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── SESSIONS LIST ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
      >
        {filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No {activeSegment.toLowerCase()} sessions</Text>
            <Text style={styles.emptySub}>
              You have no {activeSegment.toLowerCase()} sessions scheduled right now.
            </Text>
            <TouchableOpacity
              style={styles.bookNewBtn}
              onPress={() => router.push("/(tabs)/find-teacher")}
            >
              <Text style={styles.bookNewText}>Find a Teacher & Book</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              {/* Card Header: Subject & Status */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectBadgeText}>{session.subject}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    session.status === "upcoming" && styles.statusUpcoming,
                    session.status === "pending" && styles.statusPending,
                    session.status === "completed" && styles.statusCompleted,
                    session.status === "cancelled" && styles.statusCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      session.status === "upcoming" && { color: "#0D1B2A" },
                      session.status === "pending" && { color: "#D97706" },
                      session.status === "completed" && { color: "#059669" },
                      session.status === "cancelled" && { color: "#DC2626" },
                    ]}
                  >
                    {session.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Teacher Info Row */}
              <View style={styles.teacherRow}>
                <Image
                  source={{ uri: session.teacherAvatar }}
                  style={styles.teacherAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.teacherName}>{session.teacherName}</Text>
                  <Text style={styles.learnerTag}>For: {session.learnerName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.messageBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/messages/[id]",
                      params: { id: "conv-tch-1" },
                    })
                  }
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#0D1B2A" />
                </TouchableOpacity>
              </View>

              {/* Schedule Details */}
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#64748B" />
                  <Text style={styles.detailText}>{session.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.detailText}>{session.timeSlot}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name={session.format === "online" ? "videocam-outline" : "location-outline"}
                    size={16}
                    color="#64748B"
                  />
                  <Text style={styles.detailText}>
                    {session.format === "online"
                      ? "Online Video Classroom"
                      : session.addressLabel || "Home Tuition"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons based on Status */}
              <View style={styles.actionsRow}>
                {session.status === "upcoming" && (
                  <>
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() =>
                        session.format === "online"
                          ? router.push("/session/classroom")
                          : router.push("/session/in-person")
                      }
                    >
                      <Ionicons name="play-circle" size={18} color="#0D1B2A" />
                      <Text style={styles.primaryActionText}>
                        {session.format === "online" ? "Join Class" : "View ETA & Map"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryActionBtn}
                      onPress={() => router.push("/session/reschedule")}
                    >
                      <Text style={styles.secondaryActionText}>Reschedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerActionBtn}
                      onPress={() => router.push("/session/cancel")}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </>
                )}

                {session.status === "pending" && (
                  <View style={styles.pendingInfoBox}>
                    <Ionicons name="time-outline" size={16} color="#D97706" />
                    <Text style={styles.pendingInfoText}>
                      Waiting for teacher to accept request
                    </Text>
                  </View>
                )}

                {session.status === "completed" && (
                  <>
                    <TouchableOpacity
                      style={styles.rateBtn}
                      onPress={() => router.push("/rate-session")}
                    >
                      <Ionicons name="star-outline" size={16} color="#0D1B2A" />
                      <Text style={styles.rateBtnText}>
                        {session.rating ? `Reviewed (${session.rating}★)` : "Leave Review"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.replaceTeacherBtn}
                      onPress={() => handleReplaceTeacher(session.subject)}
                    >
                      <Ionicons name="swap-horizontal" size={14} color="#D97706" />
                      <Text style={styles.replaceTeacherText}>Replace Tutor</Text>
                    </TouchableOpacity>
                  </>
                )}

                {session.status === "cancelled" && (
                  <TouchableOpacity
                    style={styles.rebookBtn}
                    onPress={() => router.push("/(tabs)/find-teacher")}
                  >
                    <Text style={styles.rebookText}>Rebook Teacher</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontFamily: fonts.bold, color: "#0D1B2A" },
  headerSub: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  filterPillContainer: { marginTop: 12 },
  learnerPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  learnerPillActive: { backgroundColor: "#0D1B2A", borderColor: "#0D1B2A" },
  learnerPillText: { fontSize: 11, fontFamily: fonts.medium, color: "#64748B" },
  learnerPillTextActive: { color: "#FFFFFF", fontFamily: fonts.bold },

  // Segmented Control
  segmentContainer: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 12, padding: 3, marginHorizontal: 20, marginBottom: 16 },
  segmentTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  segmentTabActive: { backgroundColor: "#FFFFFF", elevation: 2 },
  segmentText: { fontSize: 12, fontFamily: fonts.medium, color: "#64748B" },
  segmentTextActive: { color: "#0D1B2A", fontFamily: fonts.bold },

  // Session Card
  sessionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  subjectBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subjectBadgeText: { fontSize: 11, fontFamily: fonts.bold, color: "#4F46E5" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusUpcoming: { backgroundColor: "#E8A838" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusCompleted: { backgroundColor: "#ECFDF5" },
  statusCancelled: { backgroundColor: "#FEE2E2" },
  statusBadgeText: { fontSize: 10, fontFamily: fonts.bold },

  teacherRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  teacherAvatar: { width: 44, height: 44, borderRadius: 22 },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  learnerTag: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 1 },
  messageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },

  detailsBox: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 12, gap: 8, marginBottom: 14 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 12, fontFamily: fonts.medium, color: "#334155" },

  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  primaryActionBtn: { flex: 2, backgroundColor: "#E8A838", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  primaryActionText: { color: "#0D1B2A", fontSize: 13, fontFamily: fonts.bold },
  secondaryActionBtn: { flex: 1, backgroundColor: "#F1F5F9", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  secondaryActionText: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },
  dangerActionBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },

  pendingInfoBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF3C7", padding: 10, borderRadius: 10 },
  pendingInfoText: { fontSize: 12, fontFamily: fonts.medium, color: "#92400E" },

  rateBtn: { flex: 1, backgroundColor: "#F1F5F9", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  rateBtnText: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },
  replaceTeacherBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  replaceTeacherText: { fontSize: 11, fontFamily: fonts.bold, color: "#92400E" },
  rebookBtn: { flex: 1, backgroundColor: "#0D1B2A", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  rebookText: { color: "#FFFFFF", fontSize: 12, fontFamily: fonts.bold },

  // Empty State
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", marginTop: 4 },
  bookNewBtn: { marginTop: 16, backgroundColor: "#0D1B2A", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  bookNewText: { color: "#FFFFFF", fontSize: 13, fontFamily: fonts.bold },
});
