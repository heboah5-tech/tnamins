import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, supabaseRequest } from "@/lib/supabase-server";

const allowedCollections = new Set(["pays", "messages", "settings"]);

function validateCollection(collection: unknown): asserts collection is string {
  if (typeof collection !== "string" || !allowedCollections.has(collection)) {
    throw new Error("Invalid database collection");
  }
}

function validateId(id: unknown): asserts id is string {
  if (typeof id !== "string" || !id || id.length > 200) {
    throw new Error("Invalid database record id");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    const id = searchParams.get("id");
    validateCollection(collection);
    validateId(id);
    const rows = await supabaseRequest(
      `${collection}?id=eq.${encodeURIComponent(id)}&select=*`,
    );
    const row = rows?.[0] || null;
    return NextResponse.json({
      data: row && collection !== "messages" ? { id: row.id, ...(row.payload || {}) } : row,
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, collection, id, data, merge = true } = body;
    validateCollection(collection);
    validateId(id);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid database payload");
    }

    if (operation === "insert") {
      const rows = await supabaseRequest(collection, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return NextResponse.json({ data: rows?.[0] || null });
    }

    if (operation === "get") {
      const rows = await supabaseRequest(
        `${collection}?id=eq.${encodeURIComponent(id)}&select=*`,
      );
      const row = rows?.[0] || null;
      return NextResponse.json({
        data: row && collection !== "messages" ? { id: row.id, ...(row.payload || {}) } : row,
      });
    }

    if (operation !== "upsert") throw new Error("Invalid database operation");

    if (collection === "messages") {
      const rows = await supabaseRequest(collection, {
        method: "POST",
        body: JSON.stringify({ id, ...data }),
      });
      return NextResponse.json({ data: rows?.[0] || null });
    }

    const existingRows = await supabaseRequest(
      `${collection}?id=eq.${encodeURIComponent(id)}&select=payload`,
    );
    const payload = merge
      ? { ...(existingRows?.[0]?.payload || {}), ...data }
      : data;
    const rows = await supabaseRequest(`${collection}?on_conflict=id`, {
      method: "POST",
      body: JSON.stringify({ id, payload }),
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    });
    return NextResponse.json({ data: rows?.[0] || null });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    validateCollection(body.collection);
    validateId(body.id);
    await supabaseRequest(
      `${body.collection}?id=eq.${encodeURIComponent(body.id)}`,
      { method: "DELETE" },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}