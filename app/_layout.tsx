import React, { useEffect } from "react";
import "react-native-url-polyfill/auto";
import { Stack, useRouter } from "expo-router";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth } from "~/store/auth";
import {
  cleanupExpiredBookings,
  completePastBookings,
} from "~/services/bookings";
import { confirmBooking, cancelBooking } from "~/services/bookings";

// comportamento padrão das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { init } = useAuth();
  const router = useRouter();

  useEffect(() => {
    init();

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();

    // executa as rotinas na abertura e periodicamente
    completePastBookings();
    cleanupExpiredBookings();

    const interval = setInterval(() => {
      completePastBookings();
      cleanupExpiredBookings();
    }, 5 * 60 * 1000);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        completePastBookings();
        cleanupExpiredBookings();
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const bookingId = data?.bookingId as string | undefined;
        const action = response.actionIdentifier;

        if (!bookingId) return;
        if (action === "CONFIRM") {
          confirmBooking(bookingId);
        } else if (action === "CANCEL") {
          cancelBooking(bookingId, "user", new Date().toISOString(), 2);
        } else {
          router.push({
            pathname: "/modals/Booking/confirm-booking",
            params: { bookingId },
          });
        }
      }
    );

    return () => {
      clearInterval(interval);
      sub.remove();
      responseSub.remove();
    };
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
