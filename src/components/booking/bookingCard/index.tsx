import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BookingCardProps } from "~/types/booking/booking.types";
import { toDate, isCompleted } from "~/utils/date";
import { useBookingActions } from "~/hooks/booking/useBookingActions";
import { styles } from "~/components/booking/styles";

export const BookingCard: React.FC<BookingCardProps> = ({ item }) => {
  const { handleCancel, handleConfirm, isItemBusy } = useBookingActions();
  const busy = isItemBusy(item.id);

  const startDt = useMemo(
    () => toDate(item.date, item.start_time),
    [item.date, item.start_time]
  );

  const [diffMinutes, setDiffMinutes] = useState(
    (startDt.getTime() - new Date().getTime()) / 60000
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDiffMinutes((startDt.getTime() - new Date().getTime()) / 60000);
    }, 60000);
    return () => clearInterval(interval);
  }, [startDt]);

  const done = isCompleted(item.date, item.start_time);
  const isCancelled = item.status === "canceled";
  const isActive =
    !isCancelled && item.status !== "completed" && !done;

  const canCancel = isActive && diffMinutes > 30; 
  const canConfirm =
    isActive && !item.confirmed && diffMinutes <= 60 && diffMinutes > 0;

  const whenLabel = useMemo(
    () => format(startDt, "EEEE, dd MMM yyyy — HH:mm", { locale: ptBR }),
    [startDt]
  );

  const statusIcon = isCancelled
    ? "cancel"
    : done
      ? "check-circle"
      : "schedule";
  const statusText = isCancelled
    ? "Cancelada"
    : done
      ? "Concluída"
      : "Ativa";
  const statusColor = isCancelled ? "#d1d5db" : "#10b981";
  const statusBgColor = isCancelled ? "#2a2f36" : "#0c2b24";

  const onCancel = () => {
    if (!canCancel) {
      Alert.alert(
        "Aviso",
        "Você só pode cancelar até 30 minutos antes do horário da reserva."
      );
      return;
    }
    handleCancel(item.id);
  };

  const onConfirm = () => handleConfirm(item.id);

  return (
    <View style={styles.card}>
      <Text style={styles.cardDate}>{whenLabel}</Text>
      <Text style={styles.durationText}>Duração: 60 min (+10 min tolerância)</Text>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <MaterialIcons
            name={statusIcon as any}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Botões de ação (somente se ativo e não cancelado) */}
        {isActive && !isCancelled && (
          <>
            {/* Confirmar */}
            {canConfirm && (
              <Pressable
                onPress={onConfirm}
                disabled={busy}
                style={({ pressed }) => [
                  styles.confirmButton,
                  { opacity: pressed || busy ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirmar reserva"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={16} color="#ffffff" />
                    <Text style={styles.cancelButtonText}>Confirmar</Text>
                  </>
                )}
              </Pressable>
            )}

            {/* Cancelar */}
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  opacity: pressed || busy ? 0.7 : 1,
                  backgroundColor: canCancel ? "#ef4444" : "#6b7280",
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                canCancel
                  ? "Cancelar esta reserva"
                  : "Cancelamento indisponível (menos de 30 min antes)"
              }
            >
              {busy ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="close" size={16} color="#ffffff" />
                  <Text style={styles.cancelButtonText}>
                    {canCancel ? "Cancelar" : "Indisponível"}
                  </Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};
