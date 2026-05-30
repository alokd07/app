import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="personal-details" />
      <Stack.Screen name="contact-details" />
      <Stack.Screen name="education-details" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="help" />
      <Stack.Screen name="about" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
