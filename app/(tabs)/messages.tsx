import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useChatStore } from "../../src/store/chatStore";
import { useTuitionStore } from "../../src/store/tuitionStore";
import { useTeacherStore } from "../../src/store/teacherStore";

/* ── Design tokens matching progress.tsx & tuition.tsx ── */
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

export default function MessagesScreen() {
  const { threads, setActiveThreadId } = useChatStore();
  const { activeTuitions, demoRequests } = useTuitionStore();
  const { teachers } = useTeacherStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showComposeModal, setShowComposeModal] = useState(false);

  const unreadTotal = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  // Active tutors list for the top story/avatar strip
  const activeTutors = useMemo(() => {
    const list: {
      id: string;
      name: string;
      avatar: string;
      subject: string;
      threadId?: string;
      hasUnread?: boolean;
    }[] = [];

    // From active tuitions
    activeTuitions.forEach((t) => {
      const existingThread = threads.find(
        (th) => th.teacherId === t.teacherId || th.teacherName === t.teacherName
      );
      list.push({
        id: t.teacherId,
        name: t.teacherName,
        avatar: t.teacherAvatar,
        subject: t.subject,
        threadId: existingThread ? existingThread.id : "conv-tch-1",
        hasUnread: existingThread ? existingThread.unreadCount > 0 : false,
      });
    });

    // From existing threads if not already in list
    threads.forEach((th) => {
      if (!list.some((item) => item.name === th.teacherName)) {
        list.push({
          id: th.teacherId,
          name: th.teacherName,
          avatar: th.teacherAvatar,
          subject: th.teacherSubject,
          threadId: th.id,
          hasUnread: th.unreadCount > 0,
        });
      }
    });

    return list;
  }, [activeTuitions, threads]);

  // Filtered threads by search and tab
  const filteredThreads = useMemo(() => {
    let result = threads;

    // Tab filtering
    if (activeTab === "Unread") {
      result = result.filter((t) => t.unreadCount > 0);
    } else if (activeTab === "Active Tuition") {
      result = result.filter((t) =>
        activeTuitions.some(
          (at) =>
            at.teacherId === t.teacherId ||
            at.teacherName.toLowerCase() === t.teacherName.toLowerCase()
        )
      );
    } else if (activeTab === "Demos") {
      result = result.filter((t) =>
        demoRequests.some(
          (dr) =>
            dr.teacherId === t.teacherId ||
            dr.teacherName.toLowerCase() === t.teacherName.toLowerCase()
        )
      );
    }

    // Search filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.teacherName.toLowerCase().includes(q) ||
          t.teacherSubject.toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q) ||
          (t.childName && t.childName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [threads, activeTab, searchQuery, activeTuitions, demoRequests]);

  const tabs = ["All", "Unread", "Active Tuition", "Demos"];

  const handleOpenThread = (threadId: string) => {
    setActiveThreadId(threadId);
    router.push({
      pathname: "/messages/[id]",
      params: { id: threadId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {unreadTotal > 0
              ? `${unreadTotal} new message${unreadTotal > 1 ? "s" : ""} from tutors`
              : "Chat & coordination with home tutors"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => setShowComposeModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={20} color={C.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── SEARCH BAR ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={19} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations or subjects..."
              placeholderTextColor={C.faint}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── ACTIVE TUTORS STORY STRIP (Quick Tap to Chat) ── */}
        {activeTutors.length > 0 && !searchQuery && (
          <View style={styles.activeTutorsSection}>
            <Text style={styles.sectionMicroHeader}>ACTIVE TUTORS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeTutorsList}
            >
              {activeTutors.map((tutor) => (
                <TouchableOpacity
                  key={tutor.id}
                  style={styles.tutorStoryItem}
                  onPress={() => handleOpenThread(tutor.threadId || "conv-tch-1")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.tutorStoryRing,
                      tutor.hasUnread && styles.tutorStoryRingUnread,
                    ]}
                  >
                    <Image
                      source={{ uri: tutor.avatar }}
                      style={styles.tutorStoryAvatar}
                    />
                    <View style={styles.storyOnlineDot} />
                  </View>
                  <Text style={styles.tutorStoryName} numberOfLines={1}>
                    {tutor.name.split(" ")[0]}
                  </Text>
                  <Text style={styles.tutorStorySubject} numberOfLines={1}>
                    {tutor.subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── FILTER TABS ── */}
        <View style={styles.tabsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const count =
                tab === "Unread"
                  ? unreadTotal
                  : tab === "All"
                  ? threads.length
                  : null;

              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                  {count !== null && count > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        isActive && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          isActive && styles.tabBadgeTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── THREADS LIST ── */}
        {filteredThreads.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="chatbubbles-outline"
                size={34}
                color={C.amberDeep}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matching conversations" : "No messages yet"}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? `No chat history found for "${searchQuery}". Check spelling or try a different search.`
                : "When you request a demo or book home tuition, your conversations with verified tutors will appear here."}
            </Text>
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery("")}
                activeOpacity={0.8}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.findTeacherBtn}
                onPress={() => router.push("/(tabs)/find-teacher")}
                activeOpacity={0.85}
              >
                <Text style={styles.findTeacherBtnText}>Find a Teacher</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.threadsWrap}>
            <View style={styles.threadsHeaderRow}>
              <Text style={styles.sectionTitle}>Conversations</Text>
              <Text style={styles.threadsCount}>
                {filteredThreads.length} active
              </Text>
            </View>

            {filteredThreads.map((thread) => {
              const isUnread = thread.unreadCount > 0;
              return (
                <TouchableOpacity
                  key={thread.id}
                  style={[
                    styles.threadCard,
                    softShadow,
                    isUnread && styles.threadCardUnread,
                  ]}
                  onPress={() => handleOpenThread(thread.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.avatarWrap}>
                    <Image
                      source={{ uri: thread.teacherAvatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.threadContent}>
                    <View style={styles.titleRow}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={styles.teacherName} numberOfLines={1}>
                          {thread.teacherName}
                        </Text>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={C.green}
                        />
                      </View>
                      <Text
                        style={[
                          styles.timeText,
                          isUnread && styles.timeTextUnread,
                        ]}
                      >
                        {thread.lastMessageTime}
                      </Text>
                    </View>

                    {/* Subject & Child Badge */}
                    <View style={styles.subjectRow}>
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>
                          {thread.teacherSubject}
                        </Text>
                      </View>
                      {thread.childName && (
                        <Text style={styles.childLabel}>
                          · {thread.childName}
                        </Text>
                      )}
                    </View>

                    {/* Last Message Row */}
                    <View style={styles.lastMessageRow}>
                      <Text
                        style={[
                          styles.lastMessageText,
                          isUnread && styles.lastMessageUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {thread.lastMessage}
                      </Text>
                      {isUnread && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {thread.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── COMPOSE / NEW CHAT MODAL ── */}
      <Modal
        visible={showComposeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowComposeModal(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalSheetTitle}>New Conversation</Text>
            <Text style={styles.modalSheetSub}>
              Select an assigned tutor or recently viewed teacher to start chatting
            </Text>

            <ScrollView
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.composeSectionLabel}>ASSIGNED TUTORS</Text>
              {activeTuitions.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.composeTeacherRow}
                  onPress={() => {
                    setShowComposeModal(false);
                    const existing = threads.find(
                      (th) => th.teacherId === t.teacherId
                    );
                    handleOpenThread(existing ? existing.id : "conv-tch-1");
                  }}
                  activeOpacity={0.75}
                >
                  <Image
                    source={{ uri: t.teacherAvatar }}
                    style={styles.composeAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.composeName}>{t.teacherName}</Text>
                    <Text style={styles.composeSub}>
                      {t.subject} · Assigned Home Tutor
                    </Text>
                  </View>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color={C.amberDeep}
                  />
                </TouchableOpacity>
              ))}

              <Text
                style={[
                  styles.composeSectionLabel,
                  { marginTop: 16, marginBottom: 8 },
                ]}
              >
                NEARBY VERIFIED TEACHERS
              </Text>
              {teachers.slice(0, 3).map((tch) => (
                <TouchableOpacity
                  key={tch.id}
                  style={styles.composeTeacherRow}
                  onPress={() => {
                    setShowComposeModal(false);
                    const existing = threads.find(
                      (th) => th.teacherId === tch.id
                    );
                    handleOpenThread(existing ? existing.id : "conv-tch-1");
                  }}
                  activeOpacity={0.75}
                >
                  <Image
                    source={{ uri: tch.profileImage }}
                    style={styles.composeAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.composeName}>{tch.name}</Text>
                    <Text style={styles.composeSub}>
                      {tch.subjects.join(", ")} · {tch.experienceYears}y exp
                    </Text>
                  </View>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color={C.amberDeep}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowComposeModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
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
    shadowOpacity: 0.05,
    shadowRadius: 14,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
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
  headerTextWrap: {
    flex: 1,
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
  composeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    ...softShadow,
  },

  /* ── Search Bar ── */
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderWidth: 1,
    borderColor: C.line,
    ...softShadow,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: C.ink,
    padding: 0,
  },

  /* ── Active Tutors Story Strip ── */
  activeTutorsSection: {
    marginBottom: 18,
  },
  sectionMicroHeader: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: C.faint,
    letterSpacing: 0.6,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activeTutorsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tutorStoryItem: {
    alignItems: "center",
    width: 62,
  },
  tutorStoryRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.line,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tutorStoryRingUnread: {
    borderColor: C.amber,
  },
  tutorStoryAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  storyOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.surface,
  },
  tutorStoryName: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: C.ink,
    marginTop: 6,
    textAlign: "center",
  },
  tutorStorySubject: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: C.muted,
    textAlign: "center",
  },

  /* ── Filter Tabs ── */
  tabsSection: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: C.muted,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabBadge: {
    backgroundColor: C.track,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: C.amber,
  },
  tabBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  tabBadgeTextActive: {
    color: C.ink,
  },

  /* ── Threads List ── */
  threadsWrap: {
    paddingHorizontal: 20,
  },
  threadsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: C.ink,
    letterSpacing: -0.3,
  },
  threadsCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
  },
  threadCard: {
    flexDirection: "row",
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 14,
  },
  threadCardUnread: {
    borderColor: C.amberLine,
    backgroundColor: "#FFFCF6",
  },
  avatarWrap: {
    position: "relative",
    alignSelf: "flex-start",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.surface,
  },
  threadContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  teacherName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: C.faint,
  },
  timeTextUnread: {
    color: C.amberDeep,
    fontFamily: fonts.bold,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  subjectBadge: {
    backgroundColor: C.amberTint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: C.amberDeep,
  },
  childLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: C.muted,
  },
  lastMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  lastMessageText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: C.muted,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontFamily: fonts.semiBold,
    color: C.ink,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.amber,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: C.ink,
    fontSize: 11,
    fontFamily: fonts.bold,
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.amberTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: C.ink,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: C.muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
    marginBottom: 20,
  },
  findTeacherBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  findTeacherBtnText: {
    color: C.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  clearSearchBtn: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearSearchText: {
    color: C.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
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
  composeSectionLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: C.faint,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  composeTeacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  composeAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  composeName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },
  composeSub: {
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
    marginTop: 16,
  },
  closeModalBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
