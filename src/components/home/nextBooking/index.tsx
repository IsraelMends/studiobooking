import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { supabase } from "~/lib/supabase";
import { confirmBooking, cancelBooking } from "~/services/bookings";

function inWindow(startISO: string) {
  const now = new Date();
  const start = new Date(startISO);
  const openAt = new Date(start.getTime() - 60 * 60 * 1000); // 60 min antes
  // Mostrar a partir de 1h antes até o início
  return now >= openAt && now < start;
}

export function NextBookingCard({ userId }: { userId: string }) {
  const [bk, setBk] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

      // busca reservas que ainda não terminaram
      const { data, error } = await supabase
        .from("bookings")
        .select("id, date, start_time, end_time, status, confirmed")
        .eq("user_id", userId)
        .in("status", ["active", "confirmed"])
        .or(`date.gt.${today},and(date.eq.${today},end_time.gt.${currentTime})`)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) console.error(error);
      setBk(data ?? null);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) return null;
  if (!bk)
    return (
      <Text
        style={{
          textAlign: "center",
          opacity: 1,
          color: "white",
          paddingTop: 20,
        }}
      >
        Sem próxima agenda.
      </Text>
    );

  const startISO = `${bk.date}T${bk.start_time}`;
  const showConfirm =
    bk.status === "active" && bk.confirmed === false && inWindow(startISO);

  return (
    <View style={{ padding: 16, borderRadius: 12, backgroundColor: "white" }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        Sua próxima agenda
      </Text>
      <Text style={{ marginTop: 6 }}>
        {bk.date} • {bk.start_time.slice(0, 5)}–{bk.end_time.slice(0, 5)} •{" "}
        {bk.status}
        {bk.confirmed ? " (confirmada)" : ""}
      </Text>

      {showConfirm ? (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Pressable
            onPress={async () => {
              try {
                await confirmBooking(bk.id);
                Alert.alert("Confirmada!");
              } catch (e: any) {
                Alert.alert("Erro", e.message || "Falha ao confirmar");
              }
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
              } catch (e: any) {
                Alert.alert("Erro", e.message || "Falha ao cancelar");
              }
            }}
            style={{ backgroundColor: "#dc2626", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Cancelar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={{ marginTop: 12, opacity: 0.7 }}>
          {bk.confirmed
            ? "Aguardando início."
            : "O botão de confirmar aparecerá 1 hora antes do início."}
        </Text>
      )}
    </View>
  );
}
