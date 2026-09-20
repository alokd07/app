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
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          header: (props) => <CentralizedHeader {...props} />,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/account-type" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="parent/add-child" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/replace-teacher" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/reviews" options={{ headerShown: false }} />
        <Stack.Screen name="demo/request-demo" options={{ headerShown: false }} />
        <Stack.Screen name="demo/assign-teacher" options={{ headerShown: false }} />
        <Stack.Screen name="tuition/attendance" options={{ headerShown: false }} />
        <Stack.Screen name="tuition/cancel-tuition" options={{ headerShown: false }} />
        <Stack.Screen name="billing/index" options={{ headerShown: false }} />
        <Stack.Screen name="billing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="book-session" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="booking-confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="session/classroom" options={{ headerShown: false }} />
        <Stack.Screen name="session/in-person" options={{ headerShown: false }} />
        <Stack.Screen name="session/reschedule" options={{ headerShown: false }} />
        <Stack.Screen name="session/cancel" options={{ headerShown: false }} />
        <Stack.Screen name="messages/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="learning-progress" options={{ headerShown: false }} />
        <Stack.Screen name="profile/payments" options={{ headerShown: false }} />
        <Stack.Screen name="profile/payment-details" options={{ headerShown: false }} />
        <Stack.Screen name="profile/addresses" options={{ headerShown: false }} />
        <Stack.Screen name="profile/notification-settings" options={{ headerShown: false }} />
        <Stack.Screen name="profile/report-teacher" options={{ headerShown: false }} />
        <Stack.Screen name="rate-session" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
