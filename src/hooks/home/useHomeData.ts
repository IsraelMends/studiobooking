import { useEffect, useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useBookings } from "~/store/booking";
import { useAuth } from "~/store/auth";

export const useHomeData = () => {
  const { myNext, loadMyNext } = useBookings();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Saudação dinâmica baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  useEffect(() => {
    loadMyNext().finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadMyNext().finally(() => setIsLoading(false));
    }, [loadMyNext])
  );

  return {
    myNext,
    profile,
    isLoading,
    getGreeting,
  };
};