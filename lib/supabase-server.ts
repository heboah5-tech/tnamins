import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

export function assertSupabaseConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY on the server.",
    );
  }
}

export async function supabaseRequest(
  path: string,
  init: RequestInit = {},
) {
  assertSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey!,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  return response.status === 204 ? null : response.json();
}

export function databaseErrorResponse(error: unknown) {
  console.error("[Supabase]", error);
  return NextResponse.json(
    {
      ok: false,
      error: error instanceof Error ? error.message : "Database request failed",
    },
    { status: 500 },
  );
}