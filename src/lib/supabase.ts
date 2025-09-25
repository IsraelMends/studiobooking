// ~/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

export const SUPABASE_URL =
  Constants.expoConfig?.extra?.SUPABASE_URL ?? Constants.manifest?.extra?.SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? Constants.manifest?.extra?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('SUPABASE_URL não configurado');
if (!SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY não configurado');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});
