import React from 'react';
import { FlatList, RefreshControl } from 'react-native';

import { BookingsListProps } from '~/types/booking/booking.types';
import { BookingCard } from '../bookingCard';
import { EmptyBookings } from '../emptyBooking';
import { styles } from '~/components/booking/styles';

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  refreshing,
  onRefresh,
}) => {
  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ffffff"
          colors={["#ffffff"]}
        />
      }
      ListEmptyComponent={<EmptyBookings />}
      renderItem={({ item }) => <BookingCard item={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};