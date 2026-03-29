import React, { useState, useEffect, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import apiClient from '../../src/services/api';
import { API_CONFIG } from '../../src/config/api';
import { Teacher } from '../../src/types';
import { debounce, formatCurrency } from '../../src/utils/helpers';
import { getUserData } from '../../src/services/auth';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    fetchTeachers();
  }, []);

  const loadUser = async () => {
    const userData = await getUserData();
    setUser(userData);
  };

  const fetchTeachers = async (pageNum = 1, search = '') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: 10,
      };
      
      if (search) {
        params.subject = search;
      }

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHERS, { params });
      
      if (response.data.data) {
        if (pageNum === 1) {
          setTeachers(response.data.data.data || response.data.data);
        } else {
          setTeachers(prev => [...prev, ...(response.data.data.data || response.data.data)]);
        }
        
        const totalPages = response.data.data.totalPages;
        setHasMore(pageNum < totalPages);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1);
      fetchTeachers(1, query);
    }, API_CONFIG.DEBOUNCE_DELAY),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTeachers(nextPage, searchQuery);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTeachers(1, searchQuery);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetingContainer}>
        <View style={styles.greetingText}>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Student'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.gray[900]} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Daily Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Daily Streak</Text>
        <View style={styles.streakDays}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <View key={day} style={styles.streakDay}>
              <View style={[styles.streakEmoji, index < 4 && styles.streakEmojiActive]}>
                <Text style={styles.emojiText}>{index < 4 ? '🔥' : '⭕'}</Text>
              </View>
              <Text style={styles.streakDayText}>{day}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.rewardBtn}>
          <Text style={styles.rewardBtnText}>Get reward</Text>
        </TouchableOpacity>
      </View>

      {/* Learning Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Learning progress</Text>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressCardTitle}>Total progress</Text>
            <View style={styles.progressTabs}>
              <Text style={[styles.progressTab, styles.progressTabActive]}>1W</Text>
              <Text style={styles.progressTab}>1M</Text>
              <Text style={styles.progressTab}>3M</Text>
            </View>
          </View>
          
          <Text style={styles.progressSubtitle}>Introduction to basic vocabulary</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>4h 10m</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="school" size={20} color={colors.primary} />
              <Text style={styles.statValue}>35 Exam</Text>
            </View>
          </View>

          <View style={styles.timingRow}>
            <View style={styles.timingItem}>
              <Ionicons name="time-outline" size={16} color={colors.gray[600]} />
              <Text style={styles.timingText}>Learning time: 8 hours</Text>
            </View>
            <View style={styles.timingItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.gray[600]} />
              <Text style={styles.timingText}>Completed exam: 3h/6</Text>
            </View>
          </View>

          <View style={styles.certificateRow}>
            <View style={styles.certificateItem}>
              <Ionicons name="ribbon-outline" size={18} color={colors.error} />
              <Text style={styles.certificateText}>6 Certificate</Text>
            </View>
            <View style={styles.certificateItem}>
              <Ionicons name="book-outline" size={18} color={colors.primary} />
              <Text style={styles.certificateText}>8 Course</Text>
            </View>
          </View>

          <View style={styles.progressBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Course certificate</Text>
              <Text style={styles.badgeValue}>6/15</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Completed course</Text>
              <Text style={styles.badgeValue}>8/15</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Find Teachers</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject or teacher..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={styles.recommendationTitle}>Recommendation Teachers</Text>
    </View>
  );

  const renderTeacherCard = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/teacher/${item._id}`)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.profileImage || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <View style={styles.cardBadge}>
          <Ionicons name="language" size={12} color={colors.primary} />
          <Text style={styles.cardBadgeText}>Linguist</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaItem}>
            <Ionicons name="time-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.cardMetaText}>5 hour 30 min</Text>
          </View>
          <View style={styles.cardMetaItem}>
            <Ionicons name="play-circle-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.cardMetaText}>20 Modules</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.studentsText}>({item.totalReviews} students)</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading && page === 1) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={64} color={colors.gray[300]} />
        <Text style={styles.emptyText}>No teachers found</Text>
        <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teachers}
        renderItem={renderTeacherCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingText: {},
  greeting: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  notificationBtn: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  streakCard: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  streakDay: {
    alignItems: 'center',
  },
  streakEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakEmojiActive: {
    backgroundColor: colors.warning + '30',
  },
  emojiText: {
    fontSize: 20,
  },
  streakDayText: {
    fontSize: 11,
    color: colors.gray[600],
  },
  rewardBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  progressTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  progressTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    color: colors.gray[600],
  },
  progressTabActive: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  progressSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  timingRow: {
    marginBottom: 12,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timingText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  certificateRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  certificateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  progressBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.gray[900],
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.gray[100],
  },
  cardContent: {
    padding: 12,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
    lineHeight: 18,
  },
  cardMeta: {
    marginBottom: 8,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: colors.gray[600],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[900],
  },
  studentsText: {
    fontSize: 11,
    color: colors.gray[500],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
