import { create } from "zustand";
import { supabase } from "~/lib/supabase";

type Profile = {
  is_admin: any;
  id: string;
  role: "admin" | "user";
  name: string | null;
  email: string | null;
  phone: string | null;
  organization_id: string | null;
  created_at: string;
  confirmed_at?: string;
};

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  register: (p: {
    name: string;
    email: string;
    phone?: string;
    organization_id?: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,

  // Inicializa sessão e observa mudanças no estado de autenticação
  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await get().refreshProfile();
    } else {
      set({ profile: null, loading: false });
    }

    supabase.auth.onAuthStateChange(async (_evt, sess) => {
      if (sess?.user) {
        await get().refreshProfile();
      } else {
        set({ profile: null, loading: false });
      }
    });
  },

  // Atualiza / cria o profile sempre que o usuário loga
  refreshProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ profile: null, loading: false });
      return;
    }

    const nz = (v?: any) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };

    const m = (user.user_metadata ?? {}) as any;
    const metaName = nz(m.name);
    const metaPhone = nz(m.phone);
    const metaOrg = nz(m.organization_id);
    const metaRole = nz(m.role) ?? "user";

    const sel = await supabase
      .from("profiles")
      .select("id, role, name, email, phone, organization_id, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (sel.error && sel.error.code !== "PGRST116") {
      console.log("profiles select error:", sel.error);
      set({ profile: null, loading: false });
      return;
    }

    if (!sel.data) {
      const displayName = metaName ?? user.email?.split("@")[0] ?? "Usuário";
      const ins = await supabase.from("profiles").insert({
        id: user.id,
        role: metaRole,
        name: displayName,
        email: user.email,
        phone: metaPhone,
        organization_id: metaOrg,
      });

      if (ins.error) {
        console.log("profiles insert error:", ins.error);
        set({ profile: null, loading: false });
        return;
      }
    }

    const reread = await supabase
      .from("profiles")
      .select("id, role, name, email, phone, organization_id, created_at")
      .eq("id", user.id)
      .single();

    if (reread.error) {
      console.log("profiles reread error:", reread.error);
      set({ profile: null, loading: false });
      return;
    }

    const row = reread.data as any;
    const next = {
      id: row.id,
      role: row.role ?? metaRole ?? "user",
      name: row.name ?? metaName ?? user.email?.split("@")[0] ?? "Usuário",
      email: nz(row.email) ?? user.email,
      phone: row.phone ?? metaPhone,
      organization_id: row.organization_id ?? metaOrg,
      created_at: row.created_at,
    };

    set({ profile: next as any, loading: false });
  },

register: async ({ name, email, phone, organization_id, password }) => {
  const cleanEmail = String(email).trim().toLowerCase();

  console.log("📩 Criando usuário via Edge Function admin_create_user...");

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/admin-create-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name,
        phone,
        organization_id,
      }),
    }
  );

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Falha ao criar usuário: ${result.error || res.statusText}`
    );
  }

  const userId = result.uid;
  if (!userId) throw new Error("Usuário criado, mas id não retornado.");
  console.log("✅ Usuário criado name::", name);

  // Cria o perfil localmente (tabela profiles)
  const up = await supabase.from("profiles").upsert({
    id: userId,
    role: "user",
    name,
    email: cleanEmail,
    phone,
    organization_id,
  });

  if (up.error) throw up.error;

  console.log("✅ Perfil criado para usuário:", userId);
},




  // Login direto (sem exigir e-mail confirmado)
  login: async (email, password) => {
    const ok = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (ok.error) {
      console.log("Supabase login error:", ok.error);
      throw ok.error;
    }

    await get().refreshProfile();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ profile: null, loading: false });
  },
}));
