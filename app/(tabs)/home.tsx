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
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { debounce } from "../../src/utils/helpers";
import { appColors } from "../../src/theme/colors";
import Avatar from "@/components/Avatar";
// expo haptic
import * as Haptics from "expo-haptics";
import SafeBlurView from "../../components/SafeBlurView";
import { useAuthStore } from "@/src/store/authStore";
import { saveUserData } from "@/src/services/auth";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

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
        colors={gradient || [appColors.goldPale, appColors.goldPale]}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons name={icon} size={22} color={appColors.gold} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Promo Card ───────────────────────────────────────────────────────────────
function PromoCard({ item }: any) {
  return (
    <TouchableOpacity
      style={styles.promoCard}
      activeOpacity={0.9}
      onPress={() => router.push("/ai-results")}
    >
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
  missed,
  onPress,
}: {
  day: string;
  active: boolean;
  isToday: boolean;
  missed: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.streakItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.streakDot,
          active && styles.streakDotActive,
          missed && styles.streakDotMissed,
          isToday && styles.streakDotToday,
        ]}
      >
        {active && (
          <Ionicons name="checkmark" size={10} color={appColors.navy} />
        )}

        {missed && <Ionicons name="close" size={10} color="#fff" />}

        {!active && !missed && (
          <Ionicons name="gift" size={10} color={appColors.navy} />
        )}
      </View>

      <Text
        style={[
          styles.streakDayText,
          active && styles.streakDayTextActive,
          missed && styles.streakDayTextMissed,
          isToday && styles.streakDayTextToday,
        ]}
      >
        {day}
      </Text>
    </TouchableOpacity>
  );
}

// ─── CircularProgress (simplified) ───────────────────────────────────────────
function CircularProgress({
  progress,
  color = appColors.gold,
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
        <View
          style={[styles.circularTrack, { borderColor: appColors.border }]}
        />
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
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 11,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fee = item.feePerSession
    ? `₹${item.feePerSession}`
    : item.fee
      ? `₹${item.fee}`
      : "₹500";

  const subject = item.subject || "General";
  const experience = item.experience ?? 3;
  const rating = item.rating?.toFixed(1) ?? "4.8";
  const reviews =
    item.totalReviews ?? item.reviews ?? Math.floor(Math.random() * 80 + 20);
  const area = item.area || "Delhi";
  const teaches = item.teaches || [];

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
        activeOpacity={0.9}
      >
        <View style={styles.topRow}>
          <Image
            source={{
              uri:
                item.profileImage || `https://i.pravatar.cc/150?u=${item._id}`,
            }}
            style={styles.avatar}
          />

          <View style={styles.teacherInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.teacherName} numberOfLines={1}>
                {item.name}
              </Text>

              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              )}
            </View>

            <Text style={styles.subjectText}>
              {item.subject} • Class {item.classLevel}
            </Text>

            <Text style={styles.expText}>
              {item.experience || 3} Years Experience
            </Text>
          </View>

          <View style={styles.distanceBox}>
            <Text style={styles.distanceText}>{item.distance || "1.2"} km</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{item.rating || "4.8"}</Text>
          </View>

          <View style={styles.statChip}>
            <Ionicons name="people-outline" size={14} color="#64748B" />
            <Text style={styles.statText}>
              {item.totalReviews || 100}+ Reviews
            </Text>
          </View>

          <View style={styles.statChip}>
            <Ionicons name="home-outline" size={14} color="#64748B" />
            <Text style={styles.statText}>Home Tuition</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {["CBSE", "ICSE", "English"].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>₹{item.fee || 2500}</Text>
            <Text style={styles.priceLabel}>per month</Text>
          </View>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() =>
              router.push({
                pathname: "/book-session",
                params: { teacherId: item._id },
              })
            }
          >
            <Text style={styles.demoBtnText}>Book Free Demo</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [activeFilter, setActiveFilter] = useState("All");

  const onEndReachedCalledDuringMomentum = useRef(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const [isMatching, setIsMatching] = useState(false);

  // 2. The Function for the FAB
  const startAiMatch = () => {
    setIsMatching(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate AI "Thinking" for 2 seconds
    setTimeout(() => {
      setIsMatching(false);
      router.push("/ai-results"); // Navigate to a special results screen
    }, 2500);
  };
  const FILTERS = ["All", "Math", "Science", "English", "Near Me"];
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Student";

  const fetchTeachers = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);

      const params: any = { page: pageNum, limit: 10 };
      if (search) params.subject = search;

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHERS, {
        params,
      });

      console.log("Fetched teachers:", response.data);

      if (response?.data?.data?.teachers) {
        const data = response.data.data.teachers;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Inside HomeScreen function
  const fabAnim = useRef(new Animated.Value(1)).current; // For Scale & Visibility
  const pulseAnim = useRef(new Animated.Value(1)).current; // For the "Glow"

  // 1. Create the "Breathing" pulse effect
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // 2. Map scroll to FAB visibility (interpolating the scrollY you already have)
  const fabTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  const fabOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const calculateStreak = (user: any) => {
    const today = new Date();
    const last = user?.lastActiveDate ? new Date(user.lastActiveDate) : null;

    if (!last) {
      return {
        ...user,
        streak: 1,
        lastActiveDate: today.toISOString(),
      };
    }

    const diffDays = Math.floor(
      (today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return user; // already active today
    }

    if (diffDays === 1) {
      return {
        ...user,
        streak: (user.streak || 0) + 1,
        lastActiveDate: new Date().toISOString(),
      };
    }

    // ❗ gap detected
    if (diffDays > 1) {
      if (user.freezeCount > 0) {
        return {
          ...user,
          freezeCount: user.freezeCount - 1, // consume freeze
          lastActiveDate: new Date().toISOString(),
          // streak stays SAME
        };
      }

      // no freeze → reset
      return {
        ...user,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
      };
    }

    return user;
  };

  const handleStreakPress = (missed: boolean, isToday: boolean) => {
    if (missed && isToday) {
      Alert.alert("Missed Today", "Use a freeze to protect your streak?", [
        { text: "Cancel", style: "cancel" },
        { text: "Use Freeze", onPress: handleUseFreeze },
      ]);
    } else if (missed) {
      Alert.alert("Missed Day", "You missed this day.");
    } else {
      Alert.alert("Great!", "You're on track 🔥");
    }
  };

  const handleUseFreeze = () => {
    if (!user?.freezeCount) {
      Alert.alert("No freezes left");
      return;
    }

    const updated = {
      ...user,
      freezeCount: user.freezeCount - 1,
      lastActiveDate: new Date().toISOString(),
    };

    setUser(updated);
    saveUserData(updated);

    Alert.alert("Streak saved!", "Freeze used ❄️");
  };

  useEffect(() => {
    if (!user) return;

    const updated = calculateStreak(user);

    if (
      updated.streak !== user.streak ||
      updated.lastActiveDate !== user.lastActiveDate
    ) {
      setUser(updated);
      saveUserData(updated);
    }
  }, [setUser, user]);

  useEffect(() => {
    fetchTeachers(1);
  }, []);

  // const markLearningActivity = () => {
  //   const updated = calculateStreak(user);
  //   setUser(updated);
  //   saveUserData(updated);
  // };

  const todayIndex = (new Date().getDay() + 6) % 7;
  const streak = user?.streak || 0;

  const renderHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      {/* ── Top Nav ── */}
      <View style={{ backgroundColor: appColors.cream }}>
        <View style={styles.topNav}>
          <View style={styles.row}>
            <Avatar
              uri={user?.imageUrl}
              name={user?.firstName || "Student"}
              size={42}
            />
            <View>
              <Text style={styles.greetingLabel}>{getGreeting()}</Text>
              <Text style={styles.userNameNew}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleSearch("")}
            >
              <Ionicons name="search-outline" size={18} color={appColors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={styles.iconBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={appColors.ink}
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Hero Card ── */}
      <LinearGradient
        colors={[appColors.navy, appColors.navyMid]}
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
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push("/learning-progress")}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={14} color={appColors.navy} />
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
          gradient={[appColors.goldPale, appColors.goldPale]}
          onPress={() => router.push("/learning-progress")}
        />
        <QuickAction
          icon="trophy-outline"
          label="Achievements"
          onPress={() => router.push("/learning-progress")}
        />
        <QuickAction
          icon="calendar-outline"
          label="Schedule"
          onPress={() => router.push("/(tabs)/bookings")}
        />
        <QuickAction
          icon="chatbubble-outline"
          label="Messages"
          onPress={() => router.push("/notifications")}
        />
      </ScrollView>

      {/* ── Progress ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <TouchableOpacity onPress={() => router.push("/learning-progress")}>
            <Text style={styles.seeAll}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressGrid}>
          <CircularProgress
            progress={40}
            color={appColors.gold}
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
            color={appColors.success}
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
            <Text style={styles.streakCount}>{user?.streak || 0} days 🔥</Text>
          </View>

          <TouchableOpacity style={styles.freezeBtn} onPress={handleUseFreeze}>
            <Ionicons name="snow-outline" size={14} color="#fff" />
            <Text style={styles.freezeText}>
              Freeze ({user?.freezeCount || 0})
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.streakScroll}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
            const isToday = i === todayIndex;

            const isActive = i >= todayIndex - streak + 1 && i <= todayIndex;

            const isPast = i < todayIndex;

            const isMissed = isPast && !isActive;

            return (
              <StreakItem
                key={d}
                day={d}
                active={isActive}
                isToday={isToday}
                missed={isMissed}
                onPress={() => handleStreakPress(isMissed, isToday)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* ── Promos ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers & Promotions</Text>
          <TouchableOpacity onPress={() => router.push("/ai-results")}>
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
            color={searchQuery ? appColors.gold : appColors.muted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject, area or teacher…"
            placeholderTextColor={appColors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color={appColors.muted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/ai-results")}>
              <Ionicons
                name="options-outline"
                size={20}
                color={appColors.navyMid}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Teachers header + filter chips ── */}
      <View style={styles.teachersHeaderWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Teachers</Text>
          <TouchableOpacity
            onPress={() => {
              setActiveFilter("All");
              handleSearch("");
            }}
          >
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
              onPress={() => {
                setActiveFilter(f);
                handleSearch(f === "All" ? "" : f);
              }}
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

  const renderEmpty = () => {
    if (loading && page === 1) {
      return (
        <View style={[styles.emptyState, { paddingTop: 40 }]}>
          <ActivityIndicator size="large" color={appColors.gold} />
          <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>
            Loading recommended teachers...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="people-outline" size={40} color={appColors.gold} />
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
  };

  const renderFooter = () =>
    loading && page > 1 ? (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={appColors.gold} />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    ) : null;

  return (
    <View style={styles.root}>
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
            tintColor={appColors.gold}
            colors={[appColors.gold]}
          />
        }
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

      {/* Enhanced Animated FAB */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ translateY: fabTranslateY }, { scale: fabAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() =>
            Animated.spring(fabAnim, {
              toValue: 0.9,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(fabAnim, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }).start()
          }
          onPress={() => startAiMatch()}
        >
          <LinearGradient
            colors={[appColors.gold, appColors.goldLight]}
            style={styles.fabGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={20} color={appColors.navy} />
            <Text style={styles.fabLabel}>AI Match</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {isMatching && (
        <Animated.View style={StyleSheet.absoluteFill}>
          <SafeBlurView
            intensity={90}
            tint="dark"
            style={styles.matchOverlay}
            fallbackColor="rgba(2, 8, 23, 0.88)"
          >
            <View style={styles.matchContent}>
              <Ionicons name="sparkles" size={80} color={appColors.gold} />
              <Text style={styles.matchTitle}>
                Finding your perfect tutor...
              </Text>
              <Text style={styles.matchSubtitle}>
                Analyzing 500+ teachers in Delhi
              </Text>
              <ActivityIndicator
                size="large"
                color={appColors.gold}
                style={{ marginTop: 30 }}
              />
            </View>
          </SafeBlurView>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: appColors.cream },
  listContent: { paddingBottom: 100 },

  // ── Header ──
  headerContainer: { backgroundColor: appColors.cream },
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
    color: appColors.muted,
  },
  userNameNew: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: appColors.ink,
    letterSpacing: -0.4,
  },
  iconBtn: {
    position: "relative",
    borderWidth: 1,
    borderColor: appColors.border,
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
    backgroundColor: appColors.success,
    borderWidth: 1.5,
    borderColor: appColors.cream,
  },

  // ── Hero Card ──
  heroCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: appColors.navy,
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
    color: appColors.white,
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
    backgroundColor: appColors.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
  },
  continueBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: appColors.navy,
  },
  heroDecorCircle1: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: appColors.goldPale,
    top: -20,
    right: 60,
    opacity: 0.5,
  },
  heroDecorCircle2: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: appColors.goldBorder,
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
    borderColor: appColors.goldBorder,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: appColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: appColors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.ink,
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
    color: appColors.ink,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.gold,
  },
  streakCount: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: appColors.muted,
    marginTop: 2,
  },
  freezeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6", // blue
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },

  freezeText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: "#fff",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.goldPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appColors.goldBorder,
    gap: 4,
  },
  claimText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.ink,
  },

  // ── Progress ──
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: appColors.navy,
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
    color: appColors.ink,
  },
  circularLabel: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.ink,
    marginBottom: 1,
  },
  circularSublabel: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: appColors.muted,
  },

  // ── Streak ──
  streakScroll: { gap: 10, paddingRight: 4 },
  streakItem: { alignItems: "center", width: 40 },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: appColors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  streakDotActive: { backgroundColor: appColors.gold },
  streakDotToday: { borderWidth: 2, borderColor: appColors.gold },
  streakDotMissed: {
    backgroundColor: appColors.error,
  },

  streakDayTextMissed: {
    color: appColors.error,
    textDecorationLine: "line-through",
  },
  streakDayText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: appColors.muted,
  },
  streakDayTextActive: { color: appColors.ink, fontFamily: "Manrope_700Bold" },
  streakDayTextToday: { color: appColors.gold },

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
    backgroundColor: appColors.gold,
    color: appColors.navy,
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
    backgroundColor: appColors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: appColors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: appColors.ink,
  },

  // ── Teachers header ──
  teachersHeaderWrap: { paddingHorizontal: 16, marginBottom: 12 },
  chipsScroll: { gap: 8, paddingRight: 4, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  chipActive: { backgroundColor: appColors.navy, borderColor: appColors.navy },
  chipText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: appColors.muted,
  },
  chipTextActive: { color: appColors.white, fontFamily: "Manrope_600SemiBold" },

  // ── TEACHER CARD (redesigned) ──
  cardWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  teacherCard: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderRadius: 22,
    marginBottom: 14,
  },

  topRow: {
    flexDirection: "row",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 18,
  },

  teacherInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  teacherName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  subjectText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 3,
  },

  expTextOld: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  distanceBox: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  distanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },

  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#334155",
  },

  tagsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  tag: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  tagText: {
    fontSize: 11,
    color: "#374151",
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  priceLabel: {
    fontSize: 11,
    color: "#6B7280",
  },

  demoBtn: {
    backgroundColor: "#18746E",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  demoBtnText: {
    color: "#FFF",
    fontWeight: "700",
  },

  // Avatar column
  cardAvatarCol: { position: "relative", flexShrink: 0 },
  cardAvatarWrap: {
    width: 72,
    height: 82,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(232,168,56,0.25)",
  },
  cardAvatar: { width: "100%", height: "100%" },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: appColors.white,
  },
  onlineDotOn: { backgroundColor: "#10B981" },
  onlineDotOff: { backgroundColor: "#9CA3AF" },

  // Info column
  cardInfo: { flex: 1, gap: 6 },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: appColors.ink,
    flex: 1,
    letterSpacing: -0.2,
  },

  // Rating chip
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(232,168,56,0.1)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.25)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  ratingChipText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: appColors.gold,
  },

  // Subject tag
  subjectTag: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexShrink: 1,
    maxWidth: "55%",
  },
  subjectTagText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: "#6366F1",
  },
  expText: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: appColors.muted,
    flexShrink: 0,
  },

  // Meta row (location · reviews)
  cardMeta: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: appColors.muted,
    flexShrink: 1,
  },
  dotSep: {
    fontSize: 11,
    backgroundColor: "#a7a9ad",
    width: 3,
    height: 3,
    borderRadius: 10,
    marginHorizontal: 2,
  },

  // Class tags
  cardTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  classTag: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  classTagText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: "#475569",
  },
  moreTagsText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.gold,
    alignSelf: "center",
  },

  // Fee + book
  feeText: {
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
    color: appColors.ink,
  },
  feeUnit: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: appColors.muted,
  },
  bookBtn: {
    borderRadius: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: appColors.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  bookBtnGrad: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: appColors.navy,
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
    backgroundColor: appColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: appColors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: appColors.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: appColors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: appColors.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: appColors.white,
  },

  // ── Footer & FAB ──
  listFooter: { paddingVertical: 28, alignItems: "center", gap: 8 },
  footerText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: appColors.muted,
  },
  fabContainer: {
    position: "absolute",
    bottom: 102,
    right: 20,
    // Note: We don't set width here so it expands with the button
    height: 50,
    zIndex: 99,
    justifyContent: "center",
    alignItems: "center",
  },
  fabGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    height: 50, // Fixed height
    borderRadius: 25, // Perfect circle ends
    gap: 8,
    shadowColor: appColors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabLabel: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: appColors.navy,
  },
  matchOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  matchContent: {
    alignItems: "center",
    padding: 40,
  },
  matchTitle: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: appColors.white,
    textAlign: "center",
    marginTop: 20,
  },
  matchSubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },
});
