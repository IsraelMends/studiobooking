import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { confirmBooking, cancelBooking } from "~/services/bookings";

function inWindow(startISO: string, minutesBefore = 30, graceAfter = 15) {
  const now = new Date();
  const start = new Date(startISO);
  const openAt = new Date(start.getTime() - minutesBefore * 60 * 1000);
  const closeAt = new Date(start.getTime() + graceAfter * 60 * 1000);
  return now >= openAt && now <= closeAt;
}

export function NextBookingCard({ userId }: { userId: string }) {
  const [bk, setBk] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      // próxima reserva ativa do usuário (hoje ou futura)
      const { data, error } = await supabase
        .from("bookings")
        .select("id, date, start_time, end_time, status, confirmed")
        .eq("user_id", userId)
        .in("status", ["active", "confirmed"])
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) console.error(error);
      setBk(data ?? null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [userId]);

  if (loading) return null;
  if (!bk) return <Text style={{ textAlign: "center", opacity: 1, color: "white", paddingTop: 20 }}>Sem próxima agenda.</Text>;

  const startISO = `${bk.date}T${bk.start_time}`;
  const showConfirm = bk.status === "active" && bk.confirmed === false && inWindow(startISO);

  return (
    <View style={{ padding: 16, borderRadius: 12, backgroundColor: "white" }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Sua próxima agenda</Text>
      <Text style={{ marginTop: 6 }}>
        {bk.date} • {bk.start_time.slice(0, 5)}–{bk.end_time.slice(0, 5)} • {bk.status}{bk.confirmed ? " (confirmada)" : ""}
      </Text>

      {showConfirm ? (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Pressable
            onPress={async () => {
              try { await confirmBooking(bk.id); Alert.alert("Confirmada!"); }
              catch (e: any) { Alert.alert("Erro", e.message || "Falha ao confirmar"); }
            }}
            style={{ backgroundColor: "#16a34a", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Confirmar</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                await cancelBooking(bk.id, "user", startISO, 24);
                Alert.alert("Cancelada!");
              }
              catch (e: any) { Alert.alert("Erro", e.message || "Falha ao cancelar"); }
            }}
            style={{ backgroundColor: "#dc2626", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Cancelar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={{ marginTop: 12, opacity: 0.7 }}>
          {bk.confirmed ? "Aguardando início." : "Você poderá confirmar até o início."}
        </Text>
      )}
    </View>
  );
}
