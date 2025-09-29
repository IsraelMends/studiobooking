import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMyBookings } from "~/hooks/booking/useMyBookings";
import { LoadingScreen, BookingsList } from "~/components/booking";
import { styles } from "~/components/booking/styles";

export default function MyBookingsScreen() {
  const { myUpcoming, refreshing, isLoading, onRefresh } = useMyBookings();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Minhas Reservas Futuras</Text>
        
        <BookingsList
          bookings={myUpcoming as any[]}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </SafeAreaView>
  );
}