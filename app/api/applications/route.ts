import { NextResponse } from "next/server";
import { databaseErrorResponse, supabaseRequest } from "@/lib/supabase-server";

export async function GET() {
  try {
    const rows = await supabaseRequest("pays?select=*&order=id.desc");
    const data = (rows || []).map((row: any) => ({ id: row.id, ...(row.payload || {}) }));
    return NextResponse.json({ data });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}