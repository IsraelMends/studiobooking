import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "~/store/auth";
import { cleanupExpiredBookings } from "../src/services/bookings";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from "expo-notifications";

export default function RootLayout() {
  const { init } = useAuth();

  useEffect(() => {
    init();
    Notifications.requestPermissionsAsync();

    const interval = setInterval(() => {
      cleanupExpiredBookings();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
