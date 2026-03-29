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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import apiClient from '../../src/services/api';
import { API_CONFIG } from '../../src/config/api';
import { Teacher } from '../../src/types';
import { debounce, formatCurrency } from '../../src/utils/helpers';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

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

  const renderTeacherCard = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/teacher/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={40} color={colors.gray[400]} />
            </View>
          )}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.subjects}>
            {item.subjects.slice(0, 2).map((subject, index) => (
              <View key={index} style={styles.subjectBadge}>
                <Text style={styles.subjectText} numberOfLines={1}>{subject}</Text>
              </View>
            ))}
            {item.subjects.length > 2 && (
              <View style={styles.moreSubjects}>
                <Text style={styles.moreText}>+{item.subjects.length - 2}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>({item.totalReviews})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(item.pricePerHour)}</Text>
              <Text style={styles.priceLabel}>/hr</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.expBadge}>
          <Ionicons name="ribbon" size={14} color={colors.primary} />
          <Text style={styles.expText}>{item.experienceYears || 0}+ years</Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/teacher/${item._id}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewButtonText}>View Profile</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
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
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject or class..."
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

      <FlatList
        data={teachers}
        renderItem={renderTeacherCard}
        keyExtractor={(item) => item._id}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchContainer: {
    backgroundColor: colors.white,
    padding: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.gray[100],
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.gray[900],
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 16,
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  subjectBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  moreSubjects: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moreText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '500',
    marginLeft: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expText: {
    fontSize: 12,
    color: colors.gray[700],
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
