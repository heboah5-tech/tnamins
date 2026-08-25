import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

// In-memory fallback database for development when Supabase credentials are not provided
const mockStorage = {
  pays: new Map<string, { id: string; payload: Record<string, any>; isOnline?: boolean; lastActiveAt?: string }>(),
  messages: new Map<string, Record<string, any>>(),
  settings: new Map<string, { id: string; payload: Record<string, any> }>(),
};

export function isSupabaseConfiguredServer(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function assertSupabaseConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "[AI Studio] Supabase not configured — using in-memory mock store. Set SUPABASE_URL and SUPABASE_SECRET_KEY to connect live database.",
    );
  }
}

function handleMockRequest(path: string, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const body = init.body ? JSON.parse(init.body as string) : null;
  const decodedPath = decodeURIComponent(path);

  // Determine collection name
  let collection: "pays" | "messages" | "settings" = "pays";
  if (decodedPath.startsWith("messages")) collection = "messages";
  else if (decodedPath.startsWith("settings")) collection = "settings";

  const store = mockStorage[collection];

  // DELETE
  if (method === "DELETE") {
    const idMatch = decodedPath.match(/id=eq\.([^&]+)/);
    if (idMatch) {
      store.delete(idMatch[1]);
    }
    return [];
  }

  // PATCH
  if (method === "PATCH") {
    const idMatch = decodedPath.match(/id=eq\.([^&]+)/);
    if (idMatch && body) {
      const existing = store.get(idMatch[1]);
      if (existing) {
        store.set(idMatch[1], { ...existing, ...body });
      } else {
        store.set(idMatch[1], { id: idMatch[1], payload: {}, ...body } as any);
      }
    }
    return [];
  }

  // POST (insert or upsert)
  if (method === "POST") {
    if (collection === "messages") {
      const msgId = body?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newMsg = { ...body, id: msgId };
      store.set(msgId, newMsg);
      return [newMsg];
    }

    if (body?.id) {
      const existing = store.get(body.id);
      const updated = {
        id: body.id,
        payload: { ...(existing?.payload || {}), ...(body.payload || body.data || body) },
        ...body,
      };
      delete updated.data;
      store.set(body.id, updated as any);
      return [updated];
    }
    return [];
  }

  // GET
  if (method === "GET") {
    // Single ID lookup
    const idMatch = decodedPath.match(/id=eq\.([^&]+)/);
    if (idMatch) {
      const item = store.get(idMatch[1]);
      return item ? [item] : [];
    }

    // Messages by applicationId
    const appMatch = decodedPath.match(/applicationId["']?\s*=\s*eq\.([^&]+)/i) || decodedPath.match(/applicationId=eq\.([^&]+)/);
    if (appMatch) {
      const appId = appMatch[1].replace(/["']/g, "");
      const msgs = Array.from(store.values()).filter((m: any) => m.applicationId === appId);
      return msgs.sort((a: any, b: any) => (a.timestamp || "").localeCompare(b.timestamp || ""));
    }

    // List all
    return Array.from(store.values());
  }

  return [];
}

export async function supabaseRequest(
  path: string,
  init: RequestInit = {},
) {
  if (!supabaseUrl || !serviceRoleKey) {
    assertSupabaseConfig();
    return handleMockRequest(path, init);
  }

  try {
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
      if (response.status === 401 || detail.includes("JWT") || detail.includes("PGRST303")) {
        console.warn("[Supabase] 401 or JWT issue (e.g. JWT issued at future). Falling back to mock store:", detail);
        return handleMockRequest(path, init);
      }
      throw new Error(`Supabase request failed (${response.status}): ${detail}`);
    }

    return response.status === 204 ? null : response.json();
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes("JWT") || msg.includes("PGRST303") || msg.includes("401") || msg.includes("fetch failed")) {
      console.warn("[Supabase] Request error falling back to mock store:", msg);
      return handleMockRequest(path, init);
    }
    throw error;
  }
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