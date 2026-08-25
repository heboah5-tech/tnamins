import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, supabaseRequest } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, isOnline, lastActiveAt } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await supabaseRequest(`pays?id=eq.${encodeURIComponent(visitorId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        isOnline: isOnline ?? false,
        lastActiveAt: lastActiveAt || new Date().toISOString(),
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return databaseErrorResponse(e);
  }
}
