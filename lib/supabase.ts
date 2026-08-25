// Server-side database access is handled via /lib/supabase-server.ts and API routes.
// Client-side interactions proxy through Next.js API endpoints.

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
);

export const supabase = null;

