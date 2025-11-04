// src/store/bookings.ts
import { create } from "zustand";
import { supabase } from "~/lib/supabase";
import { formatISO, isAfter } from "date-fns";
import * as Notifications from "expo-notifications";

// ---------- Types ----------
export type Booking = {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm:ss' (ou 'HH:mm')
  end_time: string;
  buffer_until: string;
  status: "active" | "canceled" | "completed";
  created_at: string;
  canceled_reason?: string | null;
  canceled_at?: string | null;
  // opcional (join)
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
    organization_id: string | null;
  } | null;
};

export type UserCard = {
  id: string;
  name: string | null;
  email: string | null;
  organization_id: string | null;
};

export interface BookingState {
  // User-side
  slots: string[];
  myNext: Booking | null;
  myUpcoming: Booking[];
  loadSlots: (dateISO: string) => Promise<void>;
  create: (dateISO: string, startHHmm: string) => Promise<void>;
  cancel: (bookingId: string, reason?: string) => Promise<void>;
  loadMyNext: () => Promise<void>;
  loadMyUpcoming: () => Promise<void>;

  // Admin-side
  adminUsers: UserCard[];
  selectedUserBookings: Booking[];
  dayOverview: Booking[]; // reservas de um dia (todas, com dono)
  loadAdminUsers: () => Promise<void>;
  loadBookingsByUser: (userId: string) => Promise<void>;
  loadDayOverview: (dateISO: string) => Promise<void>;
  adminCancel: (bookingId: string, reason?: string) => Promise<void>;
}

function normalizeTimeToIso(dateStr: string, timeStr: string) {
  // aceita HH:mm ou HH:mm:ss (+ possivel timezone) e retorna um ISO local coerente
  const clean = (timeStr || "").split("+")[0]; // remove +00 caso venha
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  return new Date(`${dateStr}T${hhmmss}`);
}

export const useBookings = create<BookingState>((set, get) => ({
  // --------- State inicial ---------
  slots: [],
  myNext: null,
  myUpcoming: [] as Booking[],
  adminUsers: [],
  selectedUserBookings: [],
  dayOverview: [],

  loadMyUpcoming: async () => {
    // 1) pega usuário logado
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const user = userRes.user;
    if (!user) throw new Error("Not authenticated");

    // 2) data de hoje como 'YYYY-MM-DD' (não use toISOString)
    const todayStr = formatISO(new Date(), { representation: "date" });

    // 3) busca SOMENTE desse usuário e SOMENTE futuras/hoje
    //    (se quiser filtrar por horário do mesmo dia, crie uma view com start_at timestamp)
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", todayStr)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    const upcoming = data ?? [];
    set({ myUpcoming: upcoming });

    // Agenda notificações locais 30 min antes do início para cada reserva futura
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const alreadyScheduled = new Set(
        scheduled
          .map((n) => (n?.content?.data as any)?.bookingId)
          .filter(Boolean)
      );

      for (const b of upcoming) {
        const start = normalizeTimeToIso(b.date, b.start_time);
        if (start.getTime() <= Date.now()) continue; // ignora passadas
        if (alreadyScheduled.has(b.id)) continue; // já agendada

        // Notificação para abrir a janela de confirmação (1h antes)
        const notifyOpen = new Date(start.getTime() - 60 * 60 * 1000);
        if (notifyOpen.getTime() > Date.now()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Confirme sua reserva",
              body: `A confirmação está disponível por 30 minutos. Início às ${String(b.start_time).slice(0, 5)}.`,
              data: { bookingId: b.id, date: b.date, start_time: b.start_time },
            },
            trigger: { date: notifyOpen } as any,
          });
        }

        // Notificação 30 min antes (último aviso)
        const notifyLast = new Date(start.getTime() - 30 * 60 * 1000);
        if (notifyLast.getTime() > Date.now()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Último aviso",
              body: `Faltam 30 min. Não confirmando, a reserva será cancelada.`,
              data: { bookingId: b.id, date: b.date, start_time: b.start_time },
            },
            trigger: { date: notifyLast } as any,
          });
        }
      }
    } catch (e) {
      // logging básico apenas
      console.log("Falha ao agendar notificações de reservas:", e);
    }
  },

  // --------- User: gerar slots de um dia ---------
  loadSlots: async (dateISO) => {
    const { data, error } = await supabase.rpc("get_available_slots", {
      p_date: dateISO,
    });
    if (error) throw error;
    const slots = (data || []).map((t: string) => t.slice(0, 5)); // HH:mm
    set({ slots });
  },

  // --------- User: criar reserva (usa RPC com todas as regras) ---------
  create: async (dateISO, startHHmm) => {
    const { error } = await supabase.rpc("create_booking", {
      p_date: dateISO,
      p_start: `${startHHmm}:00`,
    });
    if (error) throw error;
    await Promise.all([get().loadMyUpcoming(), get().loadMyNext()]);
  },

  // --------- User/Admin: cancelar (RPC respeita política; admin sempre pode) ---------
  cancel: async (bookingId, reason) => {
    const { error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_reason: reason ?? null,
    });
    if (error) {
      const msg = String(error.message || error);
      if (msg.includes("ALREADY_COMPLETED")) {
        throw new Error("Esta reserva já foi concluída.");
      }
      if (msg.includes("FORBIDDEN")) {
        throw new Error("Você só pode cancelar as suas próprias reservas.");
      }
      throw error;
    }
    await get().loadMyUpcoming();
  },

  // --------- User: próxima reserva futura ---------
  loadMyNext: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ myNext: null });
      return;
    }

    const todayStr = formatISO(new Date(), { representation: "date" });
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("date", todayStr)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(50);
    if (error) throw error;

    const now = new Date();
    const next =
      (data || []).find((b) => {
        const start = normalizeTimeToIso(b.date, b.start_time);
        return isAfter(start, now);
      }) || null;

    set({ myNext: next });
  },

  // ====================== ADMIN ======================

  // --------- Admin: listar usuários (para navegar por agendas) ---------
  loadAdminUsers: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, organization_id")
      .order("name", { ascending: true });

    if (error) throw error;
    set({ adminUsers: (data || []) as unknown as UserCard[] });
  },

  // --------- Admin: reservas de um usuário (todas, futuras primeiro) ---------
  loadBookingsByUser: async (userId: string) => {
    // tenta com embed (requer FK: bookings.user_id -> profiles.id)
    let query = supabase
      .from("bookings")
      .select("*, profiles:user_id (id, name, email, organization_id)")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    let { data, error } = await query;
    if (error && error.code === "PGRST200") {
      // Fallback: sem FK/embed; faz select simples e depois merge manual
      const b = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (b.error) throw b.error;

      const prof = await supabase
        .from("profiles")
        .select("id, name, email, organization_id")
        .eq("id", userId)
        .single();

      const withOwner = (b.data || []).map((it) => ({
        ...it,
        profiles: prof.data ?? null,
      }));

      set({ selectedUserBookings: withOwner as any });
      return;
    }

    if (error) throw error;
    set({ selectedUserBookings: (data || []) as any });
  },

  // --------- Admin: visão do dia (todas as reservas com dono) ---------
  loadDayOverview: async (dateISO: string) => {
    // com embed (requer FK)
    let q = supabase
      .from("bookings")
      .select("*, profiles:user_id (id, name, email, organization_id)")
      .eq("date", dateISO)
      .order("start_time", { ascending: true });

    let { data, error } = await q;
    if (error && error.code === "PGRST200") {
      // fallback sem FK
      const b = await supabase
        .from("bookings")
        .select("*")
        .eq("date", dateISO)
        .order("start_time", { ascending: true });
      if (b.error) throw b.error;

      const userIds = Array.from(new Set((b.data || []).map((x) => x.user_id)));
      let owners: Record<string, UserCard> = {};
      if (userIds.length) {
        const p = await supabase
          .from("profiles")
          .select("id, name, email, organization_id")
          .in("id", userIds);
        if (p.error) throw p.error;
        (p.data || []).forEach((u) => {
          owners[u.id] = u as any;
        });
      }
      const joined = (b.data || []).map((it) => ({
        ...it,
        profiles: owners[it.user_id] ?? null,
      }));
      set({ dayOverview: joined as any });
      return;
    }

    if (error) throw error;
    set({ dayOverview: (data || []) as any });
  },

  // --------- Admin: cancelar (mesmo RPC; admin sempre pode) ---------
  adminCancel: async (bookingId, reason) => {
    // É o MESMO RPC; o backend libera para admin automaticamente
    const { error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_reason: reason ?? "Cancelado pelo administrador",
    });
    if (error) {
      const msg = String(error.message || error);
      if (msg.includes("ALREADY_COMPLETED")) {
        throw new Error("Esta reserva já foi concluída.");
      }
      throw error;
    }
    await get().loadMyUpcoming();
  },
}));
