import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, supabaseRequest } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const applicationId = new URL(request.url).searchParams.get("applicationId");
    if (!applicationId) return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    const data = await supabaseRequest(
      `messages?%22applicationId%22=eq.${encodeURIComponent(applicationId)}&select=*&order=timestamp.asc`,
    );
    return NextResponse.json({ data });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}