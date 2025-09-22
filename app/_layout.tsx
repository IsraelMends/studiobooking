import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "~/store/auth";

export default function RootLayout() {
  const { init } = useAuth();
  useEffect(() => {
    init();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="modals/Booking/confirm-booking"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="admin/settings" />
      <Stack.Screen name="admin/reports" />
    </Stack>
  );
}
