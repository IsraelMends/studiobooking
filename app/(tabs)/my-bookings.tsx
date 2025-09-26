import React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons"; // Para ícones (instale se necessário: npx expo install @expo/vector-icons)

import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // Para formatação em PT-BR
import { useFocusEffect } from "expo-router";

import { useBookings } from "~/store/booking";

type ItemProps = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm' ou 'HH:mm:ss'
  buffer_until: string;
  status: "active" | "canceled" | "completed";
};

function toDate(date: string, time: string) {
  const clean = (time || '').split('+')[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm, ss] = hhmmss.split(':').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0, 0);
}

function isCompleted(date: string, startTime: string) {
  const start = toDate(date, startTime);
  const endWithBuffer = new Date(start.getTime() + 70 * 60 * 1000);
  return new Date() >= endWithBuffer;
}


function BookingCard({ item }: { item: ItemProps }) {
  const { cancel } = useBookings();
  const [busy, setBusy] = useState(false);

  const startDt = useMemo(() => toDate(item.date, item.start_time), [item.date, item.start_time]);
  const whenLabel = useMemo(() => format(startDt, "EEE, dd MMM yyyy — HH:mm", { locale: ptBR }), [startDt]);

  const done = isCompleted(item.date, item.start_time);
  const isActive = item.status === "active" && !done;
  const statusIcon = item.status === "canceled" ? "cancel" : done ? "check-circle" : "schedule";
  const statusText = item.status === "canceled" ? "Cancelada" : done ? "Concluída" : "Ativa";
  const statusColor = item.status === "canceled" ? "#d1d5db" : "#10b981";
  const statusBgColor = item.status === "canceled" ? "#2a2f36" : "#0c2b24";

  const onCancel = () => {
    Alert.alert("Cancelar reserva", "Tem certeza que deseja cancelar esta reserva? Essa ação não pode ser desfeita.", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await cancel(item.id, "Cancelado pelo usuário");
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
            setBusy(false);
          }
        },
      },
    ]);
  };

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
          <Pressable
            onPress={onCancel}
            disabled={busy}
            style={({ pressed }) => [styles.cancelButton, { opacity: pressed || busy ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={busy ? "Cancelando reserva..." : "Cancelar esta reserva"}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="close" size={16} color="#ffffff" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function MyBookingsScreen() {
  const { myUpcoming, loadMyUpcoming } = useBookings();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado de loading inicial

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Carregando suas reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Minhas Reservas Futuras</Text>

        <FlatList
          data={myUpcoming as any[]}
          keyExtractor={(b: any) => b.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color="#9aa0a6" />
              <Text style={styles.emptyTitle}>Nenhuma reserva futura</Text>
              <Text style={styles.emptyText}>
                Você ainda não tem reservas agendadas.{" "}
                <Text style={styles.emptyLink}>Use a aba Agendar</Text> para
                criar sua primeira.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BookingCard
              item={{
                id: item.id,
                date: item.date,
                start_time: item.start_time,
                buffer_until: item.buffer_until,
                status: item.status,
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#0b0f13",
    padding: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0f13",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#11161b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardDate: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  durationText: {
    color: "#9aa0a6",
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 14,
  },
  cancelButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444", // Vermelho para ação destrutiva
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#11161b",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9aa0a6",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyLink: {
    color: "#ffffff",
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
});
