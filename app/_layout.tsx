import React, { useEffect } from "react";
import { Stack } from "expo-router";
import {
  View,
  ActivityIndicator,
  StatusBar,
  Text,
  TextInput,
} from "react-native";
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

  useEffect(() => {
    const textAny = Text as any;
    const inputAny = TextInput as any;

    textAny.defaultProps = textAny.defaultProps || {};
    inputAny.defaultProps = inputAny.defaultProps || {};

    textAny.defaultProps.style = [
      textAny.defaultProps.style,
      { fontFamily: "Manrope_400Regular" },
    ];
    inputAny.defaultProps.style = [
      inputAny.defaultProps.style,
      { fontFamily: "Manrope_400Regular" },
    ];
  }, []);

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
            title: "Checkout & Payment",
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
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="demo/request"
          options={{
            title: "Book Free Demo",
          }}
        />
        <Stack.Screen
          name="demo/[id]"
          options={{
            title: "Demo Details",
          }}
        />
        <Stack.Screen
          name="demo/decision"
          options={{
            title: "Post-Demo Choice",
          }}
        />
        <Stack.Screen
          name="select-package"
          options={{
            title: "Select Package",
          }}
        />
        <Stack.Screen
          name="rate-session"
          options={{
            title: "Rate Your Session",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
