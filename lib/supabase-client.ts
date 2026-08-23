export type DocumentReference = { collection: string; id: string };

export type DocumentSnapshot = {
  id: string;
  exists: () => boolean;
  data: () => Record<string, any>;
};

export const db = { provider: "supabase" };
export type Firestore = typeof db;

export function doc(_database: unknown, collection: string, id: string): DocumentReference {
  return { collection, id };
}

async function request(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: Record<string, any>,
): Promise<any> {
  const response = await fetch("/api/data", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
      if (!stopped) onNext(await getDoc(reference));
    } catch (error) {
      if (!stopped) onError?.(error instanceof Error ? error : new Error("Database request failed"));
    }
    if (!stopped) timer = setTimeout(poll, 2000);
  };

  void poll();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

export async function addData(data: Record<string, any>) {
  if (!data.id) throw new Error("A visitor id is required");
  return setDoc(doc(db, "pays", data.id), { ...data, isUnread: true }, { merge: true });
}

export async function getData(id: string) {
  const snapshot = await getDoc(doc(db, "pays", id));
  return snapshot.exists() ? snapshot.data() : null;
}

export function logAnalyticsEvent(_eventName: string, _params: Record<string, any> = {}) {
  // Analytics intentionally stays server-side with the database migration.
}