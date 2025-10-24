import { useState } from 'react';
import { Alert } from 'react-native';
import { useBookings } from '~/store/booking';
import { confirmBooking } from "~/services/bookings";

export const useBookingActions = () => {
  const { cancel } = useBookings();
  const [busyItems, setBusyItems] = useState<Set<string>>(new Set());

  const handleCancel = async (itemId: string) => {
    Alert.alert(
      "Cancelar reserva",
      "Tem certeza que deseja cancelar esta reserva? Essa ação não pode ser desfeita.",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyItems(prev => new Set(prev).add(itemId));
              await cancel(itemId, "Cancelado pelo usuário");
            } catch (e: any) {
              const msg = String(e?.message || e);
              if (msg.includes("ALREADY_COMPLETED")) {
                Alert.alert("Aviso", "Esta reserva já foi concluída.");
              } else if (msg.includes("FORBIDDEN")) {
                Alert.alert("Acesso Negado", "Você só pode cancelar as suas próprias reservas.");
              } else {
                Alert.alert("Erro ao Cancelar", msg || "Tente novamente mais tarde.");
              }
            } finally {
              setBusyItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      Alert.alert("Reserva confirmada", "Sua reserva foi confirmada com sucesso!");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao confirmar a reserva.");
    }
  };

  const isItemBusy = (itemId: string) => busyItems.has(itemId);

  return {
    handleCancel,
    handleConfirm,
    isItemBusy,
  };
};