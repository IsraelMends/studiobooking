import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Troque aqui pelas suas credenciais
const SUPABASE_URL = "https://ybanoxwifcqwjzctpods.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYW5veHdpZmNxd2p6Y3Rwb2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjY2MTcsImV4cCI6MjA3MzgwMjYxN30.yqy4FJAbmfYd5QnwxoJD8FOSloV6tH4ZCvE5fY5i26s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
