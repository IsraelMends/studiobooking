// app/(admin)/day.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatISO, format, startOfDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useBookings } from "~/store/booking";
import { useAuth } from "~/store/auth";

/** Constrói Date localmente a partir de 'YYYY-MM-DD' fixando 12:00 (evita TZ/UTC) */
function dateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0); // 12h local
}

/** Helper: cria Date a partir de 'YYYY-MM-DD' + 'HH:mm'/'HH:mm:ss' (local) */
function toDate(date: string, time: string) {
  const clean = (time || "").split("+")[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  // Isso cria Date local (sem UTC) e evita drift
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss] = hhmmss.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0, 0);
}

/** Sessão concluída? (início + 60 + 10 buffer = 70 min) */
function isDone(date: string, startTime: string) {
  const start = toDate(date, startTime);
  const endWithBuffer = new Date(start.getTime() + 70 * 60 * 1000);
  return new Date() >= endWithBuffer;
}

/** Linha/Cartão de reserva para ADMIN */
function AdminBookingRow({
  item,
  onCanceled,
}: {
  item: {
    id: string;
    date: string;
    start_time: string;
    status: "active" | "canceled" | "completed";
    profiles?: { name?: string | null; email?: string | null; organization_id?: string};
  };
  onCanceled: () => Promise<void>;
}) {
  const { adminCancel } = useBookings();
  const [busy, setBusy] = useState(false);

  const start = useMemo(() => toDate(item.date, item.start_time), [item.date, item.start_time]);
  const labelHour = useMemo(() => format(start, "HH:mm", { locale: ptBR }), [start]);
  const fullLabel = useMemo(
    () => format(start, "EEE, dd MMM yyyy — HH:mm", { locale: ptBR }),
    [start]
  );

  const done = isDone(item.date, item.start_time);
  const isCanceled = item.status === "canceled";
  const isActive = item.status === "active" && !done;

  const owner = item.profiles?.name ?? item.profiles?.email ?? "Usuário";

  const badgeText = isCanceled ? "Cancelada" : done ? "Concluída" : "Ativa";
  const badgeIcon = isCanceled ? "cancel" : done ? "check-circle" : "schedule";
  const badgeColor = isCanceled ? "#d1d5db" : "#10b981";
  const badgeBg = isCanceled ? "#2a2f36" : "#0c2b24";

  const handleAdminCancel = () => {
    Alert.alert(
      "Cancelar reserva",
      `Cancelar a reserva de ${owner} às ${labelHour}?`,
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await adminCancel(item.id, "Cancelado pelo administrador");
              await onCanceled();
            } catch (e: any) {
              const msg = String(e?.message || e);
              if (msg.includes("ALREADY_COMPLETED")) {
                Alert.alert("Aviso", "Esta reserva já foi concluída.");
              } else if (msg.includes("FORBIDDEN")) {
                Alert.alert("Acesso negado", "Apenas admin ou dono pode cancelar.");
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
    <View
      style={{
        backgroundColor: "#11161b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{labelHour}</Text>
        <Text style={{ color: "#9aa0a6", fontSize: 12 }}>{fullLabel}</Text>
      </View>

      <Text style={{ color: "#9aa0a6", marginTop: 4, fontSize: 14 }}>Dono: {owner}</Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: badgeBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Icon name={badgeIcon as any} size={16} color={badgeColor} />
          <Text style={{ color: badgeColor, marginLeft: 4, fontWeight: "700", fontSize: 12 }}>
            {badgeText}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {isActive && (
          <Pressable
            onPress={handleAdminCancel}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: "#ef4444",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              opacity: busy || pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={`Cancelar reserva de ${owner}`}
          >
            {busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>Cancelar</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function AdminDay() {
  const { profile } = useAuth();
  const { dayOverview, loadDayOverview } = useBookings();

  // Normaliza "hoje" para 00:00 local e guarda como string 'YYYY-MM-DD' (não use toISOString aqui)
  const [date, setDate] = useState(() => {
    const today = startOfDay(new Date());
    return formatISO(today, { representation: "date" }); // 'YYYY-MM-DD'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use dateFromYMD para evitar drift na exibição do cabeçalho
  const formattedDate = format(dateFromYMD(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await loadDayOverview(date); // <- use a string como veio (nada de toISOString na store)
    } finally {
      setLoading(false);
    }
  }, [date, loadDayOverview]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleDateChange = useCallback((_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const normalized = startOfDay(selectedDate);
      const iso = formatISO(normalized, { representation: "date" }); // 'YYYY-MM-DD'
      setDate(iso); // apenas muda o estado; o useEffect/refresh recarrega
    }
  }, []);

  // Carrega ao iniciar e sempre que 'date' muda
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (profile?.role !== "admin") return null;

  if (loading && !dayOverview?.length) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0f13", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#9aa0a6", marginTop: 8 }}>Carregando reservas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0f13", padding: 16 }}>
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "800", textAlign: "center" }}>
          Reservas do dia — {formattedDate}
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 8, alignItems: "center", justifyContent: "center" }}>
          {/* Dia anterior */}
          <Pressable
            onPress={async () => {
              const curr = dateFromYMD(date);
              const prev = addDays(curr, -1);
              const iso = formatISO(startOfDay(prev), { representation: "date" });
              setDate(iso);
              await loadDayOverview(iso);
            }}
            style={({ pressed }) => ({
              backgroundColor: "#20232a",
              padding: 12,
              borderRadius: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Dia anterior"
          >
            <Icon name="chevron-left" size={20} color="#fff" />
          </Pressable>

          {/* Selecionar data */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => ({
              backgroundColor: "#20232a",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar data: ${formattedDate}`}
          >
            <Icon name="event" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>Alterar data</Text>
          </Pressable>

          {/* Próximo dia */}
          <Pressable
            onPress={async () => {
              const curr = dateFromYMD(date);
              const next = addDays(curr, 1);
              const iso = formatISO(startOfDay(next), { representation: "date" });
              setDate(iso);
              await loadDayOverview(iso);
            }}
            style={({ pressed }) => ({
              backgroundColor: "#20232a",
              padding: 12,
              borderRadius: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Próximo dia"
          >
            <Icon name="chevron-right" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* DatePicker: passe um Date SEM UTC, usando dateFromYMD */}
      {showDatePicker && (
        <DateTimePicker
          value={dateFromYMD(date)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}

      <FlatList
        data={dayOverview as any[]}
        keyExtractor={(b: any) => b.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={["#10b981"]} />
        }
        ListEmptyComponent={
          <View style={{ padding: 24, backgroundColor: "#11161b", borderRadius: 12, alignItems: "center" }}>
            <Icon name="event-busy" size={48} color="#9aa0a6" />
            <Text style={{ color: "#9aa0a6", fontSize: 16, marginTop: 8, textAlign: "center" }}>
              Sem reservas para este dia.
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 4, textAlign: "center" }}>
              Tente outro dia ou atualize a lista.
            </Text>
          </View>
        }
        renderItem={({ item }) => <AdminBookingRow item={item} onCanceled={refresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
