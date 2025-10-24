import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useHomeData } from "~/hooks/home/useHomeData"
import {
  HomeHeader,
  NextBookingCard,
  AdminSection,
  LoadingScreen,
} from "~/components/home";

import styles from "../styles";

export default function Home() {
  const { myNext, profile, isLoading } = useHomeData();
  const router = useRouter();

  // Handlers de navegação
  const handleViewAgenda = () => router.push("/(tabs)/my-bookings");
  const handleScheduleNew = () => router.push("/(tabs)/schedule");
  const handleNavigateToUsers = () => router.push("/(admin)/users");
  const handleNavigateToReports = () => router.push("/admin/reports");
  const handleNavigateToDay = () => router.push("/(admin)/day");
  const handleNavigateToRegister = () => router.push("/(admin)/register");
  const handleNavigateToDelete = () => router.push("/(admin)/delete");

  if (isLoading) {
    return <LoadingScreen />;
  }

  const userName = profile?.name?.split(" ")[0] ?? "bem-vindo";

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader userName={userName} />
      
      {profile?.id && <NextBookingCard userId={profile.id} />}

      {profile?.role === "admin" && (
        <AdminSection
          onNavigateToUsers={handleNavigateToUsers}
          onNavigateToReports={handleNavigateToReports}
          onNavigateToDay={handleNavigateToDay}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToDelete={handleNavigateToDelete}
        />
      )}
    </SafeAreaView>
  );
}