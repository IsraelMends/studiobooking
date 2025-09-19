// src/store/bookings.ts
import { create } from "zustand";
import { supabase } from "~/lib/supabase";
import { formatISO, isAfter } from "date-fns";

// ---------- Types ----------
export type Booking = {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm:ss' (ou 'HH:mm')
  end_time: string;
  buffer_until: string;
  status: "active" | "canceled";
  created_at: string;
  canceled_reason?: string | null;
  canceled_at?: string | null;
  // opcional (join)
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
    organization: string | null;
  } | null;
};

export type UserCard = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
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
  myUpcoming: [],
  adminUsers: [],
  selectedUserBookings: [],
  dayOverview: [],

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
      // mensagens claras para o usuário
      if (String(error.message).includes("POLICY")) {
        throw new Error(
          "Você não pode cancelar porque passou do limite da política de cancelamento."
        );
      }
      if (String(error.message).includes("FORBIDDEN")) {
        throw new Error("Você só pode cancelar as suas próprias reservas.");
      }
      throw error;
    }
    await Promise.all([get().loadMyUpcoming(), get().loadMyNext()]);
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

  // --------- User: próximas reservas ---------
  loadMyUpcoming: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ myUpcoming: [] });
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
      .order("start_time", { ascending: true });

    if (error) throw error;
    set({ myUpcoming: data || [] });
  },

  // ====================== ADMIN ======================

  // --------- Admin: listar usuários (para navegar por agendas) ---------
  loadAdminUsers: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, organization")
      .order("name", { ascending: true });

    if (error) throw error;
    set({ adminUsers: (data || []) as UserCard[] });
  },

  // --------- Admin: reservas de um usuário (todas, futuras primeiro) ---------
  loadBookingsByUser: async (userId: string) => {
    // tenta com embed (requer FK: bookings.user_id -> profiles.id)
    let query = supabase
      .from("bookings")
      .select("*, profiles:user_id (id, name, email, organization)")
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
        .select("id, name, email, organization")
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
      .select("*, profiles:user_id (id, name, email, organization)")
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
          .select("id, name, email, organization")
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
  adminCancel: async (bookingId: string, reason?: string) => {
    const { error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_reason: reason ?? "Cancelado pelo administrador",
    });
    if (error) throw error;
    // Atualize visões que você usa na tela do admin
    // (ajuste conforme a tela ativa, para não fazer chamadas desnecessárias)
    // Exemplo: recarregar visão do dia atual e lista do usuário selecionado:
    // await Promise.all([
    //   get().loadDayOverview(formatISO(new Date(), { representation:'date' })),
    //   get().loadBookingsByUser(<userIdSelecionado>)
    // ]);
    await get().loadDayOverview(
      formatISO(new Date(), { representation: "date" })
    );
    await get().loadBookingsByUser(bookingId);
  },
}));
