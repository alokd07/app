import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import apiClient from '../../src/services/api';
import { API_CONFIG } from '../../src/config/api';
import { Teacher } from '../../src/types';
import { formatCurrency, openWhatsApp } from '../../src/utils/helpers';

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherDetail();
  }, [id]);

  const fetchTeacherDetail = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(id));
      if (response.data.data) {
        setTeacher(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
      Alert.alert('Error', 'Failed to load teacher details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (teacher) {
      router.push({
        pathname: '/book-session',
        params: { teacherId: teacher._id },
      });
    }
  };

  const handleContactTeacher = () => {
    if (teacher) {
      const message = `Hi ${teacher.name}, I'm interested in booking a session with you.`;
      // Assuming phone is available - you may need to add phone to Teacher type
      openWhatsApp('9876543210', message); // Replace with actual teacher phone
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Teacher not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {teacher.profileImage ? (
            <Image source={{ uri: teacher.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person" size={64} color={colors.gray[400]} />
            </View>
          )}
          
          <Text style={styles.name}>{teacher.name}</Text>
          
          <View style={styles.rating}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <Text style={styles.ratingText}>
              {teacher.rating.toFixed(1)} ({teacher.totalReviews} reviews)
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(teacher.pricePerHour)}</Text>
            <Text style={styles.priceLabel}> per hour</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{teacher.bio || 'No bio available'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              {teacher.experienceYears || 0} years of teaching experience
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.tags}>
            {teacher.subjects.map((subject, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classes</Text>
          <View style={styles.tags}>
            {teacher.classes.map((cls, index) => (
              <View key={index} style={[styles.tag, styles.tagSecondary]}>
                <Text style={[styles.tagText, styles.tagTextSecondary]}>Class {cls}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactTeacher}>
          <Ionicons name="logo-whatsapp" size={24} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookSession}>
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.gray[50],
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    color: colors.gray[700],
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray[700],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.gray[700],
    marginLeft: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagSecondary: {
    backgroundColor: colors.gray[200],
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  tagTextSecondary: {
    color: colors.gray[700],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: 12,
  },
  contactButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
