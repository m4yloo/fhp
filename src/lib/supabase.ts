import { createClient } from "@supabase/supabase-js";

const PLACEHOLDER_URL = "your-project-url.supabase.co";
const PLACEHOLDER_KEY = "your-anon-key";

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured =
  Boolean(rawUrl && rawUrl !== PLACEHOLDER_URL && rawUrl.startsWith("https://")) &&
  Boolean(rawKey && rawKey !== PLACEHOLDER_KEY);

export const supabaseConfigurationError = isSupabaseConfigured
  ? null
  : "Prihlásenie momentálne nie je nakonfigurované. Chýba verejná konfigurácia Supabase.";

// createClient validates its arguments synchronously. These inert values keep the
// application renderable while the UI presents the real configuration problem.
const url = isSupabaseConfigured ? rawUrl : "https://invalid.supabase.co";
const publicKey = isSupabaseConfigured ? rawKey : "invalid-public-key";

export const supabase = createClient(url, publicKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
