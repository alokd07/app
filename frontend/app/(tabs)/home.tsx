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
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          
          <View style={styles.subjects}>
            {item.subjects.slice(0, 2).map((subject, index) => (
              <View key={index} style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)} ({item.totalReviews})
              </Text>
            </View>
            <Text style={styles.price}>{formatCurrency(item.pricePerHour)}/hr</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push(`/teacher/${item._id}`)}
      >
        <Text style={styles.viewButtonText}>View Profile</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.gray[900],
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  subjectBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
