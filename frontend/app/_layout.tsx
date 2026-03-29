import { Stack } from 'expo-router';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen 
        name="auth/login" 
        options={{ 
          title: 'Login',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="auth/verify-otp" 
        options={{ 
          title: 'Verify OTP',
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
          title: 'Teacher Profile',
        }} 
      />
      <Stack.Screen 
        name="book-session" 
        options={{ 
          title: 'Book Session',
        }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ 
          title: 'Payment',
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
          title: 'Booking Details',
        }} 
      />
    </Stack>
  );
}
