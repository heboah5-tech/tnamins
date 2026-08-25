/**
 * Firestore-compatible shim backed by Supabase (Postgres + Realtime).
 *
 * Provides drop-in replacements for the small subset of `firebase/firestore`
 * APIs used in this project so call sites can keep their existing shape
 * while data is read from / written to Supabase.
 *
 * Data model: each "collection" is a Postgres table with two columns:
 *   - id   text primary key
 *   - data jsonb   (the full document object)
 * Realtime listeners use Supabase Realtime (postgres_changes).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type Firestore = SupabaseClient;

export interface DocRef {
  __isDocRef: true;
  client: SupabaseClient;
  table: string;
  id: string;
}

export interface CollectionRef {
  __isCollectionRef: true;
  client: SupabaseClient;
  table: string;
}

export interface QueryConstraint {
  __type: "where" | "orderBy" | "limit";
  field?: string;
  op?: string;
  value?: any;
  dir?: "asc" | "desc";
  count?: number;
}

export interface QueryRef {
  __isQueryRef: true;
  collection: CollectionRef;
  filters: Array<{ field: string; op: string; value: any }>;
  ordering?: { field: string; dir: "asc" | "desc" };
  limit?: number;
}

export class DocSnapshot {
  constructor(
    private _exists: boolean,
    private _data: any,
    public id: string,
  ) {}
  exists() {
    return this._exists;
  }
  data() {
    return this._data;
  }
}

export class QuerySnapshot {
  constructor(public docs: DocSnapshot[]) {}
  get size() {
    return this.docs.length;
  }
  get empty() {
    return this.docs.length === 0;
  }
  forEach(cb: (doc: DocSnapshot) => void) {
    this.docs.forEach(cb);
  }
}

export function doc(
  client: SupabaseClient,
  table: string,
  id?: string,
): DocRef {
  if (!table) throw new Error("doc() requires a table");
  if (!id) throw new Error("doc() requires a document id");
  return { __isDocRef: true, client, table, id };
}

export function collection(
  client: SupabaseClient,
  table: string,
): CollectionRef {
  if (!table) throw new Error("collection() requires a table");
  return { __isCollectionRef: true, client, table };
}

/** Recursively strip `undefined` (not valid JSON) before persisting. */
function sanitize(value: any): any {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((v) => (v === undefined ? null : sanitize(v)));
  }
  if (typeof value === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      cleaned[k] = sanitize(v);
    }
    return cleaned;
  }
  return value;
}

export async function getDoc(docRef: DocRef): Promise<DocSnapshot> {
  const { data, error } = await docRef.client
    .from(docRef.table)
    .select("id, data")
    .eq("id", docRef.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return new DocSnapshot(false, undefined, docRef.id);
  return new DocSnapshot(true, (data as any).data ?? {}, docRef.id);
}

export async function setDoc(
  docRef: DocRef,
  data: any,
  options?: { merge?: boolean },
): Promise<void> {
  const cleaned = sanitize(data) ?? {};
  let finalData = cleaned;

  if (options?.merge) {
    // Shallow-merge top-level keys with the existing document, matching
    // Firestore { merge: true } semantics.
    const existing = await getDoc(docRef);
    const base = existing.exists() ? existing.data() ?? {} : {};
    finalData = { ...base, ...cleaned };
  }

  const { error } = await docRef.client
    .from(docRef.table)
    .upsert({ id: docRef.id, data: finalData }, { onConflict: "id" });
  if (error) throw error;
}

export async function updateDoc(docRef: DocRef, data: any): Promise<void> {
  // updateDoc merges into the existing document.
  await setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: DocRef): Promise<void> {
  const { error } = await docRef.client
    .from(docRef.table)
    .delete()
    .eq("id", docRef.id);
  if (error) throw error;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function addDoc(
  colRef: CollectionRef,
  data: any,
): Promise<DocRef> {
  const id = generateId();
  const cleaned = sanitize(data) ?? {};
  const { error } = await colRef.client
    .from(colRef.table)
    .insert({ id, data: cleaned });
  if (error) throw error;
  return { __isDocRef: true, client: colRef.client, table: colRef.table, id };
}

export function where(
  field: string,
  op: string,
  value: any,
): QueryConstraint {
  return { __type: "where", field, op, value };
}

export function orderBy(
  field: string,
  dir: "asc" | "desc" = "asc",
): QueryConstraint {
  return { __type: "orderBy", field, dir };
}

export function limit(count: number): QueryConstraint {
  return { __type: "limit", count };
}

export function query(
  colRef: CollectionRef,
  ...constraints: QueryConstraint[]
): QueryRef {
  const q: QueryRef = {
    __isQueryRef: true,
    collection: colRef,
    filters: [],
  };
  for (const c of constraints) {
    if (c.__type === "where") {
      q.filters.push({ field: c.field!, op: c.op!, value: c.value });
    } else if (c.__type === "orderBy") {
      q.ordering = { field: c.field!, dir: c.dir ?? "asc" };
    } else if (c.__type === "limit") {
      q.limit = c.count;
    }
  }
  return q;
}

/**
 * Document fields live inside the `data` jsonb column, so filtering/ordering
 * is applied in memory against each document's data — identical semantics to
 * the previous shim.
 */
function applyFilters(
  rawDocs: DocSnapshot[],
  filters: Array<{ field: string; op: string; value: any }>,
  ordering?: { field: string; dir: "asc" | "desc" },
  limitCount?: number,
): DocSnapshot[] {
  let docs = rawDocs.filter((d) => {
    const data = d.data() ?? {};
    return filters.every((f) => {
      const dv = data?.[f.field];
      switch (f.op) {
        case "==":
          return dv === f.value;
        case "!=":
          return dv !== f.value;
        case ">":
          return dv > f.value;
        case "<":
          return dv < f.value;
        case ">=":
          return dv >= f.value;
        case "<=":
          return dv <= f.value;
        case "in":
          return Array.isArray(f.value) && f.value.includes(dv);
        case "not-in":
          return Array.isArray(f.value) && !f.value.includes(dv);
        case "array-contains":
          return Array.isArray(dv) && dv.includes(f.value);
        default:
          return true;
      }
    });
  });

  if (ordering) {
    const dirMul = ordering.dir === "desc" ? -1 : 1;
    docs.sort((a, b) => {
      const av = (a.data() as any)?.[ordering.field];
      const bv = (b.data() as any)?.[ordering.field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1 * dirMul;
      if (bv == null) return -1 * dirMul;
      if (av < bv) return -1 * dirMul;
      if (av > bv) return 1 * dirMul;
      return 0;
    });
  }

  if (typeof limitCount === "number") {
    docs = docs.slice(0, limitCount);
  }

  return docs;
}

async function fetchAll(colRef: CollectionRef): Promise<DocSnapshot[]> {
  const { data, error } = await colRef.client
    .from(colRef.table)
    .select("id, data");
  if (error) throw error;
  return (data ?? []).map(
    (row: any) => new DocSnapshot(true, row.data ?? {}, row.id),
  );
}

function unpackTarget(target: CollectionRef | QueryRef) {
  let colRef: CollectionRef;
  let filters: Array<{ field: string; op: string; value: any }> = [];
  let ordering: { field: string; dir: "asc" | "desc" } | undefined;
  let limitCount: number | undefined;

  if ((target as CollectionRef).__isCollectionRef) {
    colRef = target as CollectionRef;
  } else {
    const q = target as QueryRef;
    colRef = q.collection;
    filters = q.filters;
    ordering = q.ordering;
    limitCount = q.limit;
  }
  return { colRef, filters, ordering, limitCount };
}

let channelCounter = 0;

type ListenerTarget = DocRef | CollectionRef | QueryRef;

export function onSnapshot(
  target: ListenerTarget,
  next: (snap: any) => void,
  err?: (e: Error) => void,
): () => void {
  // Single document listener
  if ((target as DocRef).__isDocRef) {
    const docRef = target as DocRef;

    // Emit current value immediately.
    getDoc(docRef)
      .then((snap) => next(snap))
      .catch((e) => err && err(e as Error));

    const channel = docRef.client
      .channel(`doc:${docRef.table}:${docRef.id}:${++channelCounter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: docRef.table,
          filter: `id=eq.${docRef.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "DELETE") {
            next(new DocSnapshot(false, undefined, docRef.id));
          } else {
            const row = payload.new;
            next(new DocSnapshot(true, row?.data ?? {}, docRef.id));
          }
        },
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" && err) {
          err(new Error("Supabase realtime channel error"));
        }
      });

    return () => {
      docRef.client.removeChannel(channel);
    };
  }

  // Collection or query listener
  const { colRef, filters, ordering, limitCount } = unpackTarget(
    target as CollectionRef | QueryRef,
  );

  const emit = () => {
    fetchAll(colRef)
      .then((rawDocs) => {
        const docs = applyFilters(rawDocs, filters, ordering, limitCount);
        next(new QuerySnapshot(docs));
      })
      .catch((e) => err && err(e as Error));
  };

  // Emit current value immediately, then refetch on any change to the table.
  emit();

  const channel = colRef.client
    .channel(`col:${colRef.table}:${++channelCounter}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: colRef.table },
      () => emit(),
    )
    .subscribe((status: string) => {
      if (status === "CHANNEL_ERROR" && err) {
        err(new Error("Supabase realtime channel error"));
      }
    });

  return () => {
    colRef.client.removeChannel(channel);
  };
}

export async function getDocs(
  target: CollectionRef | QueryRef,
): Promise<QuerySnapshot> {
  const { colRef, filters, ordering, limitCount } = unpackTarget(target);
  const rawDocs = await fetchAll(colRef);
  const docs = applyFilters(rawDocs, filters, ordering, limitCount);
  return new QuerySnapshot(docs);
}

export function serverTimestamp(): string {
  return new Date().toISOString();
}

export function arrayUnion(...elements: any[]) {
  return { __op: "arrayUnion", elements };
}

export function arrayRemove(...elements: any[]) {
  return { __op: "arrayRemove", elements };
}

export class Timestamp {
  constructor(public seconds: number, public nanoseconds: number) {}
  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }
  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }
  static now(): Timestamp {
    const ms = Date.now();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }
  static fromDate(d: Date): Timestamp {
    const ms = d.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }
}
