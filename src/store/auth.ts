// src/store/auth.ts
import { create } from "zustand";
import { supabase } from "~/lib/supabase";

type Profile = {
  id: string;
  role: "admin" | "user";
  name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  created_at: string;
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
    organization?: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,

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

  // ✅ Garante que SEMPRE exista uma linha em `profiles` para o usuário logado
  refreshProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ profile: null, loading: false });
      return;
    }

    // helper: transforma vazio/espacos em null
    const nz = (v?: any) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };

    // metadata do auth
    const m = (user.user_metadata ?? {}) as any;
    const metaName = nz(m.name);
    const metaPhone = nz(m.phone);
    const metaOrg = nz(m.organization);
    const metaRole = nz(m.role) ?? "user";

    // lê profiles
    const sel = await supabase
      .from("profiles")
      .select("id, role, name, email, phone, organization, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (sel.error && sel.error.code !== "PGRST116") {
      console.log("profiles select error:", sel.error);
      set({ profile: null, loading: false });
      return;
    }

    // se não existe profile: cria já normalizando e usando fallback do metadata
    if (!sel.data) {
      const displayName = metaName ?? user.email?.split("@")[0] ?? "Usuário";
      const ins = await supabase.from("profiles").insert({
        id: user.id,
        role: metaRole,
        name: displayName,
        email: user.email,
        phone: metaPhone,
        organization: metaOrg,
      });
      if (ins.error) {
        console.log("profiles insert error:", ins.error);
        set({ profile: null, loading: false });
        return;
      }
      const reread = await supabase
        .from("profiles")
        .select("id, role, name, email, phone, organization, created_at")
        .eq("id", user.id)
        .single();
      if (reread.error) {
        console.log("profiles reread error:", reread.error);
        set({ profile: null, loading: false });
        return;
      }
      set({ profile: reread.data as any, loading: false });
      return;
    }

    // existe profile: normalize e aplique fallback também quando for string vazia
    const row = sel.data as any;
    const rowName = nz(row.name);
    const rowPhone = nz(row.phone);
    const rowOrg = nz(row.organization);
    const rowRole = nz(row.role) ?? "user";

    const next = {
      id: row.id,
      role: rowRole ?? metaRole ?? "user",
      name: rowName ?? metaName ?? user.email?.split("@")[0] ?? "Usuário",
      email: nz(row.email) ?? user.email,
      phone: rowPhone ?? metaPhone,
      organization: rowOrg ?? metaOrg, // 👈 agora vazio cai pro metadata
      created_at: row.created_at,
    };

    // backfill se faltou algum campo (null OU vazio)
    const needsUpdate =
      (rowName == null && next.name != null) ||
      (rowPhone == null && next.phone != null) ||
      (rowOrg == null && next.organization != null) ||
      (rowRole == null && next.role != null);

    if (needsUpdate) {
      const upd = await supabase
        .from("profiles")
        .update({
          name: next.name,
          phone: next.phone,
          organization: next.organization,
          role: next.role,
        })
        .eq("id", user.id);
      if (upd.error) console.log("profiles update(backfill) error:", upd.error);
    }

    set({ profile: next as any, loading: false });
  },

  // Registro: cria auth -> garante sessão -> insere profile -> carrega
  register: async ({ name, email, phone, organization, password }) => {
    const cleanEmail = String(email).trim().toLowerCase();

    // 1) salvar metadados no usuário
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name, phone, organization, role: "user" }, // ← grava no user_metadata
      },
    });
    if (error) throw error;

    // 2) garantir sessão (se o projeto exige confirmação de email, isso pode não vir)
    let userId = data.user?.id;
    if (!data.session) {
      const s2 = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (s2.error) throw s2.error;
      userId = s2.data.user?.id;
    }
    if (!userId)
      throw new Error("Não foi possível obter o user id após cadastro");

    // 3) upsert na tabela profiles (id = auth.user.id)
    const up = await supabase.from("profiles").upsert({
      id: userId,
      role: "user",
      name,
      email: cleanEmail,
      phone,
      organization,
    });
    if (up.error) throw up.error;

    await get().refreshProfile();
  },

  // Login: faz auth e já puxa/cria profile se necessário
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
