import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { isAuthenticated } from '../src/services/auth';
import { colors } from '../src/theme/colors';

export default function SplashScreen() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setTimeout(async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📚</Text>
        </View>
        <Text style={styles.title}>BookMySession</Text>
        <Text style={styles.subtitle}>Find & Book Best Teachers</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
});
