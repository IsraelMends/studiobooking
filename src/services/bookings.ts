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
export async function fetchDayBookings(dateISO: string): Promise<DayBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, organization_id, user_id, date, start_time, end_time, buffer_until, status, created_at, devices"
    )
    .eq("date", dateISO)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DayBooking[];
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
  organizationId: string,
  userId: string,
  dateISO: string,
  startHHMM: string,
  devices: string[]
) {
  // calcula fim (60min) e buffer (10min)
  const [h, m] = startHHMM.split(":").map(Number);
  const start = new Date(`${dateISO}T${startHHMM}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const buffer = new Date(end.getTime() + 10 * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, "0");
  const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const insertData = {
       organization_id: organizationId,
       user_id: userId,
       date: dateISO,
       start_time: startHHMM,
       end_time: hhmm(end),
       buffer_until: `${dateISO} ${hhmm(buffer)}`,
       status: "active",
       devices, // Mantenha por enquanto
     };
     console.log('Objeto sendo inserido:', JSON.stringify(insertData, null, 2)); // Isso mostra tudo em detalhes
     const { error } = await supabase.from("bookings").insert(insertData);
     if (error) {
       console.error('Erro completo:', error);
       throw error;
     }
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
