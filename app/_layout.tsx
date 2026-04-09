import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator, StatusBar } from "react-native";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { colors } from "../src/theme/colors";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CentralizedHeader from "../components/CentralizedHeader";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/src/store/authStore";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrateUser = useAuthStore((state) => state.hydrateUser);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={colors.primary} />
      <Stack
        screenOptions={{
          header: (props) => <CentralizedHeader {...props} />,
          contentStyle: { backgroundColor: colors.white },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/verify-otp"
          options={{
            title: "Verify OTP",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="teacher/[id]"
          options={{
            title: "Teacher Profile",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="book-session"
          options={{
            title: "Book Session",
          }}
        />
        <Stack.Screen
          name="payment"
          options={{
            title: "Payment",
          }}
        />
        <Stack.Screen
          name="booking-confirmation"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{
            title: "Booking Details",
          }}
        />
        <Stack.Screen
          name="ai-results"
          options={{
            title: "AI Recommendations",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="student-profile-setup"
          options={{
            title: "Profile Setup",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: "Notifications",
          }}
        />
        <Stack.Screen
          name="learning-progress"
          options={{
            title: "Learning Progress",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
