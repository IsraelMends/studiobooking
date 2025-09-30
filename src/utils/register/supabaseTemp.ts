import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "~/lib/supabase";

// NOOP STORAGE (para evitar warnings do Picker)
const noopStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

export const supabaseTemp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, storage: noopStorage as any },
});