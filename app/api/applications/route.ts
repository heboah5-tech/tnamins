import { NextResponse } from "next/server";
import { databaseErrorResponse, supabaseRequest } from "@/lib/supabase-server";

export async function GET() {
  try {
    const data = await supabaseRequest("pays?select=*&order=createdAt.desc");
    return NextResponse.json({ data });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}