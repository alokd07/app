import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePayment = async () => {
    setProcessing(true);

    // Mock payment flow (since Razorpay is in test mode)
    setTimeout(() => {
      setProcessing(false);
      
      // Simulate successful payment - only navigate after payment success
      Alert.alert(
        'Payment Successful! 🎉',
        'Your booking has been confirmed',
        [
          {
            text: 'View Booking',
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
        ],
        { cancelable: false }
      );
    }, 2000);

    // TODO: Implement real Razorpay integration when keys are provided
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>Secure Payment</Text>
          <Text style={styles.subtitle}>Complete your booking payment</Text>
        </Animated.View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.summaryTitle}>Booking Summary</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconRow}>
              <Ionicons name="person-outline" size={18} color={colors.gray[600]} />
              <Text style={styles.label}>Teacher</Text>
            </View>
            <Text style={styles.value}>{teacherName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.gray[600]} />
              <Text style={styles.label}>Date</Text>
            </View>
            <Text style={styles.value}>{date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconRow}>
              <Ionicons name="time-outline" size={18} color={colors.gray[600]} />
              <Text style={styles.label}>Time</Text>
            </View>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Advance Payment</Text>
            <Text style={styles.totalValue}>{formatCurrency(parseFloat(amount))}</Text>
          </View>
          
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={16} color={colors.info} />
            <Text style={styles.noteText}>
              Remaining amount payable after session
            </Text>
          </View>
        </View>

        {!RAZORPAY_CONFIG.ENABLED && (
          <View style={styles.testModeCard}>
            <View style={styles.testModeHeader}>
              <Ionicons name="construct" size={20} color={colors.warning} />
              <Text style={styles.testModeTitle}>Test Mode</Text>
            </View>
            <Text style={styles.testModeText}>
              Payment is in demo mode. Click pay to simulate successful payment.
            </Text>
          </View>
        )}

        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={styles.securityText}>256-bit SSL Encrypted</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={22} color={colors.white} />
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
    backgroundColor: colors.gray[50],
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
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray[600],
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: colors.gray[600],
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.info + '10',
    padding: 12,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    fontWeight: '500',
  },
  testModeCard: {
    backgroundColor: colors.warning + '15',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  testModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  testModeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.warning,
  },
  testModeText: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  securityText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
