import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import apiClient from '../../src/services/api';
import { API_CONFIG } from '../../src/config/api';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Invalid Input', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        phone: `+91${phone}`,
      });

      // Only navigate after successful API response
      if (response.data && (response.data.success || response.status === 200)) {
        Alert.alert('Success', 'OTP sent to your WhatsApp', [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/auth/verify-otp',
                params: { phone: `+91${phone}` },
              });
            },
          },
        ]);
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
          
          <View style={styles.tabContainer}>
            <View style={styles.tabActive}>
              <Text style={styles.tabTextActive}>Login</Text>
            </View>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome to "BookMySession"</Text>
          <Text style={styles.subtitle}>
            BookMySession is an online learning and teaching platform connecting students 
            with expert teachers across subjects. Find, book, and learn from the best instructors.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.gray[500]} style={styles.inputIcon} />
              <View style={styles.prefixContainer}>
                <Text style={styles.prefix}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Ionicons name="checkmark" size={16} color={colors.white} />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the terms and conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.7}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxText}>
              I want to receive marketing & promotional information from BookMySession
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.7}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxText}>
              Subscribe to updates: view email newsletters, updates, and learning content
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        {/* Bottom Link */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            Don't have an account yet?{' '}
            <Text style={styles.bottomLink}>Sign up</Text>
          </Text>
        </View>

        {/* Social Login */}
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Ionicons name="logo-google" size={20} color={colors.gray[700]} />
          <Text style={styles.socialButtonText}>Or Continue with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  tab: {
    paddingVertical: 4,
  },
  tabActive: {
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[600],
  },
  tabTextActive: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.gray[900],
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: colors.gray[900],
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[600],
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  prefixContainer: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  prefix: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.gray[700],
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[900],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[700],
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.white,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[700],
  },
  bottomLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: colors.primary,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[700],
  },
});
