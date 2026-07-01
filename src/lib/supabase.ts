import { createClient } from "@supabase/supabase-js";

const PLACEHOLDER_URL = "your-project-url.supabase.co";
const PLACEHOLDER_KEY = "your-anon-key";

// Valid-format fallbacks so the app boots locally before .env is filled in.
const DEV_URL = "https://placeholder.supabase.co";
const DEV_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(rawUrl && rawUrl !== PLACEHOLDER_URL) &&
  Boolean(rawKey && rawKey !== PLACEHOLDER_KEY);

const url = isSupabaseConfigured ? rawUrl : DEV_URL;
const anonKey = isSupabaseConfigured ? rawKey : DEV_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Using dev placeholders — auth and data will not work until .env is configured."
  );
}

export const supabase = createClient(url, anonKey);
