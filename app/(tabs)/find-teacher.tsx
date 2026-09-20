import React, { useState, useMemo } from "react";
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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useTeacherStore, NearbyTeacher } from "../../src/store/teacherStore";
import { useUserStore } from "../../src/store/userStore";
import { useTuitionStore } from "../../src/store/tuitionStore";

/* ── Design tokens matching progress.tsx, tuition.tsx & messages.tsx ── */
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

const SUBJECT_PILLS = [
  { id: "all", label: "All Subjects", icon: "sparkles" },
  { id: "Mathematics", label: "Mathematics", icon: "calculator-outline" },
  { id: "Science", label: "Science", icon: "flask-outline" },
  { id: "Physics", label: "Physics", icon: "flash-outline" },
  { id: "Chemistry", label: "Chemistry", icon: "beaker-outline" },
  { id: "English", label: "English", icon: "book-outline" },
  { id: "French", label: "French", icon: "language-outline" },
];

const GRADE_OPTIONS = [
  "all",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

const DISTANCE_OPTIONS = [2, 5, 8, 15];

const SORT_OPTIONS: {
  id: "recommended" | "nearest" | "rating" | "price";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "recommended", label: "Recommended", icon: "sparkles" },
  { id: "nearest", label: "Nearest", icon: "location-outline" },
  { id: "rating", label: "Top Rated", icon: "star-outline" },
  { id: "price", label: "Affordable", icon: "trending-down-outline" },
];

export default function FindTeacherScreen() {
  const {
    filters,
    setSearchQuery,
    setFilters,
    resetFilters,
    getFilteredTeachers,
  } = useTeacherStore();

  const {
    children,
    activeChildId,
    setActiveChildId,
    favoriteTeacherIds,
    toggleFavoriteTeacher,
  } = useUserStore();

  const { activeTuitions } = useTuitionStore();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedMapTeacher, setSelectedMapTeacher] =
    useState<NearbyTeacher | null>(null);

  const activeChild =
    children.find((c) => c.id === activeChildId) || children[0];

  const ongoingTuitionForChild = activeTuitions.find(
    (t) =>
      t.childId === activeChild.id &&
      (t.status === "ACTIVE" || t.status === "PAUSED")
  );

  const filteredTeachers = getFilteredTeachers();

  // Selected map teacher fallback
  const currentMapTeacher = selectedMapTeacher || filteredTeachers[0];

  // Check if any non-default filter is applied
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.subject !== "all") count++;
    if (filters.grade !== "all") count++;
    if (filters.maxDistanceKm < 15) count++;
    if (filters.verifiedOnly) count++;
    if (filters.sortBy !== "recommended") count++;
    return count;
  }, [filters]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Find Tutors</Text>
          <View style={styles.headerSubRow}>
            <Ionicons name="location-sharp" size={13} color={C.ink} />
            <Text style={styles.headerSubText}>
              Vasant Vihar · Within {filters.maxDistanceKm}km
            </Text>
          </View>
        </View>

        {/* Child Switcher Pill */}
        <TouchableOpacity
          style={styles.childPill}
          onPress={() => setShowChildModal(true)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: activeChild.avatar }}
            style={styles.childAvatar}
          />
          <View>
            <Text style={styles.childPillName}>{activeChild.name}</Text>
            <Text style={styles.childPillGrade}>{activeChild.grade}</Text>
          </View>
          <Ionicons name="chevron-down" size={14} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* ── SEARCH & CONTROLS ROW ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchCard}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tutor name, subject or topic..."
            placeholderTextColor={C.faint}
            value={filters.searchQuery}
            onChangeText={setSearchQuery}
          />
          {filters.searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Modal Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            activeFiltersCount > 0 && styles.iconButtonActive,
          ]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? "#FFFFFF" : C.ink}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* View Mode Toggle (List / Map) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={viewMode === "list" ? "map-outline" : "list-outline"}
            size={20}
            color={C.ink}
          />
        </TouchableOpacity>
      </View>

      {/* ── SUBJECT PILLS SCROLL ── */}
      <View style={styles.subjectPillsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectPillsContent}
        >
          {SUBJECT_PILLS.map((sub) => {
            const isSelected = filters.subject === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectPill,
                  isSelected && styles.subjectPillSelected,
                ]}
                onPress={() => setFilters({ subject: sub.id })}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={sub.icon as any}
                  size={14}
                  color={isSelected ? "#FFFFFF" : C.muted}
                />
                <Text
                  style={[
                    styles.subjectPillText,
                    isSelected && styles.subjectPillTextSelected,
                  ]}
                >
                  {sub.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── MAIN CONTENT (LIST OR MAP) ── */}
      {viewMode === "list" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── ONGOING TUITION HELPFUL BANNER (NON-BLOCKING) ── */}
          {ongoingTuitionForChild && (
            <View style={styles.ongoingNoticeCard}>
              <View style={styles.ongoingNoticeIcon}>
                <Ionicons name="school" size={18} color={C.amberDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ongoingNoticeTitle}>
                  {activeChild.name} has active {ongoingTuitionForChild.subject}{" "}
                  tuition
                </Text>
                <Text style={styles.ongoingNoticeSub}>
                  with {ongoingTuitionForChild.teacherName}. Looking for other
                  subjects?
                </Text>
              </View>
              <TouchableOpacity
                style={styles.ongoingNoticeBtn}
                onPress={() => router.push("/(tabs)/tuition")}
                activeOpacity={0.8}
              >
                <Text style={styles.ongoingNoticeBtnText}>My Tuition</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── SORT & QUICK FILTERS STRIP ── */}
          <View style={styles.sortSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortContent}
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = filters.sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.sortChip,
                      isSelected && styles.sortChipSelected,
                    ]}
                    onPress={() => setFilters({ sortBy: opt.id })}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={13}
                      color={isSelected ? "#FFFFFF" : C.muted}
                    />
                    <Text
                      style={[
                        styles.sortChipText,
                        isSelected && styles.sortChipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Verified Only Quick Toggle */}
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  filters.verifiedOnly && styles.sortChipSelected,
                ]}
                onPress={() =>
                  setFilters({ verifiedOnly: !filters.verifiedOnly })
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={filters.verifiedOnly ? "#FFFFFF" : C.green}
                />
                <Text
                  style={[
                    styles.sortChipText,
                    filters.verifiedOnly && styles.sortChipTextSelected,
                  ]}
                >
                  Verified Only
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ── AI TUTOR SPOTLIGHT (CAROUSEL) ── */}
          {!filters.searchQuery &&
            filters.subject === "all" &&
            filteredTeachers.length > 0 && (
              <View style={styles.aiSpotlightSection}>
                <View style={styles.sectionHeaderRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color={C.amberDeep} />
                    <Text style={styles.sectionTitle} numberOfLines={1}>
                      AI Recommended for {activeChild.name.split(" ")[0]}
                    </Text>
                  </View>
                  <Text style={styles.sectionHelper}>
                    {activeChild.grade} Syllabus
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.aiSpotlightScroll}
                >
                  {filteredTeachers.slice(0, 3).map((teacher, idx) => (
                    <View
                      key={`ai-${teacher.id}`}
                      style={[styles.aiCard, softShadow]}
                    >
                      <View style={styles.aiCardTop}>
                        <Image
                          source={{ uri: teacher.profileImage }}
                          style={styles.aiAvatar}
                        />
                        <View style={{ flex: 1 }}>
                          <View style={styles.matchBadge}>
                            <Text style={styles.matchBadgeText}>
                              {idx === 0 ? "98%" : idx === 1 ? "95%" : "92%"}{" "}
                              Match
                            </Text>
                          </View>
                          <Text style={styles.aiName} numberOfLines={1}>
                            {teacher.name}
                          </Text>
                          <Text style={styles.aiSub} numberOfLines={1}>
                            {teacher.subjects.join(", ")} ·{" "}
                            {teacher.experienceYears}y exp
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.aiBio} numberOfLines={2}>
                        "{teacher.bio}"
                      </Text>

                      <View style={styles.aiCardFooter}>
                        <View>
                          <Text style={styles.aiFee}>
                            ₹{teacher.hourlyRate}
                            <Text style={styles.aiFeeUnit}>/hr</Text>
                          </Text>
                          <Text style={styles.aiDistance}>
                            <Ionicons
                              name="location-sharp"
                              size={13}
                              color={C.amberDeep}
                            />{" "}
                            {teacher.distanceKm} km away
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.aiDemoBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/demo/request-demo",
                              params: { teacherId: teacher.id },
                            })
                          }
                          activeOpacity={0.85}
                        >
                          <Text style={styles.aiDemoBtnText}>Free Demo</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

          {/* ── TEACHER CARDS LIST ── */}
          <View style={styles.teachersListSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Available Tutors</Text>
              <Text style={styles.sectionCount}>
                {filteredTeachers.length} verified tutors nearby
              </Text>
            </View>

            {filteredTeachers.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="search-outline"
                    size={36}
                    color={C.amberDeep}
                  />
                </View>
                <Text style={styles.emptyTitle}>No tutors found</Text>
                <Text style={styles.emptySub}>
                  No home tutors matched your current filter criteria. Try
                  expanding the distance or selecting all subjects.
                </Text>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetFilters}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resetBtnText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredTeachers.map((teacher) => {
                const isFav = favoriteTeacherIds.includes(teacher.id);

                return (
                  <TouchableOpacity
                    key={teacher.id}
                    style={[styles.teacherCard, softShadow]}
                    onPress={() =>
                      router.push({
                        pathname: "/teacher/[id]",
                        params: { id: teacher.id },
                      })
                    }
                    activeOpacity={0.85}
                  >
                    {/* Top Row: Avatar, Name, Rating, Heart */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.avatarWrap}>
                        <Image
                          source={{ uri: teacher.profileImage }}
                          style={styles.teacherAvatar}
                        />
                        {teacher.verified && (
                          <View style={styles.verifiedDot}>
                            <Ionicons
                              name="checkmark-circle"
                              size={15}
                              color={C.green}
                            />
                          </View>
                        )}
                      </View>

                      <View style={styles.teacherHeaderInfo}>
                        <View style={styles.teacherNameRow}>
                          <Text style={styles.teacherName} numberOfLines={1}>
                            {teacher.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.favButton}
                            onPress={() => toggleFavoriteTeacher(teacher.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={isFav ? "heart" : "heart-outline"}
                              size={20}
                              color={isFav ? C.red : C.faint}
                            />
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.teacherLocationText}>
                          <Ionicons
                            name="location-sharp"
                            size={13}
                            color={C.ink}
                          />{" "}
                          {teacher.distanceKm} km away ·{" "}
                          {teacher.experienceYears}+ yrs exp
                        </Text>

                        <View style={styles.ratingRow}>
                          <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFFFFF" />
                            <Text style={styles.ratingText}>
                              {teacher.rating}
                            </Text>
                          </View>
                          <Text style={styles.reviewsCountText}>
                            ({teacher.totalReviews} parent reviews)
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Subjects and Classes Tags */}
                    <View style={styles.chipsRow}>
                      {teacher.subjects.map((sub) => (
                        <View key={sub} style={styles.subjectChip}>
                          <Text style={styles.subjectChipText}>{sub}</Text>
                        </View>
                      ))}
                      <View style={styles.classesChip}>
                        <Text style={styles.classesChipText}>
                          Classes {teacher.classesTaught[0]}–
                          {
                            teacher.classesTaught[
                              teacher.classesTaught.length - 1
                            ]
                          }
                        </Text>
                      </View>
                    </View>

                    {/* Footer: Fee & Action Buttons */}
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.feeLabel}>Monthly estimate</Text>
                        <Text style={styles.monthlyFeeText}>
                          ₹{teacher.estimatedMonthlyFee.toLocaleString()}
                          <Text style={styles.feeUnit}> /mo</Text>
                        </Text>
                        <Text style={styles.hourlyFeeSub}>
                          ₹{teacher.hourlyRate}/hr rate
                        </Text>
                      </View>

                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.profileBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/teacher/[id]",
                              params: { id: teacher.id },
                            })
                          }
                          activeOpacity={0.8}
                        >
                          <Text style={styles.profileBtnText}>Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.demoBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/demo/request-demo",
                              params: { teacherId: teacher.id },
                            })
                          }
                          activeOpacity={0.85}
                        >
                          <Text style={styles.demoBtnText}>Request Demo</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        /* ── INTERACTIVE MAP VIEW ── */
        <View style={styles.mapContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
            }}
            style={styles.mapImage}
          />

          {/* Floating Teacher Carousel / Card on Map */}
          {currentMapTeacher && (
            <View style={[styles.mapFloatingCard, softShadow]}>
              <View style={styles.mapCardTopRow}>
                <Image
                  source={{ uri: currentMapTeacher.profileImage }}
                  style={styles.mapAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapTeacherName} numberOfLines={1}>
                    {currentMapTeacher.name}
                  </Text>
                  <Text style={styles.mapTeacherSub}>
                    {currentMapTeacher.subjects.join(", ")} ·{" "}
                    {currentMapTeacher.distanceKm} km
                  </Text>
                  <View style={styles.mapRatingRow}>
                    <Ionicons name="star" size={13} color={C.amber} />
                    <Text style={styles.mapRatingText}>
                      {currentMapTeacher.rating} (
                      {currentMapTeacher.totalReviews} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.mapActionsRow}>
                <TouchableOpacity
                  style={styles.mapListToggleBtn}
                  onPress={() => setViewMode("list")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="list" size={16} color={C.ink} />
                  <Text style={styles.mapListToggleText}>List View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapDemoBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/demo/request-demo",
                      params: { teacherId: currentMapTeacher.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.mapDemoBtnText}>Request Free Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── CHILD PICKER MODAL ── */}
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
              Showing home tutors suited for this child's class and location
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

      {/* ── FILTER MODAL (BOTTOM SHEET) ── */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />

            <View style={styles.filterModalHeader}>
              <Text style={styles.modalSheetTitle}>Filter Tutors</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
            >
              {/* Subject Selection */}
              <Text style={styles.filterGroupTitle}>Subject</Text>
              <View style={styles.filterChipsWrap}>
                {SUBJECT_PILLS.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.modalFilterChip,
                      filters.subject === sub.id &&
                        styles.modalFilterChipActive,
                    ]}
                    onPress={() => setFilters({ subject: sub.id })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalFilterChipText,
                        filters.subject === sub.id &&
                          styles.modalFilterChipTextActive,
                      ]}
                    >
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Grade Selection */}
              <Text style={styles.filterGroupTitle}>Class / Grade</Text>
              <View style={styles.filterChipsWrap}>
                {GRADE_OPTIONS.map((grd) => (
                  <TouchableOpacity
                    key={grd}
                    style={[
                      styles.modalFilterChip,
                      filters.grade === grd && styles.modalFilterChipActive,
                    ]}
                    onPress={() => setFilters({ grade: grd })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalFilterChipText,
                        filters.grade === grd &&
                          styles.modalFilterChipTextActive,
                      ]}
                    >
                      {grd === "all" ? "All Grades" : grd}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Max Distance */}
              <Text style={styles.filterGroupTitle}>Max Distance</Text>
              <View style={styles.filterChipsWrap}>
                {DISTANCE_OPTIONS.map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    style={[
                      styles.modalFilterChip,
                      filters.maxDistanceKm === dist &&
                        styles.modalFilterChipActive,
                    ]}
                    onPress={() => setFilters({ maxDistanceKm: dist })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalFilterChipText,
                        filters.maxDistanceKm === dist &&
                          styles.modalFilterChipTextActive,
                      ]}
                    >
                      Within {dist} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Verified Only Switch */}
              <View style={styles.filterSwitchRow}>
                <View>
                  <Text style={styles.filterSwitchTitle}>
                    Verified Tutors Only
                  </Text>
                  <Text style={styles.filterSwitchSub}>
                    Background checked with identity verification
                  </Text>
                </View>
                <Switch
                  value={filters.verifiedOnly}
                  onValueChange={(val) => setFilters({ verifiedOnly: val })}
                  trackColor={{ false: C.line, true: C.ink }}
                  thumbColor={filters.verifiedOnly ? C.amber : C.surface}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFilterFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => resetFilters()}
                activeOpacity={0.7}
              >
                <Text style={styles.modalResetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalApplyBtnText}>
                  Show Tutors ({filteredTeachers.length})
                </Text>
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
    paddingBottom: 14,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: C.ink,
    letterSpacing: -0.6,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  headerSubText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
  },
  childPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    paddingLeft: 5,
    paddingRight: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    ...softShadow,
  },
  childAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  childPillName: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: C.ink,
  },
  childPillGrade: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: C.muted,
  },

  /* ── Search & Filter Controls ── */
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    position: "relative",
    ...softShadow,
  },
  iconButtonActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  filterBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: C.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: C.ink,
  },

  /* ── Subject Pills Bar ── */
  subjectPillsSection: {
    marginBottom: 12,
  },
  subjectPillsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subjectPill: {
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
  subjectPillSelected: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  subjectPillText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: C.muted,
  },
  subjectPillTextSelected: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },

  /* ── Ongoing Tuition Notice Card (Helpful, non-blocking) ── */
  ongoingNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.amberTint,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.amberLine,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  ongoingNoticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ongoingNoticeTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: C.ink,
  },
  ongoingNoticeSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  ongoingNoticeBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ongoingNoticeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: "#FFFFFF",
  },

  /* ── Sort Chips Strip ── */
  sortSection: {
    marginBottom: 16,
  },
  sortContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
  },
  sortChipSelected: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  sortChipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: C.muted,
  },
  sortChipTextSelected: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },

  /* ── AI Spotlight Section ── */
  aiSpotlightSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  aiSpotlightScroll: {
    gap: 14,
  },
  aiCard: {
    width: 275,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.amberLine,
  },
  aiCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  aiAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: C.amber,
  },
  matchBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.greenTint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  matchBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: C.green,
  },
  aiName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: C.ink,
  },
  aiSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  aiBio: {
    fontFamily: fonts.regular,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
    marginBottom: 12,
  },
  aiCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  aiFee: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: C.ink,
  },
  aiFeeUnit: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.muted,
  },
  aiDistance: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: C.amberDeep,
    marginTop: 1,
  },
  aiDemoBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  aiDemoBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: C.ink,
  },

  /* ── Teacher Cards ── */
  teachersListSection: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
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
  sectionHelper: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.amberDeep,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
  },
  teacherCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  teacherAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: C.amber,
  },
  verifiedDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: C.surface,
    borderRadius: 10,
  },
  teacherHeaderInfo: {
    flex: 1,
  },
  teacherNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: C.ink,
    flex: 1,
  },
  favButton: {
    padding: 2,
  },
  teacherLocationText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.amberDeep,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  reviewsCountText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.muted,
  },

  /* Chips Row */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    marginBottom: 14,
  },
  subjectChip: {
    backgroundColor: C.amberTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectChipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: C.amberDeep,
  },
  classesChip: {
    backgroundColor: C.track,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  classesChipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: C.ink,
  },

  /* Footer */
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  feeLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.muted,
  },
  monthlyFeeText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: C.ink,
    marginTop: 1,
  },
  feeUnit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
  },
  hourlyFeeSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: C.faint,
    marginTop: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.track,
  },
  profileBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: C.ink,
  },
  demoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.ink,
  },
  demoBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
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
    fontFamily: fonts.bold,
    fontSize: 18,
    color: C.ink,
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: C.amber,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  resetBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },

  /* ── Map View ── */
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  mapFloatingCard: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 16,
  },
  mapCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  mapAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: C.amber,
  },
  mapTeacherName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: C.ink,
  },
  mapTeacherSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  mapRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  mapRatingText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: C.ink,
  },
  mapActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  mapListToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.track,
    paddingVertical: 11,
    borderRadius: 12,
  },
  mapListToggleText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: C.ink,
  },
  mapDemoBtn: {
    flex: 1.5,
    backgroundColor: C.ink,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapDemoBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#FFFFFF",
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

  /* Filter Modal Specific */
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  filterGroupTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
    marginTop: 14,
    marginBottom: 8,
  },
  filterChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.track,
  },
  modalFilterChipActive: {
    backgroundColor: C.ink,
  },
  modalFilterChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: C.ink,
  },
  modalFilterChipTextActive: {
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  filterSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 8,
  },
  filterSwitchTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.ink,
  },
  filterSwitchSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  modalFilterFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
  },
  modalResetBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: C.muted,
  },
  modalApplyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.ink,
    alignItems: "center",
  },
  modalApplyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
