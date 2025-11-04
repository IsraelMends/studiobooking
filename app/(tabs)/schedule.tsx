import React, { useCallback } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScheduleData } from "~/hooks/schedule/useScheduleData";
import { useBookingActions } from "~/hooks/schedule/useBookingActions";
import {
  ScheduleCalendar,
  AvailableSlots,
  DayBookings,
  DeviceSelectionModal,
  LoadingScreen,
} from "~/components/schedule";

import styles from "../styles";

export default function Schedule() {
  const {
    date,
    setDate,
    available,
    setAvailable,
    dayBookings,
    setDayBookings,
    isLoading,
    today,
    profile,
  } = useScheduleData();

  const {
    isCreating,
    showDeviceModal,
    selectedTime,
    selectedDevices,
    devices,
    toggleDevice,
    confirmBooking,
    onSlotPress,
    cancelModal,
  } = useBookingActions(profile, date, setAvailable, setDayBookings);

  const onDayPress = useCallback((day: { dateString: string }) => {
    setDate(day.dateString);
  }, [setDate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Agende sua Reserva</Text>

        {/* Disponibilidade agora é global (sem seleção de organização) */}

        <ScheduleCalendar
          selectedDate={date}
          onDayPress={onDayPress}
          minDate={today}
        />

        <AvailableSlots
          date={date}
          slots={available}
          isCreating={isCreating}
          showDeviceModal={showDeviceModal}
          onSlotPress={onSlotPress}
        />

        <DayBookings bookings={dayBookings} />
      </ScrollView>

      <DeviceSelectionModal
        visible={showDeviceModal}
        selectedTime={selectedTime}
        selectedDate={date}
        selectedDevices={selectedDevices}
        onToggleDevice={toggleDevice}
        onConfirm={confirmBooking}
        onCancel={cancelModal}
        devices={devices}
      />
    </SafeAreaView>
  );
}