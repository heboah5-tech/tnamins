import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl as string, supabaseKey as string, {
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  });
} else {
  console.warn(
    "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export { supabase };
export type { SupabaseClient };
