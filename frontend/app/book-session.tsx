import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/theme/colors';
import apiClient from '../src/services/api';
import { API_CONFIG, RAZORPAY_CONFIG } from '../src/config/api';
import { Teacher, TimeSlot } from '../src/types';
import { formatTime, formatCurrency, formatDate } from '../src/utils/helpers';

export default function BookSessionScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchTeacherDetail();
  }, []);

  useEffect(() => {
    if (selectedDate && teacher?.availability) {
      const dayAvailability = teacher.availability.find(a => a.date === selectedDate);
      setAvailableSlots(dayAvailability?.slots || []);
    }
  }, [selectedDate]);

  const fetchTeacherDetail = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_DETAIL(teacherId));
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

  const handleBookSession = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please select date and time slot');
      return;
    }

    setBooking(true);
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.BOOKINGS, {
        teacherId,
        date: selectedDate,
        timeSlot: selectedSlot,
        mode,
      });

      if (response.data.data) {
        const bookingData = response.data.data;
        
        // Navigate to payment screen
        router.push({
          pathname: '/payment',
          params: {
            bookingId: bookingData._id,
            amount: bookingData.advancePaid.toString(),
            teacherName: teacher?.name || 'Teacher',
            date: selectedDate,
            time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`,
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Generate marked dates for calendar
  const markedDates = teacher?.availability?.reduce((acc, avail) => {
    acc[avail.date] = {
      marked: true,
      dotColor: colors.primary,
      selected: avail.date === selectedDate,
      selectedColor: colors.primary,
    };
    return acc;
  }, {} as any) || {};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Book Session with {teacher?.name}</Text>
          <Text style={styles.subtitle}>Select date, time and mode</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedSlot(null);
            }}
            markedDates={markedDates}
            theme={{
              todayTextColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              arrowColor: colors.primary,
            }}
          />
        </View>

        {/* Time Slot Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            {availableSlots.length === 0 ? (
              <Text style={styles.noSlots}>No available slots for this date</Text>
            ) : (
              <View style={styles.slots}>
                {availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slot,
                      slot.isBooked && styles.slotBooked,
                      selectedSlot === slot && styles.slotSelected,
                    ]}
                    onPress={() => !slot.isBooked && setSelectedSlot(slot)}
                    disabled={slot.isBooked}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        slot.isBooked && styles.slotTextBooked,
                        selectedSlot === slot && styles.slotTextSelected,
                      ]}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Mode Selection */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Mode</Text>
            <View style={styles.modes}>
              <TouchableOpacity
                style={[styles.mode, mode === 'online' && styles.modeSelected]}
                onPress={() => setMode('online')}
              >
                <Ionicons
                  name="videocam"
                  size={24}
                  color={mode === 'online' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.modeText,
                    mode === 'online' && styles.modeTextSelected,
                  ]}
                >
                  Online
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mode, mode === 'offline' && styles.modeSelected]}
                onPress={() => setMode('offline')}
              >
                <Ionicons
                  name="location"
                  size={24}
                  color={mode === 'offline' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.modeText,
                    mode === 'offline' && styles.modeTextSelected,
                  ]}
                >
                  Offline
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Summary */}
        {selectedDate && selectedSlot && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Teacher:</Text>
              <Text style={styles.summaryValue}>{teacher?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mode:</Text>
              <Text style={styles.summaryValue}>
                {mode === 'online' ? 'Online' : 'Offline'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(teacher?.pricePerHour || 0)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedDate && selectedSlot && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.bookButton, booking && styles.buttonDisabled]}
            onPress={handleBookSession}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.bookButtonText}>Proceed to Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  },
  header: {
    padding: 24,
    backgroundColor: colors.gray[50],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
  },
  noSlots: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 20,
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotBooked: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  slotTextSelected: {
    color: colors.white,
  },
  slotTextBooked: {
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  modes: {
    flexDirection: 'row',
    gap: 12,
  },
  mode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    gap: 8,
  },
  modeSelected: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modeTextSelected: {
    color: colors.white,
  },
  summary: {
    marginHorizontal: 24,
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
