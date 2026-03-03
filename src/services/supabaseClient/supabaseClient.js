import { createClient } from '@supabase/supabase-js';

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '',
};

const authStorage = typeof window !== 'undefined' ? window.sessionStorage : undefined;

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
