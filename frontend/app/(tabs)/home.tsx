import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { Teacher } from "../../src/types";
import { debounce, formatCurrency } from "../../src/utils/helpers";
import { getUserData } from "../../src/services/auth";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.10)",
  goldBorder: "rgba(232,168,56,0.25)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#E4EAF2",
  inputBg: "#F4F7FB",
  success: "#27AE60",
  error: "#E05252",
  warning: "#E8A838",
};

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Streak Day ───────────────────────────────────────────────────────────────
function StreakDay({
  day,
  active,
  index,
}: {
  day: string;
  active: boolean;
  index: number;
}) {
  const scale = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: index * 60,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[styles.streakDay, { transform: [{ scale }] }]}>
      <LinearGradient
        colors={active ? [palette.gold, "#D4922A"] : ["#1E3248", "#1A2D42"]}
        style={styles.streakCircle}
      >
        <Text style={styles.streakEmoji}>{active ? "🔥" : "○"}</Text>
      </LinearGradient>
      <Text style={[styles.streakLabel, active && styles.streakLabelActive]}>
        {day}
      </Text>
    </Animated.View>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillIcon}>{icon}</Text>
      <View>
        <Text style={styles.statPillValue}>{value}</Text>
        <Text style={styles.statPillLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 800,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);
  const w = width.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[styles.barFill, { width: w, backgroundColor: color }]}
      />
    </View>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────
function TeacherCard({ item, index }: { item: Teacher; index: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/teacher/${item._id}`)}
        activeOpacity={0.88}
      >
        <Image
          source={{
            uri: item.profileImage || "https://via.placeholder.com/150",
          }}
          style={styles.cardImage}
        />
        {/* Rating badge on image */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={palette.gold} />
          <Text style={styles.ratingBadgeText}>{item.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.cardBody}>
          {/* Subject tag */}
          <View style={styles.subjectTag}>
            <Text style={styles.subjectTagText}>Tutor</Text>
          </View>

          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <Ionicons name="people-outline" size={11} color={palette.muted} />
              <Text style={styles.cardStatText}>
                {item.totalReviews} students
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("1W");
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
    fetchTeachers();
  }, []);

  const loadUser = async () => {
    const userData = await getUserData();
    setUser(userData);
  };

  const fetchTeachers = async (pageNum = 1, search = "") => {
    if (loading) return;
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (search) params.subject = search;
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHERS, {
        params,
      });
      if (response.data.data) {
        const data = response.data.data.data || response.data.data;
        setTeachers(pageNum === 1 ? data : (prev) => [...prev, ...data]);
        setHasMore(pageNum < response.data.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setPage(1);
      fetchTeachers(1, q);
    }, 400),
    [],
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      fetchTeachers(next, searchQuery);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTeachers(1, searchQuery);
  };

  // Sticky header opacity
  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ["rgba(13,27,42,0)", "rgba(13,27,42,1)"],
    extrapolate: "clamp",
  });

  const renderHeader = () => (
    <View>
      {/* ── Hero Banner ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid, palette.navyLight]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.accentLine} />

        {/* Top bar */}
        <SafeAreaView edges={["top"]}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{user?.name || "Student"}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={palette.white}
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Quick stats row */}
        <View style={styles.heroStats}>
          <StatPill icon="🔥" value="4" label="Day Streak" />
          <View style={styles.statDivider} />
          <StatPill icon="📚" value="8" label="Courses" />
          <View style={styles.statDivider} />
          <StatPill icon="🏆" value="6" label="Certs" />
        </View>

        <View style={styles.heroCurve} />
      </LinearGradient>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* ── Streak Card ── */}
        <View style={styles.card2}>
          <View style={styles.card2Header}>
            <View>
              <Text style={styles.card2Title}>Daily Streak</Text>
              <Text style={styles.card2Sub}>4 days in a row 🎯</Text>
            </View>
            <TouchableOpacity style={styles.rewardBtn}>
              <LinearGradient
                colors={[palette.gold, "#D4922A"]}
                style={styles.rewardGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.rewardText}>Get Reward</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.streakRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <StreakDay key={d} day={d} active={i < 4} index={i} />
            ))}
          </View>
        </View>

        {/* ── Learning Progress ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learning Progress</Text>
            <View style={styles.tabRow}>
              {["1W", "1M", "3M"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={[
                    styles.tabBtn,
                    activeTab === t && styles.tabBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === t && styles.tabTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.progressCard}>
            {/* Mini chart bars */}
            <View style={styles.chartRow}>
              {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                <View key={i} style={styles.chartBarWrap}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: h * 0.6,
                        backgroundColor:
                          i === 5 ? palette.gold : "rgba(232,168,56,0.25)",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Progress items */}
            <View style={styles.progressItems}>
              <View style={styles.progressItem}>
                <View style={styles.progressItemLeft}>
                  <View
                    style={[
                      styles.progressDot,
                      { backgroundColor: palette.gold },
                    ]}
                  />
                  <Text style={styles.progressItemLabel}>
                    Course certificates
                  </Text>
                </View>
                <Text style={styles.progressItemValue}>6 / 15</Text>
              </View>
              <ProgressBar pct={6 / 15} color={palette.gold} />

              <View style={[styles.progressItem, { marginTop: 12 }]}>
                <View style={styles.progressItemLeft}>
                  <View
                    style={[styles.progressDot, { backgroundColor: "#4DA6FF" }]}
                  />
                  <Text style={styles.progressItemLabel}>
                    Completed courses
                  </Text>
                </View>
                <Text style={styles.progressItemValue}>8 / 15</Text>
              </View>
              <ProgressBar pct={8 / 15} color="#4DA6FF" />
            </View>

            {/* Stat chips */}
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Ionicons name="time-outline" size={13} color={palette.gold} />
                <Text style={styles.chipText}>4h 10m</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons
                  name="school-outline"
                  size={13}
                  color={palette.gold}
                />
                <Text style={styles.chipText}>35 Exams</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons
                  name="ribbon-outline"
                  size={13}
                  color={palette.gold}
                />
                <Text style={styles.chipText}>6 Certs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find Teachers</Text>
          <View
            style={[
              styles.searchBox,
              searchQuery.length > 0 && styles.searchBoxActive,
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={searchQuery ? palette.gold : palette.muted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by subject or name…"
              placeholderTextColor={palette.muted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── Section label ── */}
        <View style={styles.recRow}>
          <Text style={styles.sectionTitle}>Recommended Teachers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTeacherCard = ({
    item,
    index,
  }: {
    item: Teacher;
    index: number;
  }) => <TeacherCard item={item} index={index} />;

  const renderEmpty = () => {
    if (loading && page === 1) return null;
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="search-outline" size={36} color={palette.muted} />
        </View>
        <Text style={styles.emptyTitle}>No teachers found</Text>
        <Text style={styles.emptyText}>Try different keywords</Text>
      </View>
    );
  };

  const renderFooter = () =>
    loading && page > 1 ? (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={palette.gold} />
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={teachers}
        renderItem={renderTeacherCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.gold}
            colors={[palette.gold]}
          />
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  listContent: {
    paddingBottom: 32,
  },

  // ── Hero ──
  hero: {
    paddingBottom: 40,
  },
  accentLine: {
    height: 3,
    backgroundColor: palette.gold,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.60)",
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.error,
    borderWidth: 1.5,
    borderColor: palette.navy,
  },
  heroStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statPillIcon: { fontSize: 20 },
  statPillValue: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
  },
  statPillLabel: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.50)",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroCurve: {
    height: 28,
    backgroundColor: palette.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 20,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 16,
    marginTop: -4,
  },

  // ── Streak Card ──
  card2: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  card2Header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  card2Title: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  card2Sub: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    marginTop: 2,
  },
  rewardBtn: {
    borderRadius: 10,
    overflow: "hidden",
  },
  rewardGrad: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakDay: {
    alignItems: "center",
    gap: 5,
  },
  streakCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  streakEmoji: { fontSize: 16 },
  streakLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  streakLabelActive: {
    color: palette.gold,
    fontFamily: "Manrope_700Bold",
  },

  // ── Section ──
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: "row",
    gap: 4,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.border,
  },
  tabBtnActive: {
    backgroundColor: palette.navy,
  },
  tabText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
  },
  tabTextActive: {
    color: palette.white,
  },

  // ── Progress Card ──
  progressCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 54,
    marginBottom: 18,
  },
  chartBarWrap: { flex: 1, justifyContent: "flex-end" },
  chartBar: {
    borderRadius: 4,
    minHeight: 8,
  },
  progressItems: { marginBottom: 16 },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressItemLabel: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: palette.ink,
  },
  progressItemValue: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.border,
    overflow: "hidden",
    marginBottom: 2,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.goldPale,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  chipText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
  },

  // ── Search ──
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBoxActive: {
    borderColor: palette.gold,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: palette.ink,
  },

  // ── Rec row ──
  recRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.gold,
  },

  // ── Teacher Cards grid ──
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 0,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: palette.white,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 130,
    backgroundColor: palette.border,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(13,27,42,0.75)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
  },
  cardBody: {
    padding: 12,
  },
  subjectTag: {
    alignSelf: "flex-start",
    backgroundColor: palette.goldPale,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  subjectTagText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 6,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardStatText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },

  // ── Empty ──
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
  },

  // ── Footer loader ──
  listFooter: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
