import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { DayBookingsProps } from '~/types/schedule/schedule.types';
import { Card } from '../scheduleCard';
import { toHHMM } from '~/utils/schedule';
import styles from '../../../../app/styles';

export const DayBookings: React.FC<DayBookingsProps> = ({ bookings }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'schedule';
      case 'completed':
        return 'check-circle';
      case 'canceled':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'canceled':
        return '#ef4444';
      default:
        return '#9aa0a6';
    }
  };

  if (!bookings?.length) return null;

  return (
    <Card title="Reservas do dia">
      {bookings.map((b) => (
        <View
          key={b.id}
          style={[
            styles.bookingCard,
            { borderLeftColor: getStatusColor(b.status) },
          ]}
        >
          <MaterialIcons
            name={getStatusIcon(b.status) as any}
            size={20}
            color={getStatusColor(b.status)}
          />
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTime}>
              {toHHMM(b.start_time)} → {toHHMM(b.end_time)}
            </Text>
            <Text style={styles.bookingStatus}>{b.status}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
};