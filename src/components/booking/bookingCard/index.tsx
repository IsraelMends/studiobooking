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

        {isActive && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* ✅ Botão Confirmar (só aparece se ainda não foi confirmada) */}
            {!item.confirmed && (
              <Pressable
                onPress={onConfirm}
                disabled={busy}
                style={({ pressed }) => [
                  styles.confirmButton,
                  { opacity: pressed || busy ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirmar esta reserva"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={16} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </>
                )}
              </Pressable>
            )}

            {/* ❌ Botão Cancelar */}
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={({ pressed }) => [
                styles.cancelButton,
                { opacity: pressed || busy ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancelar esta reserva"
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="close" size={16} color="#fff" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};
