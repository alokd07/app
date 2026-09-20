import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Pressable,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../../src/theme/colors";
import { useUserStore } from "../../src/store/userStore";
import { useTeacherStore } from "../../src/store/teacherStore";
import { useTuitionStore } from "../../src/store/tuitionStore";

/* ── Design tokens ── */
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
  text: "#0D1B2A",
  muted: "#64748B",
  faint: "#94A3B8",
  green: "#10B981",
};

const SUBJECTS = [
  { name: "Mathematics", icon: "📐" },
  { name: "Science", icon: "🔬" },
  { name: "Physics", icon: "🔭" },
  { name: "Chemistry", icon: "⚗️" },
  { name: "English", icon: "📖" },
  { name: "Computer Science", icon: "🖥️" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function HomeDashboardScreen() {
  const { user, children, activeChildId, setActiveChildId } = useUserStore();
  const { teachers, setSearchQuery } = useTeacherStore();
  const {
    getActiveTuitionForChild,
    getDemoRequestForChild,
    getLatestInvoiceForChild,
    updateDemoStatus,
  } = useTuitionStore();

  const [showChildModal, setShowChildModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const activeChild =
    children.find((c) => c.id === activeChildId) || children[0];
  const activeTuition = getActiveTuitionForChild(activeChild.id);
  const activeDemo = getDemoRequestForChild(activeChild.id);
  const latestInvoice = getLatestInvoiceForChild(activeChild.id);

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      router.push("/(tabs)/find-teacher");
    }
  };

  const handleSubjectQuickPick = (subject: string) => {
    setSearchQuery(subject);
    router.push("/(tabs)/find-teacher");
  };

  const PulseDot = ({ color }: { color: string }) => (
    <View style={styles.pulseWrap}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            backgroundColor: color,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <View style={[styles.pulseCore, { backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        bounces={false}
      >
        {/* ── HEADER ── */}
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.parentName}>{user.name.split(" ")[0]}</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/notifications")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={C.ink}
                />
                <View style={styles.notifDot} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.parentAvatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Child switcher */}
          <TouchableOpacity
            style={styles.childPill}
            onPress={() => setShowChildModal(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: activeChild.avatar }}
              style={styles.childAvatar}
            />
            <Text style={styles.childNameText}>{activeChild.name}</Text>
            <View style={styles.childDivider} />
            <Text style={styles.gradeText}>{activeChild.grade}</Text>
            <Ionicons name="chevron-down" size={14} color={C.muted} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.contentContainer}>
          {/* ── PAYMENT DUE ── */}
          {latestInvoice && latestInvoice.status === "DUE" && (
            <View style={styles.paymentAlert}>
              <View style={styles.alertIconWrap}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={C.amberDeep}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Tuition fee due</Text>
                <Text style={styles.alertSub} numberOfLines={1}>
                  ₹{latestInvoice.amount} · {latestInvoice.subject}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() =>
                  router.push({
                    pathname: "/billing/[id]",
                    params: { id: latestInvoice.id },
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payNowText}>Pay now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── PRIMARY STATE CARD ── */}
          {activeTuition && activeTuition.status === "ACTIVE" ? (
            <View style={styles.section}>
              <LinearGradient
                colors={[C.ink, C.inkSoft]}
                style={styles.heroCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tuitionHeader}>
                  <Text style={styles.tuitionSubject}>
                    {activeTuition.subject}
                  </Text>
                  <View style={styles.statusPill}>
                    <PulseDot color={C.green} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>

                <View style={styles.teacherRow}>
                  <Image
                    source={{ uri: activeTuition.teacherAvatar }}
                    style={styles.teacherAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teacherName} numberOfLines={1}>
                      {activeTuition.teacherName}
                    </Text>
                    <View style={styles.scheduleRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={C.faint}
                      />
                      <Text style={styles.scheduleText}>
                        {activeTuition.daysSchedule.join(" • ")}
                      </Text>
                    </View>
                    <View style={styles.scheduleRow}>
                      <Ionicons name="time-outline" size={14} color={C.faint} />
                      <Text style={styles.scheduleText}>
                        {activeTuition.timeSlot}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.tuitionFooter}>
                  <View>
                    <Text style={styles.feeLabel}>Monthly fee</Text>
                    <Text style={styles.feeVal}>
                      ₹{activeTuition.monthlyFee}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.ghostBtn}
                      onPress={() => {}}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.ghostBtnText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.amberBtn}
                      onPress={() => router.push("/(tabs)/tuition")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.amberBtnText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : activeDemo && activeDemo.status === "DEMO_COMPLETED" ? (
            <View style={styles.section}>
              <View style={styles.card}>
                <View style={styles.cardHeadRow}>
                  <View style={styles.checkWrap}>
                    <Ionicons name="checkmark" size={16} color={C.green} />
                  </View>
                  <Text style={styles.cardTitle}>Demo completed</Text>
                </View>

                <Text style={styles.cardBody}>
                  How was the {activeDemo.subject} demo with{" "}
                  {activeDemo.teacherName}?
                </Text>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/demo/assign-teacher",
                      params: { demoId: activeDemo.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    Assign as permanent tutor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.textBtn}
                  onPress={() =>
                    updateDemoStatus(activeDemo.id, "NOT_INTERESTED")
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.textBtnText}>
                    Look for other teachers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : activeDemo && activeDemo.status === "DEMO_REQUESTED" ? (
            <View style={styles.section}>
              <View style={[styles.card, styles.pendingCard]}>
                <View style={styles.pendingIconWrap}>
                  <Ionicons name="time-outline" size={22} color={C.amberDeep} />
                  <View style={styles.pendingDot}>
                    <PulseDot color={C.amber} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Demo request sent</Text>
                  <Text style={styles.pendingSub}>
                    Waiting for {activeDemo.teacherName} to accept. Usually
                    replies within 2 hours.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <LinearGradient
                colors={[C.ink, C.inkSoft]}
                style={styles.heroCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.bannerTitle}>
                  Find the right teacher, at home
                </Text>
                <Text style={styles.bannerSub}>
                  Verified tutors near you. Try a free demo class before you
                  commit.
                </Text>

                <TouchableOpacity
                  style={styles.findCtaBtn}
                  onPress={() => router.push("/(tabs)/find-teacher")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.findCtaText}>Find teachers near me</Text>
                  <Ionicons name="arrow-forward" size={16} color={C.ink} />
                </TouchableOpacity>

                <View style={styles.trustRow}>
                  {["Verified teachers", "Free demo", "Monthly billing"].map(
                    (t) => (
                      <View key={t} style={styles.trustItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={C.amber}
                        />
                        <Text style={styles.trustText}>{t}</Text>
                      </View>
                    ),
                  )}
                </View>
              </LinearGradient>
            </View>
          )}

          {/* ── BELOW THE FOLD ── */}
          {!activeTuition ? (
            <>
              {/* Search */}
              <View style={styles.section}>
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={20} color={C.muted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search subject (Maths, Science...)"
                    placeholderTextColor={C.faint}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                  />
                </View>
              </View>

              {/* Subjects */}
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, styles.sectionPad]}>
                  Explore subjects
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subjectsRow}
                >
                  {SUBJECTS.map((sub) => (
                    <TouchableOpacity
                      key={sub.name}
                      style={styles.subjectChip}
                      onPress={() => handleSubjectQuickPick(sub.name)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.subjectIcon}>{sub.icon}</Text>
                      <Text style={styles.subjectName}>{sub.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Teachers */}
              <View style={styles.sectionBlock}>
                <View style={[styles.sectionHeader, styles.sectionPad]}>
                  <Text style={styles.sectionTitle}>Nearby home tutors</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/find-teacher")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.teachersRow}
                  decelerationRate="fast"
                  snapToInterval={196}
                >
                  {teachers.map((tch) => (
                    <TouchableOpacity
                      key={tch.id}
                      style={styles.teacherCard}
                      onPress={() =>
                        router.push({
                          pathname: "/teacher/[id]",
                          params: { id: tch.id },
                        })
                      }
                      activeOpacity={0.92}
                    >
                      <View>
                        <Image
                          source={{ uri: tch.profileImage }}
                          style={styles.cardAvatar}
                        />
                        <View style={styles.ratingChip}>
                          <Ionicons name="star" size={11} color={C.amber} />
                          <Text style={styles.ratingChipText}>
                            {tch.rating}
                          </Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={C.green}
                          />
                        </View>
                      </View>

                      <View style={styles.cardContent}>
                        <Text style={styles.cardName} numberOfLines={1}>
                          {tch.name}
                        </Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          {tch.subjects.slice(0, 2).join(", ")} ·{" "}
                          {tch.distanceKm} km
                        </Text>

                        <View style={styles.cardPriceRow}>
                          <Text style={styles.hourlyText}>
                            ₹{tch.hourlyRate}
                            <Text style={styles.hrSuffix}>/hr</Text>
                          </Text>
                          <TouchableOpacity
                            style={styles.demoBtn}
                            onPress={() =>
                              router.push({
                                pathname: "/teacher/[id]",
                                params: { id: tch.id },
                              })
                            }
                            activeOpacity={0.85}
                          >
                            <Text style={styles.demoBtnText}>Free demo</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : (
            <View style={styles.section}>
              <View style={styles.quickLinksCard}>
                {[
                  {
                    label: "Progress",
                    icon: "bar-chart-outline",
                    color: "#4F46E5",
                    bg: "#EEF2FF",
                    route: "/(tabs)/progress",
                  },
                  {
                    label: "Bills",
                    icon: "receipt-outline",
                    color: "#059669",
                    bg: "#ECFDF5",
                    route: "/billing",
                  },
                  {
                    label: "Tuition",
                    icon: "layers-outline",
                    color: "#D97706",
                    bg: "#FEF3C7",
                    route: "/(tabs)/tuition",
                  },
                  {
                    label: "Message",
                    icon: "chatbubble-outline",
                    color: "#0284C7",
                    bg: "#F0F9FF",
                    route: "/(tabs)/messages",
                  },
                ].map((q) => (
                  <TouchableOpacity
                    key={q.label}
                    style={styles.quickLink}
                    onPress={() => router.push(q.route as any)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.quickLinkIcon, { backgroundColor: q.bg }]}
                    >
                      <Ionicons
                        name={q.icon as any}
                        size={20}
                        color={q.color}
                      />
                    </View>
                    <Text style={styles.quickLinkLabel}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── CHILD SELECTOR MODAL ── */}
      <Modal visible={showChildModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowChildModal(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Switch child</Text>

            {children.map((child) => {
              const isSelected = child.id === activeChildId;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childOption,
                    isSelected && styles.childOptionActive,
                  ]}
                  onPress={() => {
                    setActiveChildId(child.id);
                    setShowChildModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: child.avatar }}
                    style={styles.optionAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionName}>{child.name}</Text>
                    <Text style={styles.optionGrade}>
                      {child.grade} · {child.school}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={C.ink} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.addChildOption}
              onPress={() => {
                setShowChildModal(false);
                router.push("/parent/add-child");
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={C.ink} />
              <Text style={styles.addChildText}>Add another child</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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

const heroShadow = Platform.select({
  ios: {
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  android: { elevation: 6 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Header */
  headerSafeArea: { paddingTop: Platform.OS === "android" ? 20 : 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingText: { fontSize: 14, fontFamily: fonts.medium, color: C.muted },
  parentName: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: C.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    ...softShadow,
  },
  notifDot: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  parentAvatar: { width: 44, height: 44, borderRadius: 22 },

  childPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 20,
    gap: 8,
    backgroundColor: C.surface,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    ...softShadow,
  },
  childAvatar: { width: 28, height: 28, borderRadius: 14 },
  childNameText: { fontSize: 14, fontFamily: fonts.bold, color: C.text },
  childDivider: { width: 1, height: 12, backgroundColor: C.line },
  gradeText: { fontSize: 13, fontFamily: fonts.medium, color: C.muted },

  contentContainer: { paddingTop: 20 },

  /* Layout */
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionBlock: { marginBottom: 28 },
  sectionPad: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: C.amberDeep,
    marginBottom: 14,
  },

  /* Payment alert */
  paymentAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.amberTint,
    borderWidth: 1,
    borderColor: C.amberLine,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(232,168,56,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: { fontSize: 15, fontFamily: fonts.bold, color: C.text },
  alertSub: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: C.amberDeep,
    marginTop: 2,
  },
  payNowBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  payNowText: { color: "#FFFFFF", fontSize: 13, fontFamily: fonts.bold },

  /* Hero card (active tuition / find teacher) */
  heroCard: { borderRadius: 24, padding: 22, ...heroShadow },

  tuitionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tuitionSubject: { color: C.faint, fontSize: 13, fontFamily: fonts.semiBold },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { color: "#FFFFFF", fontSize: 12, fontFamily: fonts.semiBold },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  teacherAvatar: { width: 60, height: 60, borderRadius: 30 },
  teacherName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  scheduleText: { fontSize: 13, fontFamily: fonts.medium, color: C.faint },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 20,
    marginBottom: 18,
  },
  tuitionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: C.faint,
    marginBottom: 2,
  },
  feeVal: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  actionRow: { flexDirection: "row", gap: 8 },
  ghostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  ghostBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: fonts.bold },
  amberBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  amberBtnText: { color: C.ink, fontSize: 13, fontFamily: fonts.bold },

  /* Find banner */
  bannerTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
    lineHeight: 32,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  bannerSub: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: C.faint,
    lineHeight: 21,
    marginBottom: 22,
  },
  findCtaBtn: {
    backgroundColor: C.amber,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 20,
  },
  findCtaText: { color: C.ink, fontSize: 15, fontFamily: fonts.bold },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 8,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustText: { fontSize: 12, fontFamily: fonts.medium, color: C.faint },

  /* Generic card (demo states) */
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 20,
    ...softShadow,
  },
  cardHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: C.text,
    letterSpacing: -0.2,
  },
  cardBody: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: C.muted,
    lineHeight: 21,
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: C.ink,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: fonts.bold },
  textBtn: { paddingVertical: 14, alignItems: "center", marginBottom: -6 },
  textBtnText: { color: C.muted, fontSize: 14, fontFamily: fonts.semiBold },

  /* Pending */
  pendingCard: { flexDirection: "row", alignItems: "center", gap: 16 },
  pendingIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingDot: { position: "absolute", top: 6, right: 6 },
  pendingSub: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: C.muted,
    lineHeight: 19,
    marginTop: 3,
  },

  /* Pulse */
  pulseWrap: {
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: { position: "absolute", width: 8, height: 8, borderRadius: 4 },
  pulseCore: { width: 8, height: 8, borderRadius: 4 },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: C.text,
  },

  /* Subjects */
  subjectsRow: { gap: 10, paddingHorizontal: 20 },
  subjectChip: {
    backgroundColor: C.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
  },
  subjectIcon: { fontSize: 15 },
  subjectName: { fontSize: 14, fontFamily: fonts.semiBold, color: C.text },

  /* Teachers */
  teachersRow: { gap: 16, paddingHorizontal: 20, paddingBottom: 12 },
  teacherCard: {
    width: 180,
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 10,
    ...softShadow,
  },
  cardAvatar: {
    width: "100%",
    height: 140,
    borderRadius: 16,
    backgroundColor: C.line,
  },
  ratingChip: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13,27,42,0.82)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ratingChipText: { color: "#FFFFFF", fontSize: 11, fontFamily: fonts.bold },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 1,
  },
  cardContent: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 2 },
  cardName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: C.text,
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: C.muted,
    marginTop: 3,
  },
  cardPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  hourlyText: { fontSize: 15, fontFamily: fonts.bold, color: C.text },
  hrSuffix: { fontSize: 11, fontFamily: fonts.medium, color: C.muted },
  demoBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  demoBtnText: { fontSize: 11, fontFamily: fonts.bold, color: "#FFFFFF" },

  /* Quick links */
  quickLinksCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: C.surface,
    borderRadius: 22,
    paddingVertical: 18,
    ...softShadow,
  },
  quickLink: { alignItems: "center", gap: 8, flex: 1 },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#475569",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,27,42,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.line,
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  childOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 10,
  },
  childOptionActive: { borderColor: C.amber, backgroundColor: C.amberTint },
  optionAvatar: { width: 46, height: 46, borderRadius: 23 },
  optionName: { fontSize: 16, fontFamily: fonts.bold, color: C.text },
  optionGrade: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: C.muted,
    marginTop: 3,
  },
  addChildOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 15,
    marginTop: 4,
    backgroundColor: C.bg,
    borderRadius: 16,
  },
  addChildText: { fontSize: 15, fontFamily: fonts.bold, color: C.text },
});
