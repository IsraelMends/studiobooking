import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useState } from "react";
import { BlurView } from "expo-blur";
import { confirmBooking, cancelBooking } from "~/services/bookings";
import { Alert } from "react-native";

export default function ConfirmBookingModal() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);

  if (!bookingId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Reserva não encontrada.</Text>
      </View>
    );
  }

  const handleConfirm = async () => {
    try {
      setLoading("confirm");
      await confirmBooking(bookingId);
      Alert.alert("Reserva confirmada com sucesso!");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao confirmar a reserva.");
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading("cancel");
      await cancelBooking(bookingId, "user", new Date().toISOString(), 24);
      Alert.alert("Reserva cancelada.");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao cancelar.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <BlurView intensity={60} tint="dark" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          backgroundColor: "white",
          width: "85%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "600", color: "#1f2937", textAlign: "center" }}>
          Confirmar Reserva
        </Text>

        <Text style={{ textAlign: "center", marginTop: 8, marginBottom: 16, color: "#4b5563" }}>
          Deseja confirmar ou cancelar sua reserva?
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{ marginVertical: 20 }} />
        ) : (
          <>
            <Pressable
              onPress={handleConfirm}
              style={{
                backgroundColor: "#667eea",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Confirmar</Text>
            </Pressable>

            <Pressable
              onPress={handleCancel}
              style={{
                backgroundColor: "#dc2626",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Cancelar</Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
              <Text style={{ color: "#6b7280" }}>Fechar</Text>
            </Pressable>
          </>
        )}
      </View>
    </BlurView>
  );
}
