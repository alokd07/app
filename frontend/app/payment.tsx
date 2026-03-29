import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/theme/colors';
import { formatCurrency } from '../src/utils/helpers';
import { RAZORPAY_CONFIG } from '../src/config/api';

export default function PaymentScreen() {
  const { bookingId, amount, teacherName, date, time } = useLocalSearchParams<{
    bookingId: string;
    amount: string;
    teacherName: string;
    date: string;
    time: string;
  }>();
  
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    // Mock payment flow (since Razorpay is in test mode)
    setTimeout(() => {
      setProcessing(false);
      
      // Simulate successful payment
      Alert.alert(
        'Payment Successful',
        'Your booking has been confirmed!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: '/booking-confirmation',
                params: {
                  bookingId,
                  teacherName,
                  date,
                  time,
                  amount,
                },
              });
            },
          },
        ]
      );
    }, 2000);

    // TODO: Implement real Razorpay integration when keys are provided
    // const options = {
    //   key: RAZORPAY_CONFIG.KEY_ID,
    //   amount: parseFloat(amount) * 100, // paise
    //   currency: 'INR',
    //   name: 'BookMySession',
    //   description: `Booking with ${teacherName}`,
    //   order_id: bookingId,
    //   handler: (response) => {
    //     // Payment success
    //     router.replace('/booking-confirmation');
    //   },
    // };
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your booking payment</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Details</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Teacher:</Text>
            <Text style={styles.value}>{teacherName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Advance Payment:</Text>
            <Text style={styles.totalValue}>{formatCurrency(parseFloat(amount))}</Text>
          </View>
          
          <Text style={styles.note}>
            * Remaining amount to be paid after session completion
          </Text>
        </View>

        {!RAZORPAY_CONFIG.ENABLED && (
          <View style={styles.testMode}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={styles.testModeText}>
              Payment is in test mode. Click pay to simulate payment.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color={colors.white} />
              <Text style={styles.payButtonText}>
                Pay {formatCurrency(parseFloat(amount))}
              </Text>
            </>
          )}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  summary: {
    backgroundColor: colors.gray[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
  label: {
    fontSize: 14,
    color: colors.gray[600],
  },
  value: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  note: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
    marginTop: 8,
  },
  testMode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  testModeText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
