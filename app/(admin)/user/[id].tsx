// app/(admin)/user/[id].tsx
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";

import { useBookings } from "~/store/booking";
import { useAuth } from "~/store/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** ---- Helpers de data sem drift de fuso ---- */
// cria Date local a partir de 'YYYY-MM-DD' + 'HH:mm'/'HH:mm:ss'
function toDate(date: string, time: string) {
  const clean = (time || "").split("+")[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss] = hhmmss.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0, 0);
}
// sessão concluída quando (início + 70 min)
function isDone(date: string, startTime: string) {
  const start = toDate(date, startTime);
  const endWithBuffer = new Date(start.getTime() + 70 * 60 * 1000);
  return new Date() >= endWithBuffer;
}

/** ---- Linha da lista (ADMIN pode cancelar) ---- */
function BookingRow({
  item,
  onCancelPress,
}: {
  item: {
    id: string;
    date: string;
    start_time: string;
    status: "active" | "canceled" | "completed";
    profiles?: { name?: string | null; email?: string | null; organization_id?: string | null } | null;
  };
  onCancelPress: (id: string) => Promise<void>;
}) {
  const startDt = useMemo(
    () => toDate(item.date, item.start_time),
    [item.date, item.start_time]
  );
  const whenLabel = useMemo(
    () => format(startDt, "EEE, dd MMM yyyy — HH:mm", { locale: ptBR }),
    [startDt]
  );
  const [busy, setBusy] = useState(false);

  const done = isDone(item.date, item.start_time);
  const isCanceled = item.status === "canceled";
  const isActive = item.status === "active" && !done;

  const owner =
    item.profiles?.name ??
    item.profiles?.email ??
    "Usuário";
  const org = item.profiles?.organization_id;

  const badgeText = isCanceled ? "Cancelada" : done ? "Concluída" : "Ativa";
  const badgeIcon = isCanceled ? "cancel" : done ? "check-circle" : "schedule";
  const badgeColor = isCanceled ? "#d1d5db" : "#10b981";
  const badgeBg = isCanceled ? "#2a2f36" : "#0c2b24";

  const handleCancel = () => {
    Alert.alert(
      "Cancelar reserva",
      `Tem certeza que deseja cancelar esta reserva para ${owner}?`,
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await onCancelPress(item.id);
            } catch (e: any) {
              const msg = String(e?.message || e);
              if (msg.includes("ALREADY_COMPLETED")) {
                Alert.alert("Aviso", "Esta reserva já foi concluída.");
              } else if (msg.includes("FORBIDDEN")) {
                Alert.alert("Acesso negado", "Apenas admin ou o dono pode cancelar.");
              } else {
                Alert.alert("Erro", msg);
              }
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ backgroundColor: "#11161b", padding: 14, borderRadius: 12, marginBottom: 10 }}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{whenLabel}</Text>
      <Text style={{ color: "#9aa0a6", marginTop: 4 }}>
        Status: <Text style={{ color: "#fff" }}>{badgeText}</Text>
      </Text>
      {!!org && (
        <Text style={{ color: "#9aa0a6", marginTop: 2 }}>
          Organização: <Text style={{ color: "#fff" }}>{org}</Text>
        </Text>
      )}

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" }}>
        <Text style={{ color: "#9aa0a6" }}>
          Usuário: <Text style={{ color: "#fff" }}>{owner}</Text>
        </Text>

        <View style={{ flex: 1 }} />

        {/* Badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: badgeBg,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            marginRight: 8,
            gap: 4,
          }}
        >
          <Icon name={badgeIcon as any} size={16} color={badgeColor} />
          <Text style={{ color: badgeColor, fontWeight: "700", fontSize: 12 }}>{badgeText}</Text>
        </View>

        {/* Botão Cancelar só se ativa e não concluída */}
        {isActive && (
          <Pressable
            onPress={handleCancel}
            disabled={busy}
            style={{
              backgroundColor: "#ef4444",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "800" }}>Cancelar</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function AdminUserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { selectedUserBookings, loadBookingsByUser, adminCancel } = useBookings();

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    await loadBookingsByUser(id); // garanta que sua store não converta date para ISO UTC
  }, [id, loadBookingsByUser]);

  useFocusEffect(
    useCallback(() => {
      setInitialLoading(true);
      refresh().finally(() => setInitialLoading(false));
    }, [refresh])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  if (profile?.role !== "admin") return null;

  const handleAdminCancel = async (bookingId: string) => {
    await adminCancel(bookingId, "Cancelado pelo administrador");
    await refresh();
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0f13", padding: 16 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: "#9aa0a6", marginTop: 8 }}>Carregando reservas do usuário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0f13" }}>
      <View style={{ flex: 1, backgroundColor: "#0b0f13", padding: 16 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
          Agendas do usuário
        </Text>

        <FlatList
          data={selectedUserBookings as any[]}
          keyExtractor={(b: any) => b.id}
          renderItem={({ item }) => <BookingRow item={item} onCancelPress={handleAdminCancel} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          ListEmptyComponent={
            <View style={{ padding: 20, backgroundColor: "#11161b", borderRadius: 12 }}>
              <Text style={{ color: "#9aa0a6" }}>Este usuário não possui reservas.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
