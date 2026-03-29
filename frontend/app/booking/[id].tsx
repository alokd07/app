import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import apiClient from '../../src/services/api';
import { API_CONFIG } from '../../src/config/api';
import { Booking, Teacher } from '../../src/types';
import { formatDate, formatTime, formatCurrency, openWhatsApp } from '../../src/utils/helpers';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.BOOKING_DETAIL(id));
      if (response.data.data) {
        setBooking(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: confirmCancelBooking,
        },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    setCancelling(true);
    try {
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.CANCEL_BOOKING(id));
      
      if (response.data.success) {
        Alert.alert('Success', 'Booking cancelled successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactTeacher = () => {
    const teacher = typeof booking?.teacher === 'object' ? booking.teacher : null;
    if (teacher) {
      const message = `Hi ${teacher.name}, I have a booking with you on ${formatDate(booking!.date)}`;
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

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const teacher = typeof booking.teacher === 'object' ? booking.teacher : null;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return colors.info;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Teacher Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher Details</Text>
        <View style={styles.teacherCard}>
          {teacher?.profileImage ? (
            <Image source={{ uri: teacher.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color={colors.gray[400]} />
            </View>
          )}
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{teacher?.name || 'Teacher'}</Text>
            {teacher && (
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.ratingText}>{teacher.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactTeacher}
          >
            <Ionicons name="logo-whatsapp" size={24} color={colors.success} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.iconLabel}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Date</Text>
          </View>
          <Text style={styles.value}>{formatDate(booking.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconLabel}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Time</Text>
          </View>
          <Text style={styles.value}>
            {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconLabel}>
            <Ionicons
              name={booking.mode === 'online' ? 'videocam-outline' : 'location-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.label}>Mode</Text>
          </View>
          <Text style={styles.value}>
            {booking.mode === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total Amount</Text>
          <Text style={styles.paymentValue}>{formatCurrency(booking.amount)}</Text>
        </View>

        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Advance Paid</Text>
          <Text style={[styles.paymentValue, { color: colors.success }]}>
            {formatCurrency(booking.advancePaid)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Remaining Amount</Text>
          <Text style={styles.totalValue}>{formatCurrency(booking.remainingAmount)}</Text>
        </View>

        <Text style={styles.note}>
          * To be paid after session completion
        </Text>
      </View>

      {/* Cancel Button */}
      {booking.status === 'upcoming' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.buttonDisabled]}
            onPress={handleCancelBooking}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
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
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  note: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
