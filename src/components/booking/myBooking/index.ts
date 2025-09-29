import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useBookings } from '~/store/booking';

export const useMyBookings = () => {
  const { myUpcoming, loadMyUpcoming } = useBookings();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadMyUpcoming().finally(() => setIsLoading(false));
    }, [loadMyUpcoming])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMyUpcoming();
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [loadMyUpcoming]);

  return {
    myUpcoming,
    refreshing,
    isLoading,
    onRefresh,
  };
};