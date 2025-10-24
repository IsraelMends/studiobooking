import React, { useMemo } from "react";
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
  const diffMinutes = (startDt.getTime() - new Date().getTime()) / 60000;
  const canConfirm = diffMinutes <= 45 && diffMinutes > 0; // só mostra até o início

  const whenLabel = useMemo(
    () => format(startDt, "EEE, dd MMM yyyy — HH:mm", { locale: ptBR }),
    [startDt]
  );

  const done = isCompleted(item.date, item.start_time);
  const isActive = item.status === "active" && !done;
  const statusIcon = item.status === "canceled" ? "cancel" : done ? "check-circle" : "schedule";
  const statusText = item.status === "canceled" ? "Cancelada" : done ? "Concluída" : "Ativa";
  const statusColor = item.status === "canceled" ? "#d1d5db" : "#10b981";
  const statusBgColor = item.status === "canceled" ? "#2a2f36" : "#0c2b24";

  const onCancel = () => handleCancel(item.id);
  const onConfirm = () => handleConfirm(item.id);

  return (
    <View style={styles.card}>
      <Text style={styles.cardDate}>{whenLabel}</Text>
      <Text style={styles.durationText}>Duração: 60 min (+10 min buffer)</Text>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <MaterialIcons name={statusIcon as any} size={16} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>

        {isActive && (() => {
          const now = new Date();
          const start = new Date(`${item.date}T${item.start_time}`);
          const diffMinutes = (start.getTime() - now.getTime()) / 60000;
          const canCancel = diffMinutes > 30; // só pode cancelar se faltar mais de 30 min

          if (!canCancel && diffMinutes <= 30) {
            Alert.alert("Aviso", "Você só pode cancelar até 30 minutos antes do horário da reserva.");
          }


          return (
            <Pressable
              onPress={canCancel ? onCancel : undefined}
              disabled={busy || !canCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  opacity: pressed || busy ? 0.7 : canCancel ? 1 : 0.5,
                  backgroundColor: canCancel ? "#ef4444" : "#6b7280" // vermelho ativo, cinza bloqueado
                }
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                canCancel
                  ? busy
                    ? "Cancelando reserva..."
                    : "Cancelar esta reserva"
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
          );
        })()}

        {isActive && canConfirm && !item.confirmed && (
          <Pressable
            onPress={() => handleConfirm(item.id)}
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

      </View>
    </View>
  );
};
