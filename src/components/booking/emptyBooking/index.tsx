import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EmptyBookingsProps } from '~/types/booking/booking.types';
import { styles } from '~/components/booking/styles';

export const EmptyBookings: React.FC<EmptyBookingsProps> = () => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={48} color="#9aa0a6" />
      <Text style={styles.emptyTitle}>Nenhuma reserva futura</Text>
      <Text style={styles.emptyText}>
        Você ainda não tem reservas agendadas.{" "}
        <Text style={styles.emptyLink}>Use a aba Agendar</Text> para
        criar sua primeira.
      </Text>
    </View>
  );
};