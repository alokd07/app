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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { Teacher } from "../../src/types";
import { debounce } from "../../src/utils/helpers";
import { getUserData } from "../../src/services/auth";
import Avatar from "@/components/Avatar";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

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
  successPale: "rgba(39,174,96,0.10)",
  error: "#E05252",
};

// ─── Sample data ──────────────────────────────────────────────────────────────
const promotions = [
  {
    id: "1",
    title: "50% Off Math Tutors",
    subtitle: "Limited time offer on top educators",
    image: "https://images.unsplash.com/photo-1584697964190-7383c4c8c3b7",
    badge: "Limited",
  },
  {
    id: "2",
    title: "Free Trial Classes",
    subtitle: "Try before you enroll",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc",
    badge: "New",
  },
  {
    id: "3",
    title: "Exam Prep Boost",
    subtitle: "Crash courses for upcoming exams",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    badge: "Hot",
  },
];

const sampleTeachers = [
  {
    _id: "t1",
    name: "Ananya Sharma",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.8,
    totalReviews: 120,
    subject: "Mathematics",
    area: "Connaught Place, Delhi",
    experience: 5,
    languages: ["English", "Hindi"],
    availableDays: ["Mon", "Tue", "Wed", "Thu"],
    isAvailableNow: true,
    board: "CBSE",
    teaches: ["Class 9", "Class 10", "Class 11"],
  },
  {
    _id: "t2",
    name: "Rahul Verma",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.6,
    totalReviews: 98,
    subject: "Physics",
    area: "Lajpat Nagar, Delhi",
    experience: 3,
    languages: ["English", "Hindi"],
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    isAvailableNow: false,
    board: "ICSE",
    teaches: ["Class 11", "Class 12"],
  },
  {
    _id: "t3",
    name: "Priya Singh",
    profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4.9,
    totalReviews: 210,
    subject: "English Literature",
    area: "Dwarka, Delhi",
    experience: 8,
    languages: ["English"],
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    isAvailableNow: true,
    board: "CBSE",
    teaches: ["Class 6", "Class 7", "Class 8"],
  },
  {
    _id: "t4",
    name: "Arjun Mehta",
    profileImage: "https://randomuser.me/api/portraits/men/76.jpg",
    rating: 4.5,
    totalReviews: 75,
    subject: "Chemistry",
    area: "Rohini, Delhi",
    experience: 4,
    languages: ["Hindi", "English"],
    availableDays: ["Tue", "Thu", "Sat", "Sun"],
    isAvailableNow: false,
    board: "CBSE",
    teaches: ["Class 11", "Class 12"],
  },
  {
    _id: "t5",
    name: "Neha Gupta",
    profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    rating: 4.7,
    totalReviews: 134,
    subject: "Biology",
    area: "Vasant Kunj, Delhi",
    experience: 6,
    languages: ["English", "Hindi"],
    availableDays: ["Mon", "Wed", "Fri"],
    isAvailableNow: true,
    board: "NEET",
    teaches: ["Class 11", "Class 12"],
  },
  {
    _id: "t6",
    name: "Karan Patel",
    profileImage: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 4.4,
    totalReviews: 60,
    subject: "Computer Science",
    area: "Noida Sector 18",
    experience: 2,
    languages: ["English", "Hindi"],
    availableDays: ["Sat", "Sun"],
    isAvailableNow: true,
    board: "CBSE",
    teaches: ["Class 10", "Class 11", "Class 12"],
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress, gradient }: any) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={gradient || [palette.goldPale, palette.goldPale]}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons name={icon} size={22} color={palette.gold} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Promo Card ───────────────────────────────────────────────────────────────
function PromoCard({ item }: any) {
  return (
    <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.promoImage} />
      <View style={styles.promoOverlay}>
        <Text style={styles.promoTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.promoSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
        <View style={styles.promoFooter}>
          <Text style={styles.promoBadge}>{item.badge}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Streak Item ──────────────────────────────────────────────────────────────
function StreakItem({
  day,
  active,
  isToday,
}: {
  day: string;
  active: boolean;
  isToday: boolean;
}) {
  return (
    <View style={styles.streakItem}>
      <View
        style={[
          styles.streakDot,
          active && styles.streakDotActive,
          isToday && styles.streakDotToday,
        ]}
      >
        {active && <Ionicons name="checkmark" size={10} color={palette.navy} />}
      </View>
      <Text
        style={[
          styles.streakDayText,
          active && styles.streakDayTextActive,
          isToday && styles.streakDayTextToday,
        ]}
      >
        {day}
      </Text>
    </View>
  );
}

// ─── CircularProgress (simplified) ───────────────────────────────────────────
function CircularProgress({
  progress,
  color = palette.gold,
  label,
  sublabel,
}: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);
  return (
    <View style={styles.circularProgress}>
      <View style={styles.circularWrapper}>
        <View style={[styles.circularTrack, { borderColor: palette.border }]} />
        <View
          style={[
            styles.circularFill,
            {
              borderColor: color,
              borderRightColor: "transparent",
              borderBottomColor: progress > 50 ? color : "transparent",
            },
          ]}
        />
        <View style={styles.circularContent}>
          <Text style={styles.circularPercent}>{Math.round(progress)}%</Text>
        </View>
      </View>
      <Text style={styles.circularLabel}>{label}</Text>
      <Text style={styles.circularSublabel}>{sublabel}</Text>
    </View>
  );
}

// ─── TEACHER CARD (fully redesigned) ─────────────────────────────────────────
function TeacherCard({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 75,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: index * 75,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Compact day display: first letter only
  const dayInitials = (item.availableDays || [])
    .map((d: string) => d[0])
    .join(" ");
  const subjectShort =
    item.subject?.length > 12 ? item.subject.slice(0, 11) + "…" : item.subject;

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.teacherCard}
        onPress={() => router.push(`/teacher/${item._id}`)}
        activeOpacity={0.92}
      >
        {/* ── Photo + overlays ── */}
        <View style={styles.cardImageWrap}>
          <Image
            source={{
              uri: item.profileImage || "https://via.placeholder.com/150",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(13,27,42,0.90)"]}
            style={styles.imageGradient}
          />

          {/* Availability badge — top left */}
          <View
            style={[
              styles.availBadge,
              item.isAvailableNow ? styles.availBadgeOn : styles.availBadgeOff,
            ]}
          >
            <View
              style={[
                styles.availDot,
                {
                  backgroundColor: item.isAvailableNow
                    ? palette.success
                    : palette.muted,
                },
              ]}
            />
            <Text style={styles.availText}>
              {item.isAvailableNow ? "Available" : "Busy"}
            </Text>
          </View>

          {/* Rating — top right */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={palette.gold} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>

          {/* Subject pill — bottom left over gradient */}
          <View style={styles.subjectPill}>
            <Ionicons name="book-outline" size={10} color={palette.gold} />
            <Text style={styles.subjectPillText} numberOfLines={1}>
              {subjectShort}
            </Text>
          </View>
        </View>

        {/* ── Card body ── */}
        <View style={styles.cardBody}>
          {/* Name + board */}
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.board && (
              <View style={styles.boardBadge}>
                <Text style={styles.boardText}>{item.board}</Text>
              </View>
            )}
          </View>

          {/* Area */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={12} color={palette.muted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.area}
            </Text>
          </View>

          {/* Experience + languages */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={12} color={palette.muted} />
            <Text style={styles.infoText}>{item.experience} yrs exp</Text>
            <View style={styles.infoDivider} />
            <Ionicons name="language-outline" size={12} color={palette.muted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {(item.languages || []).slice(0, 2).join(", ")}
            </Text>
          </View>

          {/* Classes taught */}
          {item.teaches && item.teaches.length > 0 && (
            <View style={styles.classesRow}>
              {item.teaches.slice(0, 3).map((cls: string) => (
                <View key={cls} style={styles.classPill}>
                  <Text style={styles.classPillText}>{cls}</Text>
                </View>
              ))}
              {item.teaches.length > 3 && (
                <View style={styles.classPill}>
                  <Text style={styles.classPillText}>
                    +{item.teaches.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Days available */}
          <View style={styles.daysRow}>
            <Ionicons name="calendar-outline" size={11} color={palette.muted} />
            <Text style={styles.daysText}>{dayInitials}</Text>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* CTA */}
          <TouchableOpacity
            style={styles.demoBtn}
            activeOpacity={0.85}
            onPress={() => router.push(`/teacher/${item._id}`)}
          >
            <LinearGradient
              colors={[palette.gold, "#D4922A"]}
              style={styles.demoBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.demoBtnText}>Request Demo</Text>
              <Ionicons name="arrow-forward" size={13} color={palette.navy} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>(sampleTeachers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const onEndReachedCalledDuringMomentum = useRef(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const loadingRef = useRef(false);
  const pageRef = useRef(1);

  const FILTERS = ["All", "Math", "Science", "English", "Near Me"];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUserData();
    setUser(userData);
  };

  const fetchTeachers = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      const params: any = { page: pageNum, limit: 10 };
      if (search) params.subject = search;
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHERS, {
        params,
      });
      if (response?.data?.data) {
        const data = response.data.data.data || response.data.data;
        setTeachers((prev) =>
          pageNum === 1
            ? data
            : [
                ...prev,
                ...data.filter((t: any) => !prev.find((p) => p._id === t._id)),
              ],
        );
        setHasMore(pageNum < response.data.data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
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
    if (loadingRef.current || loading || !hasMore || refreshing) return;
    const next = pageRef.current + 1;
    loadingRef.current = true;
    pageRef.current = next;
    setPage(next);
    fetchTeachers(next, searchQuery);
  };
  const handleRefresh = () => {
    setRefreshing(true);
    pageRef.current = 1;
    setPage(1);
    fetchTeachers(1, searchQuery);
  };

  const renderHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      {/* ── Top Nav ── */}
      <View style={{ backgroundColor: palette.cream }}>
        <View style={styles.topNav}>
          <View style={styles.row}>
            <Avatar name={user?.name || "Alok Dubey"} size={42} />
            <View>
              <Text style={styles.greetingLabel}>{getGreeting()}</Text>
              <Text style={styles.userNameNew}>{user?.name || "Alok Dubey"}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={18} color={palette.ink} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={palette.ink}
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Hero Card ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid]}
        style={styles.heroCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.heroTitle}>Ready to learn?</Text>
            <Text style={styles.heroSubtitle}>
              {user?.streak || 4} day streak · {user?.coursesCompleted || 8}{" "}
              courses done
            </Text>
          </View>
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={14} color={palette.navy} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroDecorCircle1} />
        <View style={styles.heroDecorCircle2} />
      </LinearGradient>

      {/* ── Quick Actions ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        <QuickAction
          icon="book-outline"
          label="Courses"
          gradient={[palette.goldPale, palette.goldPale]}
        />
        <QuickAction icon="trophy-outline" label="Achievements" />
        <QuickAction icon="calendar-outline" label="Schedule" />
        <QuickAction icon="chatbubble-outline" label="Messages" />
      </ScrollView>

      {/* ── Progress ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressGrid}>
          <CircularProgress
            progress={40}
            color={palette.gold}
            label="Certificates"
            sublabel="6 of 15"
          />
          <CircularProgress
            progress={53}
            color="#4DA6FF"
            label="Courses"
            sublabel="8 of 15"
          />
          <CircularProgress
            progress={75}
            color={palette.success}
            label="Exams"
            sublabel="35 passed"
          />
        </View>
      </View>

      {/* ── Streak ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Learning Streak</Text>
            <Text style={styles.streakCount}>{user?.streak || 4} days 🔥</Text>
          </View>
          <TouchableOpacity style={styles.claimBtn}>
            <Ionicons name="gift-outline" size={14} color={palette.navy} />
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.streakScroll}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <StreakItem
              key={d}
              day={d}
              active={i < (user?.streak || 4)}
              isToday={i === new Date().getDay() - 1}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Promos ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers & Promotions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.streakScroll}
        >
          {promotions.map((item) => (
            <PromoCard key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>

      {/* ── Search ── */}
      <View style={[styles.section, { marginBottom: 12 }]}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color={searchQuery ? palette.gold : palette.muted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject, area or teacher…"
            placeholderTextColor={palette.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color={palette.muted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Ionicons name="options-outline" size={18} color={palette.gold} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Teachers header + filter chips ── */}
      <View style={styles.teachersHeaderWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Teachers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="people-outline" size={40} color={palette.gold} />
      </View>
      <Text style={styles.emptyTitle}>No teachers found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filters
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => handleSearch("")}
      >
        <Text style={styles.emptyBtnText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () =>
    loading && page > 1 ? (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={palette.gold} />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={teachers}
        renderItem={({ item, index }) => (
          <TeacherCard item={item} index={index} />
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.3}
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
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            handleLoadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={6}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={[palette.gold, palette.goldLight]}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={22} color={palette.navy} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  listContent: { paddingBottom: 100 },

  // ── Header ──
  headerContainer: { backgroundColor: palette.cream },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  greetingLabel: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  userNameNew: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    letterSpacing: -0.4,
  },
  iconBtn: {
    position: "relative",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 50,
    padding: 8,
  },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.success,
    borderWidth: 1.5,
    borderColor: palette.cream,
  },

  // ── Hero Card ──
  heroCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 18,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
  },
  continueBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
  },
  heroDecorCircle1: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: palette.goldPale,
    top: -20,
    right: 60,
    opacity: 0.5,
  },
  heroDecorCircle2: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: palette.goldBorder,
    top: 10,
    right: 10,
    opacity: 0.4,
  },

  // ── Quick Actions ──
  quickActionsScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  quickAction: { width: width * 0.42 },
  quickActionGradient: {
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
    textAlign: "center",
  },

  // ── Section ──
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.gold,
  },
  streakCount: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
    marginTop: 2,
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.goldPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.goldBorder,
    gap: 4,
  },
  claimText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
  },

  // ── Progress ──
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  circularProgress: { alignItems: "center", flex: 1 },
  circularWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  circularTrack: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 5,
  },
  circularFill: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 5,
    transform: [{ rotate: "-45deg" }],
  },
  circularContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  circularPercent: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  circularLabel: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
    marginBottom: 1,
  },
  circularSublabel: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },

  // ── Streak ──
  streakScroll: { gap: 10, paddingRight: 4 },
  streakItem: { alignItems: "center", width: 40 },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  streakDotActive: { backgroundColor: palette.gold },
  streakDotToday: { borderWidth: 2, borderColor: palette.navy },
  streakDayText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  streakDayTextActive: { color: palette.ink, fontFamily: "Manrope_700Bold" },
  streakDayTextToday: { color: palette.gold },

  // ── Promos ──
  promoCard: {
    width: 210,
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 4,
    backgroundColor: "#000",
  },
  promoImage: { width: "100%", height: "100%", position: "absolute" },
  promoOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  promoTitle: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    marginBottom: 2,
  },
  promoSubtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    marginBottom: 6,
  },
  promoFooter: { flexDirection: "row" },
  promoBadge: {
    backgroundColor: palette.gold,
    color: palette.navy,
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
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
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: palette.ink,
  },

  // ── Teachers header ──
  teachersHeaderWrap: { paddingHorizontal: 16, marginBottom: 12 },
  chipsScroll: { gap: 8, paddingRight: 4, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: { backgroundColor: palette.navy, borderColor: palette.navy },
  chipText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  chipTextActive: { color: palette.white, fontFamily: "Manrope_600SemiBold" },

  // ── TEACHER CARD (redesigned) ──
  columnWrapper: { paddingHorizontal: 16, justifyContent: "space-between" },
  cardWrap: { width: CARD_WIDTH, marginBottom: 16 },
  teacherCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  // Photo
  cardImageWrap: { height: 130, position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },

  // Availability badge — top left
  availBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  availBadgeOn: { backgroundColor: "rgba(39,174,96,0.88)" },
  availBadgeOff: { backgroundColor: "rgba(13,27,42,0.65)" },
  availDot: { width: 5, height: 5, borderRadius: 3 },
  availText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: 0.3,
  },

  // Rating — top right
  ratingBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(13,27,42,0.80)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
  },

  // Subject pill — bottom of image
  subjectPill: {
    position: "absolute",
    bottom: 9,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(232,168,56,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  subjectPillText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  // Body
  cardBody: { padding: 11 },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  cardName: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    flex: 1,
  },
  boardBadge: {
    backgroundColor: palette.goldPale,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  boardText: {
    fontSize: 8,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    flex: 1,
  },
  infoDivider: {
    width: 1,
    height: 10,
    backgroundColor: palette.border,
    marginHorizontal: 3,
  },

  // Class pills
  classesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 5,
  },
  classPill: {
    backgroundColor: "#EEF2F8",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  classPillText: {
    fontSize: 9,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
  },

  // Days
  daysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  daysText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },

  cardDivider: { height: 1, backgroundColor: palette.border, marginBottom: 9 },

  // Demo CTA
  demoBtn: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  demoBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    gap: 5,
  },
  demoBtnText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.1,
  },

  // ── Empty ──
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: palette.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: palette.white,
  },

  // ── Footer & FAB ──
  listFooter: { paddingVertical: 28, alignItems: "center", gap: 8 },
  footerText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 17,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGrad: {
    width: "100%",
    height: "100%",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
});
