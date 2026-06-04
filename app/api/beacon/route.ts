import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured");
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, isOnline, lastActiveAt } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = getClient();

    // Merge online status into the existing document's jsonb data.
    const { data: existing } = await supabase
      .from("pays")
      .select("data")
      .eq("id", visitorId)
      .maybeSingle();

    const merged = {
      ...((existing as any)?.data ?? {}),
      isOnline: isOnline ?? false,
      lastActiveAt: lastActiveAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("pays")
      .upsert({ id: visitorId, data: merged }, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Beacon] Error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
