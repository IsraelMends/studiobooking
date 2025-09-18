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
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      set({ profile: data as any, loading: false });
    } else {
      set({ profile: null, loading: false });
    }
    supabase.auth.onAuthStateChange(async (_evt, sess) => {
      if (sess?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', sess.user.id).single();
        set({ profile: data as any, loading: false });
      } else {
        set({ profile: null, loading: false });
      }
    });
  },
  register: async ({ name, email, phone, organization, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const uid = data.user?.id;
    if (!uid) throw new Error('No user id');
    const { error: e2 } = await supabase.from('profiles').insert({
      id: uid, role: 'user', name, email, phone, organization
    });
    if (e2) throw e2;
  },
  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  logout: async () => {
    await supabase.auth.signOut();
  },
}));
