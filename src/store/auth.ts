// src/store/auth.ts
import { create } from 'zustand';
import { supabase } from '~/lib/supabase';

type Profile = {
  id: string;
  role: 'admin'|'user';
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  created_at: string;
};

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  register: (p: {name:string; email:string; phone?:string; organization?:string; password:string}) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ profile: null, loading: false }); return; }

    // tenta ler
    const got = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (got.error && got.error.code !== 'PGRST116') {
      // erro real de select
      console.log('profiles select error:', got.error);
      set({ profile: null, loading: false });
      return;
    }

    if (!got.data) {
      // ⚠️ não existe profile: cria um mínimo e lê de novo
      const displayName =
        (user.user_metadata as any)?.name ||
        (user.email?.split('@')[0] ?? 'Usuário');

      const ins = await supabase.from('profiles').insert({
        id: user.id,
        role: 'user',
        name: displayName,
        email: user.email
      });
      if (ins.error) {
        console.log('profiles insert error:', ins.error);
        set({ profile: null, loading: false });
        return;
      }

      const reread = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (reread.error) {
        console.log('profiles reread error:', reread.error);
        set({ profile: null, loading: false });
        return;
      }
      set({ profile: reread.data as any, loading: false });
      return;
    }

    set({ profile: got.data as any, loading: false });
  },

  // Registro: cria auth -> garante sessão -> insere profile -> carrega
  register: async ({ name, email, phone, organization, password }) => {
    const cleanEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
    if (error) throw error;

    let userId = data.user?.id;
    if (!data.session) {
      const s2 = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (s2.error) throw s2.error;
      userId = s2.data.user?.id;
    }
    if (!userId) throw new Error('Não foi possível obter o user id após cadastro');

    // tenta criar profile (se falhar por duplicidade, seguimos)
    const ins = await supabase.from('profiles').insert({
      id: userId,
      role: 'user',
      name,
      email: cleanEmail,
      phone,
      organization
    });
    if (ins.error && ins.error.code !== '23505') { // 23505 = unique_violation
      throw ins.error;
    }

    await get().refreshProfile();
  },

  // Login: faz auth e já puxa/cria profile se necessário
  login: async (email, password) => {
    const ok = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (ok.error) { console.log('Supabase login error:', ok.error); throw ok.error; }
    await get().refreshProfile();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ profile: null, loading: false });
  },
}));
