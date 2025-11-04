// ~/services/bookings.ts
import { supabase } from "~/lib/supabase";

import * as Notifications from "expo-notifications";

type DayBooking = {
  id: string;
  organization_id: string;
  user_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  buffer_until?: string | null;
  status: "active" | "completed" | "canceled";
  created_at: string;
  devices?: string[] | null; // se você salva os aparelhos
};

// Busca reservas de um dia
export async function fetchDayBookings(dateYYYYMMDD: string, orgId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, user_id, date, start_time, end_time, buffer_until, status, created_at, room_id, devices, organization_id')
    .eq('date', dateYYYYMMDD)
    .neq('status', 'canceled')
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Soma de segundos já reservados por organização naquele dia (somente status ativos)
export async function getOrgReservedSeconds(orgId: string, dateISO: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("organization_id", orgId)
    .eq("date", dateISO)
    .eq("status", "active");

  if (error) throw error;

  const toSecs = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  const total = (data ?? []).reduce((acc: number, row: any) => {
    return acc + (toSecs(row.end_time) - toSecs(row.start_time));
  }, 0);

  return total; // em segundos
}

export async function createBooking(
  orgId: string,
  userId: string,
  date: string,
  startHH: string,
  startMM: string,
  endHH: string,
  endMM: string,
  roomId: string,
  devices: string[]
) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // opcional

  const payload = {
    organization_id: orgId,
    user_id: userId,
    date,
    start_time: `${startHH}:${startMM}:00`,
    end_time: `${endHH}:${endMM}:00`,
    status: "active",
    confirmed: false,
    expires_at: expiresAt,
    room_id: roomId,
    devices: devices.join(", "),
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  // Agendamento de notificação centralizado em useBookings.loadMyUpcoming.
  // Evitar agendar aqui para não duplicar notificações.
  return data;
}

export async function confirmBooking(bookingId: string) {
  const { error } = await supabase
    .from("bookings")
    .update({ confirmed: true, status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", bookingId)
    .neq("status", "canceled"); // não confirma canceladas
  if (error) throw error;
}


export async function cancelBooking(
  bookingId: string,
  role: "admin" | "user",
  startsAtISO: string,
  cancelPolicyHours: number
) {
  if (role === "user") {
    const start = new Date(startsAtISO);
    const now = new Date();
    const diffHours = (start.getTime() - now.getTime()) / 36e5;
    if (diffHours < cancelPolicyHours) {
      throw new Error("POLICY");
    }
  }
  const { error } = await supabase
    .from("bookings")
    .update({ status: "canceled" })
    .eq("id", bookingId);
  if (error) throw error;
}

// Limpa reservas que passaram do horário de início + tolerância e seguem não confirmadas
// Cancela automaticamente reservas não confirmadas quando faltarem 30 minutos para iniciar
export async function cleanupExpiredBookings(cancelBeforeMinutes = 30) {
  const now = new Date();

  const { data, error } = await supabase
    .from("bookings")
    .select("id, date, start_time, confirmed, status")
    .in("status", ["active"]) // apenas pendentes
    .eq("confirmed", false);

  if (error) {
    console.error("Erro ao buscar reservas expiradas:", error);
    return;
  }

  for (const booking of data ?? []) {
    const start = new Date(`${booking.date}T${booking.start_time}`);
    const cutoff = new Date(start.getTime() - cancelBeforeMinutes * 60 * 1000);

    // Se já atingiu o ponto de 30 minutos antes e não foi confirmada, cancela
    if (now >= cutoff) {
      await supabase
        .from("bookings")
        .update({ status: "canceled" })
        .eq("id", booking.id);
      console.log(`Reserva ${booking.id} cancelada 30 min antes por falta de confirmação.`);
    }
  }
}

// Marca como concluídas reservas cujo fim já passou
export async function completePastBookings() {
  const now = new Date();

  const { data, error } = await supabase
    .from("bookings")
    .select("id, date, end_time, status")
    .in("status", ["active", "confirmed"]); // o que ainda está “em curso”

  if (error) {
    console.error("Erro ao buscar reservas para completar:", error);
    return;
  }

  for (const booking of data ?? []) {
    const end = new Date(`${booking.date}T${booking.end_time}`);
    if (end <= now) {
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", booking.id);
    }
  }
}
