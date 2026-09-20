import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  Alert,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";
import { useUserStore } from "../../src/store/userStore";

/* ── Design tokens matching progress.tsx & home.tsx ── */
const C = {
  ink: "#0D1B2A",
  inkSoft: "#1E3A5F",
  amber: "#E8A838",
  amberDeep: "#B7791F",
  amberTint: "#FFF7E6",
  amberLine: "#F6E3B4",
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#E8ECF1",
  track: "#EEF1F5",
  muted: "#64748B",
  faint: "#94A3B8",
  green: "#10B981",
  greenTint: "#ECFDF5",
  red: "#EF4444",
  redTint: "#FEF2F2",
  orange: "#F59E0B",
  orangeTint: "#FEF3C7",
  indigo: "#4F46E5",
  indigoTint: "#EEF2FF",
};

const WEEKDAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

const DISMISS_REASONS = [
  "Teaching pace or style doesn't fit child",
  "Schedule or timing conflict",
  "Want to try another verified tutor",
  "Child has completed exam / syllabus",
  "Budget or financial reasons",
  "Other personal reason",
];

export default function MyTuitionScreen() {
  const { activeTuitions, getLatestInvoiceForChild, dismissTeacher, attendance } =
    useTuitionStore();
  const { children, activeChildId, setActiveChildId } = useUserStore();

  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [selectedTuitionId, setSelectedTuitionId] = useState<string | null>(null);

  const activeChild =
    children.find((c) => c.id === activeChildId) || children[0];

  // Active tuitions for this child (excluding cancelled ones)
  const childTuitions = activeTuitions.filter(
    (t) => t.childId === activeChild.id && t.status !== "CANCELLED"
  );

  // Active or selected tuition
  const currentTuition =
    childTuitions.find((t) => t.id === selectedTuitionId) ||
    childTuitions[0];

  const latestInvoice = getLatestInvoiceForChild(activeChild.id);
  const tuitionAttendance = currentTuition
    ? attendance[currentTuition.id] || []
    : [];
  const latestCompletedLog = tuitionAttendance
    .slice()
    .reverse()
    .find((a) => a.status === "Completed");

  const handleCallTeacher = () => {
    if (!currentTuition) return;
    const phone = currentTuition.teacherPhone || "+91 98112 34567";
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Tutor Contact", `Direct contact number: ${phone}`);
    });
  };

  const handleConfirmDismiss = () => {
    if (!currentTuition || !dismissReason) return;
    dismissTeacher(currentTuition.id);
    setShowDismissModal(false);
    setDismissReason("");
    Alert.alert(
      "Tuition Ended",
      `The home tuition relationship with ${currentTuition.teacherName} has been ended. You can find a new tutor anytime.`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Tuition</Text>
          <Text style={styles.subtitle}>
            {activeChild?.name} · {childTuitions.length > 0 ? `${childTuitions.length} Subject${childTuitions.length > 1 ? "s" : ""} Enrolled` : "No ongoing sessions"}
          </Text>
        </View>

        {/* Child Selector Pill */}
        <TouchableOpacity
          style={styles.childPill}
          onPress={() => setShowChildModal(true)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: activeChild.avatar }} style={styles.childAvatar} />
          <Text style={styles.childPillText}>{activeChild.name}</Text>
          <Ionicons name="chevron-down" size={14} color={C.muted} />
        </TouchableOpacity>
      </View>

      {childTuitions.length === 0 ? (
        /* ── EMPTY STATE (Aligned with progress.tsx) ── */
        <View style={styles.emptyContent}>
          <View style={styles.emptyIcon}>
            <Ionicons name="school-outline" size={36} color={C.amberDeep} />
          </View>
          <Text style={styles.emptyTitle}>No Active Home Tuition</Text>
          <Text style={styles.emptySubtitle}>
            Pair {activeChild.name} with certified, top-rated home tutors for 1-on-1 personalized lessons.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/(tabs)/find-teacher")}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Find a Teacher</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── MULTI-SUBJECT SELECTOR (Cardless Pill Bar) ── */}
          {childTuitions.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectPillsContainer}
              style={styles.subjectPillsScroll}
            >
              {childTuitions.map((t) => {
                const isSelected = t.id === currentTuition.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.subjectPillTab,
                      isSelected && styles.subjectPillTabActive,
                    ]}
                    onPress={() => setSelectedTuitionId(t.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.subjectStatusDot,
                        {
                          backgroundColor:
                            t.status === "ACTIVE" ? C.green : C.orange,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.subjectPillTabText,
                        isSelected && styles.subjectPillTabTextActive,
                      ]}
                    >
                      {t.subject}
                    </Text>
                    <Text
                      style={[
                        styles.subjectPillTabTutor,
                        isSelected && styles.subjectPillTabTutorActive,
                      ]}
                    >
                      ({t.teacherName.split(" ")[0]} Sir)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ── TUTOR SPOTLIGHT (MODERN & CARDLESS) ── */}
          <View style={styles.tutorSpotlight}>
            <View style={styles.tutorTopRow}>
              <View style={styles.tutorAvatarWrap}>
                <Image
                  source={{ uri: currentTuition.teacherAvatar }}
                  style={styles.tutorAvatar}
                />
                <View style={styles.avatarBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={C.green} />
                </View>
              </View>

              <View style={styles.tutorInfo}>
                <View style={styles.tagRow}>
                  <View
                    style={[
                      styles.statusPill,
                      currentTuition.status === "ACTIVE"
                        ? styles.statusPillActive
                        : styles.statusPillPending,
                    ]}
                  >
                    <View
                      style={[
                        styles.pulseDot,
                        {
                          backgroundColor:
                            currentTuition.status === "ACTIVE"
                              ? C.green
                              : C.orange,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            currentTuition.status === "ACTIVE"
                              ? C.green
                              : C.orange,
                        },
                      ]}
                    >
                      {currentTuition.status === "ACTIVE"
                        ? "Active Tuition"
                        : "Cancellation Pending"}
                    </Text>
                  </View>

                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectBadgeText}>
                      {currentTuition.subject}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tutorName}>{currentTuition.teacherName}</Text>
                <Text style={styles.tutorRole}>
                  Verified Home Tutor · {activeChild.grade}
                </Text>
              </View>
            </View>

            {/* Quick Communication Bar */}
            <View style={styles.commActionRow}>
              <TouchableOpacity
                style={styles.primaryCommBtn}
                onPress={() =>
                  router.push({
                    pathname: "/messages/[id]",
                    params: { id: "conv-tch-1" },
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={17}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryCommBtnText}>Chat with Tutor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCommBtn}
                onPress={handleCallTeacher}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={16} color={C.ink} />
                <Text style={styles.secondaryCommBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCommBtn}
                onPress={() =>
                  router.push({
                    pathname: "/teacher/[id]",
                    params: { id: currentTuition.teacherId },
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="person-outline" size={16} color={C.ink} />
                <Text style={styles.secondaryCommBtnText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── UNIFIED METRICS SUMMARY (Inspired by progress.tsx) ── */}
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {latestInvoice?.completedClasses || 10}
                  <Text style={styles.statDenominator}>
                    /{latestInvoice?.totalClassesScheduled || 12}
                  </Text>
                </Text>
                <Text style={styles.statLabel}>Classes this month</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: C.green }]}>98%</Text>
                <Text style={styles.statLabel}>Attendance rate</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  ₹{currentTuition.monthlyFee.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Monthly fee</Text>
              </View>
            </View>

            {/* Next class banner integrated into metric card */}
            <View style={styles.nextClassRow}>
              <View style={styles.nextClassIcon}>
                <Ionicons name="time-outline" size={20} color={C.amberDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextClassTitle}>
                  Next class · {currentTuition.nextClassDate || "Today, 5:00 PM"}
                </Text>
                <Text style={styles.nextClassSub}>
                  {currentTuition.timeSlot} · Home Session
                </Text>
              </View>
              <TouchableOpacity
                style={styles.actionPillBtn}
                onPress={() => router.push("/tuition/attendance")}
                activeOpacity={0.85}
              >
                <Text style={styles.actionPillBtnText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── WEEKLY TIMETABLE STRIP ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <Text style={styles.sectionHelper}>
              {currentTuition.classesPerWeek || 3} sessions / week
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.daysStrip}>
              {WEEKDAYS.map((day) => {
                const isActive = currentTuition.daysSchedule?.some(
                  (d) => d.toLowerCase() === day.full.toLowerCase()
                );
                return (
                  <View
                    key={day.short}
                    style={[
                      styles.dayBox,
                      isActive && styles.dayBoxActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isActive && styles.dayTextActive,
                      ]}
                    >
                      {day.short}
                    </Text>
                    <View
                      style={[
                        styles.dayIndicator,
                        isActive && styles.dayIndicatorActive,
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.scheduleInfoRow}>
              <View style={styles.scheduleInfoItem}>
                <Ionicons name="alarm-outline" size={17} color={C.amberDeep} />
                <Text style={styles.scheduleInfoText}>
                  {currentTuition.timeSlot}
                </Text>
              </View>
              <View style={styles.scheduleInfoItem}>
                <Ionicons name="location-outline" size={17} color={C.muted} />
                <Text style={styles.scheduleInfoText} numberOfLines={1}>
                  {currentTuition.location}
                </Text>
              </View>
            </View>
          </View>

          {/* ── RECENT CLASS LOG PREVIEW ── */}
          {latestCompletedLog && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Lesson Note</Text>
                <TouchableOpacity
                  onPress={() => router.push("/tuition/attendance")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>View all history</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.card, styles.lessonNoteCard]}>
                <View style={styles.lessonNoteHeader}>
                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={C.green}
                    />
                    <Text style={styles.completedBadgeText}>
                      Class Completed
                    </Text>
                  </View>
                  <Text style={styles.lessonDate}>
                    {new Date(latestCompletedLog.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </View>

                {latestCompletedLog.notes ? (
                  <Text style={styles.lessonNotes}>
                    "{latestCompletedLog.notes}"
                  </Text>
                ) : (
                  <Text style={styles.lessonNotesMuted}>
                    1 hour home session completed on syllabus.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ── QUICK ACTIONS HUB (2x2 Clean Grid) ── */}
          <Text style={[styles.sectionTitle, styles.sectionGap]}>
            Tuition Services
          </Text>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridCard, softShadow]}
              onPress={() => router.push("/tuition/attendance")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.gridIconWrap,
                  { backgroundColor: C.indigoTint },
                ]}
              >
                <Ionicons
                  name="calendar-clear-outline"
                  size={22}
                  color={C.indigo}
                />
              </View>
              <Text style={styles.gridTitle}>Attendance Log</Text>
              <Text style={styles.gridSub}>View all dates & leaves</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, softShadow]}
              onPress={() => router.push("/billing")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.gridIconWrap,
                  { backgroundColor: C.greenTint },
                ]}
              >
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color={C.green}
                />
              </View>
              <Text style={styles.gridTitle}>Monthly Bills</Text>
              <Text style={styles.gridSub}>
                {latestInvoice
                  ? `₹${latestInvoice.amount.toLocaleString()} · ${latestInvoice.status}`
                  : "View invoices"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.gridRow, { marginTop: 12 }]}>
            <TouchableOpacity
              style={[styles.gridCard, softShadow]}
              onPress={() => router.push("/(tabs)/progress")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.gridIconWrap,
                  { backgroundColor: C.amberTint },
                ]}
              >
                <Ionicons
                  name="analytics-outline"
                  size={22}
                  color={C.amberDeep}
                />
              </View>
              <Text style={styles.gridTitle}>Academic Progress</Text>
              <Text style={styles.gridSub}>Test scores & topics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, softShadow]}
              onPress={() =>
                router.push({
                  pathname: "/teacher/[id]",
                  params: { id: currentTuition.teacherId },
                })
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.gridIconWrap,
                  { backgroundColor: "#F1F5F9" },
                ]}
              >
                <Ionicons
                  name="ribbon-outline"
                  size={22}
                  color={C.ink}
                />
              </View>
              <Text style={styles.gridTitle}>Tutor Credentials</Text>
              <Text style={styles.gridSub}>Ratings & bio</Text>
            </TouchableOpacity>
          </View>

          {/* ── TUTOR MANAGEMENT OPTIONS ── */}
          <Text style={[styles.sectionTitle, styles.sectionGap]}>
            Tutor Management
          </Text>

          <View style={styles.card}>
            {/* Replace Tutor Option */}
            <TouchableOpacity
              style={styles.mgmtRow}
              onPress={() =>
                router.push({
                  pathname: "/teacher/replace-teacher",
                  params: { subject: currentTuition.subject },
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.mgmtIconWrap,
                  { backgroundColor: C.orangeTint },
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={19}
                  color={C.amberDeep}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mgmtTitle}>Switch / Replace Tutor</Text>
                <Text style={styles.mgmtSub}>
                  Zero fees · 100% Satisfaction Guarantee
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.faint} />
            </TouchableOpacity>

            <View style={styles.mgmtDivider} />

            {/* End / Dismiss Tuition Option */}
            <TouchableOpacity
              style={styles.mgmtRow}
              onPress={() => {
                setSelectedTuitionId(currentTuition.id);
                setShowDismissModal(true);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.mgmtIconWrap,
                  { backgroundColor: C.redTint },
                ]}
              >
                <Ionicons
                  name="person-remove-outline"
                  size={19}
                  color={C.red}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mgmtTitle, { color: C.red }]}>
                  End / Dismiss Tuition
                </Text>
                <Text style={styles.mgmtSub}>
                  Discontinue sessions for {currentTuition.subject}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.faint} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ── CHILD SWITCHER MODAL ── */}
      <Modal
        visible={showChildModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChildModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowChildModal(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalSheetTitle}>Select Child</Text>
            <Text style={styles.modalSheetSub}>
              Switch between enrolled children to view their home tuitions
            </Text>

            <View style={styles.childrenList}>
              {children.map((child) => {
                const isSelected = child.id === activeChild.id;
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childOption,
                      isSelected && styles.childOptionSelected,
                    ]}
                    onPress={() => {
                      setActiveChildId(child.id);
                      setSelectedTuitionId(null);
                      setShowChildModal(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Image
                      source={{ uri: child.avatar }}
                      style={styles.childOptionAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.childOptionName}>{child.name}</Text>
                      <Text style={styles.childOptionGrade}>
                        {child.grade} · {child.school}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={C.amberDeep}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowChildModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── DISMISS TUTOR BOTTOM SHEET MODAL ── */}
      <Modal
        visible={showDismissModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDismissModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDismissModal(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalSheetTitle}>Dismiss Tutor</Text>
            <Text style={styles.modalSheetSub}>
              Are you sure you want to dismiss{" "}
              <Text style={{ fontFamily: fonts.bold, color: C.ink }}>
                {currentTuition?.teacherName}
              </Text>{" "}
              for {activeChild.name}'s {currentTuition?.subject} tuition?
            </Text>

            <Text style={styles.reasonHeader}>Select Reason</Text>
            <ScrollView
              style={{ maxHeight: 220 }}
              showsVerticalScrollIndicator={false}
            >
              {DISMISS_REASONS.map((r) => {
                const isPicked = dismissReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.reasonRow,
                      isPicked && styles.reasonRowSelected,
                    ]}
                    onPress={() => setDismissReason(r)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        isPicked && styles.radioOuterSelected,
                      ]}
                    >
                      {isPicked && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.reasonText}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowDismissModal(false);
                  setDismissReason("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Keep Tutor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDismissBtn,
                  !dismissReason && styles.confirmDismissBtnDisabled,
                ]}
                disabled={!dismissReason}
                onPress={handleConfirmDismiss}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmDismissBtnText}>Confirm Dismiss</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 28 : 12,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: C.muted,
    marginTop: 2,
  },
  childPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: 999,
    ...softShadow,
  },
  childAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  childPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.ink,
  },

  /* ── Multi-Subject Tabs ── */
  subjectPillsScroll: {
    marginHorizontal: -20,
    marginBottom: 14,
  },
  subjectPillsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subjectPillTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
  },
  subjectPillTabActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  subjectStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subjectPillTabText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: C.ink,
  },
  subjectPillTabTextActive: {
    color: "#FFFFFF",
  },
  subjectPillTabTutor: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
  },
  subjectPillTabTutorActive: {
    color: C.faint,
  },

  /* ── Tutor Spotlight (Cardless Hero) ── */
  tutorSpotlight: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...softShadow,
  },
  tutorTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tutorAvatarWrap: {
    position: "relative",
  },
  tutorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: C.amber,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: C.surface,
    borderRadius: 10,
  },
  tutorInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: C.greenTint,
  },
  statusPillPending: {
    backgroundColor: C.orangeTint,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  subjectBadge: {
    backgroundColor: C.amberTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  subjectBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: C.amberDeep,
  },
  tutorName: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: C.ink,
    letterSpacing: -0.3,
  },
  tutorRole: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },

  /* Communication Action Bar */
  commActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  primaryCommBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.ink,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryCommBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  secondaryCommBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.track,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryCommBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.ink,
  },

  /* ── Card (Progress.tsx styling) ── */
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...softShadow,
  },

  /* ── Stats Row ── */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: C.ink,
    letterSpacing: -0.4,
  },
  statDenominator: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.faint,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: C.line,
  },

  /* Next Class Banner inside Card */
  nextClassRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  nextClassIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
  },
  nextClassTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },
  nextClassSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  actionPillBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionPillBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },

  /* ── Section Headers ── */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: C.ink,
    letterSpacing: -0.3,
  },
  sectionHelper: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: C.muted,
  },
  sectionGap: {
    marginTop: 12,
    marginBottom: 12,
  },
  linkText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.amberDeep,
  },

  /* ── Weekly Timetable Strip ── */
  daysStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  dayBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.track,
  },
  dayBoxActive: {
    backgroundColor: C.amberTint,
    borderWidth: 1,
    borderColor: C.amberLine,
  },
  dayText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: C.muted,
  },
  dayTextActive: {
    fontFamily: fonts.bold,
    color: C.amberDeep,
  },
  dayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 4,
  },
  dayIndicatorActive: {
    backgroundColor: C.amberDeep,
  },
  scheduleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  scheduleInfoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleInfoText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.ink,
    flexShrink: 1,
  },

  /* ── Lesson Note Card ── */
  lessonNoteCard: {
    borderLeftWidth: 4,
    borderLeftColor: C.amber,
  },
  lessonNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: C.green,
  },
  lessonDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
  },
  lessonNotes: {
    fontFamily: fonts.medium,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 19,
    color: "#5B4A1F",
  },
  lessonNotesMuted: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: C.muted,
  },

  /* ── 2x2 Services Grid ── */
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
  },
  gridIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gridTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },
  gridSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  /* ── Tutor Management Section ── */
  mgmtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  mgmtIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mgmtTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },
  mgmtSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  mgmtDivider: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 14,
  },

  /* ── Empty State ── */
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: C.ink,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: C.ink,
  },

  /* ── Modals & Sheets ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(13, 27, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
    ...softShadow,
  },
  modalHandle: {
    width: 38,
    height: 4,
    backgroundColor: C.line,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: C.ink,
  },
  modalSheetSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  childrenList: {
    gap: 10,
    marginBottom: 16,
  },
  childOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  childOptionSelected: {
    borderColor: C.amber,
    backgroundColor: C.amberTint,
  },
  childOptionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  childOptionName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: C.ink,
  },
  childOptionGrade: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  closeModalBtn: {
    backgroundColor: C.ink,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  closeModalBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  /* Reason selection in dismiss modal */
  reasonHeader: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: C.ink,
    marginBottom: 10,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 8,
  },
  reasonRowSelected: {
    borderColor: C.ink,
    backgroundColor: "#F8FAFC",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.faint,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: C.ink,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.ink,
  },
  reasonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: C.ink,
    flex: 1,
  },
  modalActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.muted,
  },
  confirmDismissBtn: {
    flex: 1.2,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.red,
    alignItems: "center",
  },
  confirmDismissBtnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  confirmDismissBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
