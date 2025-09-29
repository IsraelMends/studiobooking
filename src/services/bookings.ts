// ~/services/bookings.ts
import { supabase } from "~/lib/supabase";

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
    .eq('organization_id', orgId)
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

// Cria reserva (60min + 10min buffer, ajuste se quiser)
export async function createBooking(
  userId: string,
  orgId: string,               // <- novo parâmetro
  dateYYYYMMDD: string,
  startHHMM: string,
  devices: string[],
  roomId = 'default'
) {
  // calcula fim +60min (ajuste se sua duração for outra)
  const [h, m] = startHHMM.split(':').map(Number);
  const end = new Date(2000, 0, 1, h, m);
  end.setMinutes(end.getMinutes() + 60);
  const endHH = String(end.getHours()).padStart(2, '0');
  const endMM = String(end.getMinutes()).padStart(2, '0');

  const payload = {
    user_id: userId,
    organization_id: orgId,     // <- ESSENCIAL
    date: dateYYYYMMDD,
    start_time: `${startHHMM}:00`,
    end_time: `${endHH}:${endMM}:00`,
    status: 'active',
    room_id: roomId,
    devices: devices.join(', '), // (ou use JSONB, se preferir)
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
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
