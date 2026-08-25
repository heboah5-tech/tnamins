import { getCookie } from "./cookies";

export type DocumentReference = { collection: string; id: string };

export type DocumentSnapshot = {
  id: string;
  exists: () => boolean;
  data: () => Record<string, any>;
};

export const db = { provider: "server-api" };
export type Firestore = typeof db;
export type DatabaseInstance = typeof db;

export function doc(
  param1: unknown,
  param2: string,
  param3?: string,
): DocumentReference {
  if (typeof param3 === "string") {
    // Called as doc(db, collection, id)
    return { collection: param2, id: param3 };
  }
  // Called as doc(collection, id)
  return { collection: String(param1), id: param2 };
}

export function sanitizeForJson(value: any, seen = new WeakSet()): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") {
    if (typeof value === "function" || typeof value === "symbol") return undefined;
    if (typeof value === "bigint") return value.toString();
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  // Duck typing for DOM node, React Fiber, SyntheticEvent, Window, Document
  if (
    typeof value.nodeType === "number" ||
    typeof value.tagName === "string" ||
    typeof value.nodeName === "string" ||
    typeof value.preventDefault === "function" ||
    typeof value.stopPropagation === "function" ||
    value.nativeEvent !== undefined ||
    value.ownerDocument !== undefined ||
    value.defaultView !== undefined ||
    value.$typeof !== undefined ||
    value._owner !== undefined ||
    value.stateNode !== undefined ||
    value.memoizedProps !== undefined ||
    value.memoizedState !== undefined ||
    (value.return !== undefined && value.child !== undefined) ||
    (value.target !== undefined && value.currentTarget !== undefined && value.type !== undefined)
  ) {
    return undefined;
  }

  // Cross-realm safe DOM element / Window / Document check
  try {
    const tag = Object.prototype.toString.call(value);
    if (
      tag.includes("Element") ||
      tag.includes("HTML") ||
      tag.includes("Node") ||
      tag.includes("Window") ||
      tag.includes("Document") ||
      tag.includes("Event") ||
      tag.includes("Location") ||
      tag.includes("Promise")
    ) {
      return undefined;
    }
  } catch {}

  // Circular reference detection
  if (seen.has(value)) {
    return undefined;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForJson(item, seen))
      .filter((item) => item !== undefined);
  }

  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (
      k.startsWith("__react") ||
      k.startsWith("$") ||
      k.startsWith("_owner") ||
      k === "stateNode" ||
      k === "return" ||
      k === "child" ||
      k === "sibling" ||
      k === "memoizedProps" ||
      k === "memoizedState" ||
      k === "target" ||
      k === "currentTarget" ||
      k === "nativeEvent" ||
      k === "view"
    ) {
      continue;
    }
    const sanitized = sanitizeForJson(v, seen);
    if (sanitized !== undefined) {
      cleanObj[k] = sanitized;
    }
  }
  return cleanObj;
}

export function safeJsonStringify(data: any): string {
  try {
    const seen = new WeakSet();
    const cleaned = sanitizeForJson(data, seen);
    const jsonSeen = new WeakSet();
    return JSON.stringify(cleaned, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (
          value.nodeType !== undefined ||
          value.tagName !== undefined ||
          value.nodeName !== undefined ||
          value.$typeof !== undefined ||
          value.stateNode !== undefined ||
          value.memoizedProps !== undefined ||
          key.startsWith("__react") ||
          key.startsWith("$") ||
          key === "stateNode"
        ) {
          return undefined;
        }
        if (jsonSeen.has(value)) {
          return undefined;
        }
        jsonSeen.add(value);
      }
      return value;
    });
  } catch (err) {
    console.warn("[supabase-client] Safe JSON fallback used:", err);
    try {
      const fallbackObj: Record<string, any> = {};
      if (typeof data === "object" && data !== null) {
        for (const k of Object.keys(data)) {
          const val = data[k];
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            fallbackObj[k] = val;
          }
        }
      }
      return JSON.stringify(fallbackObj);
    } catch {
      return "{}";
    }
  }
}

async function request(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: Record<string, any>,
): Promise<any> {
  const payload = safeJsonStringify(body);
  const response = await fetch("/api/data", {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Database request failed");
  }
  return result;
}

export async function setDoc(
  reference: DocumentReference,
  data: Record<string, any>,
  options: { merge?: boolean } = {},
) {
  return request("POST", {
    operation: "upsert",
    collection: reference.collection,
    id: reference.id,
    data,
    merge: options.merge !== false,
  });
}

export async function updateDoc(
  reference: DocumentReference,
  data: Record<string, any>,
) {
  return setDoc(reference, data, { merge: true });
}

export async function getDoc(reference: DocumentReference): Promise<DocumentSnapshot> {
  const result = await request("POST", {
    operation: "get",
    collection: reference.collection,
    id: reference.id,
  });
  return {
    id: reference.id,
    exists: () => Boolean(result.data),
    data: () => result.data || {},
  };
}

export function onSnapshot(
  reference: DocumentReference,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: (error: Error) => void,
) {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    try {
      if (!stopped) {
        const docSnap = await getDoc(reference);
        if (!stopped) onNext(docSnap);
      }
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (!msg.includes("Failed to fetch") && !msg.includes("NetworkError")) {
        if (!stopped) onError?.(error instanceof Error ? error : new Error("Database request failed"));
      } else {
        console.warn("[onSnapshot] Transient network error:", msg);
      }
    }
    if (!stopped) timer = setTimeout(poll, 3000);
  };

  void poll();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

export async function addData(data: Record<string, any>) {
  if (!data || typeof data !== "object") return;
  if (data.nativeEvent || typeof data.preventDefault === "function" || data.target || data.currentTarget) {
    console.warn("[addData] Received event object instead of data record. Ignoring event.");
    return;
  }
  const sanitized = sanitizeForJson(data) || {};
  const visitorId = sanitized.id || getCookie("visitor") || "visitor_" + Math.random().toString(36).substring(2, 9);
  sanitized.id = visitorId;

  const reference = doc(db, "pays", visitorId);
  const existing = await getDoc(reference);
  const previousSteps = Array.isArray(existing.data().stepHistory)
    ? existing.data().stepHistory
    : [];
  const stepSnapshot = {
    page: sanitized.currentPage || null,
    step: sanitized.currentStep || null,
    submittedAt: new Date().toISOString(),
    data: sanitized,
  };

  return setDoc(
    reference,
    {
      ...sanitized,
      isUnread: true,
      stepHistory: [...previousSteps, stepSnapshot].slice(-50),
    },
    { merge: true },
  );
}

export async function getData(id: string) {
  const snapshot = await getDoc(doc(db, "pays", id));
  return snapshot.exists() ? snapshot.data() : null;
}

export function logAnalyticsEvent(_eventName: string, _params: Record<string, any> = {}) {
  // Analytics intentionally stays server-side with the database migration.
}