import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/theme/colors';
import { formatCurrency } from '../src/utils/helpers';

export default function BookingConfirmationScreen() {
  const { bookingId, teacherName, date, time, amount } = useLocalSearchParams<{
    bookingId: string;
    teacherName: string;
    date: string;
    time: string;
    amount: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color={colors.success} />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your session has been booked successfully
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <Text style={styles.detailText}>{teacherName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.detailText}>{date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.detailText}>{time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              Paid: {formatCurrency(parseFloat(amount))}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            You will receive confirmation details shortly
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.viewButtonText}>View My Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  details: {
    width: '100%',
    backgroundColor: colors.gray[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: colors.gray[900],
    marginLeft: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
    marginLeft: 8,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  homeButton: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
});
