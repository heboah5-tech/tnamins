/**
 * Firestore-compatible shim backed by Firebase Realtime Database.
 *
 * Provides drop-in replacements for the small subset of `firebase/firestore`
 * APIs used in this project so call sites can keep their existing shape
 * while data is read from / written to the Realtime Database.
 */

import {
  ref as rtdbRef,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  type Database,
} from "firebase/database";

export type Firestore = Database;

export interface DocRef {
  __isDocRef: true;
  db: Database;
  path: string;
  id: string;
}

export interface CollectionRef {
  __isCollectionRef: true;
  db: Database;
  path: string;
  id: string;
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

function joinPath(parts: string[]): string {
  return parts.filter(Boolean).join("/");
}

export function doc(db: Database, ...pathParts: string[]): DocRef {
  if (pathParts.length === 0) throw new Error("doc() requires a path");
  const path = joinPath(pathParts);
  const id = pathParts[pathParts.length - 1];
  return { __isDocRef: true, db, path, id };
}

export function collection(db: Database, ...pathParts: string[]): CollectionRef {
  if (pathParts.length === 0) throw new Error("collection() requires a path");
  const path = joinPath(pathParts);
  const id = pathParts[pathParts.length - 1];
  return { __isCollectionRef: true, db, path, id };
}

function sanitizeForRTDB(value: any): any {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((v) => (v === undefined ? null : sanitizeForRTDB(v)));
  }
  if (typeof value === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      // RTDB disallows these characters in keys: . # $ / [ ]
      const safeKey = k.replace(/[.#$/\[\]]/g, "_");
      cleaned[safeKey] = sanitizeForRTDB(v);
    }
    return cleaned;
  }
  return value;
}

export async function getDoc(docRef: DocRef): Promise<DocSnapshot> {
  const snap = await get(rtdbRef(docRef.db, docRef.path));
  return new DocSnapshot(snap.exists(), snap.val(), docRef.id);
}

export async function setDoc(
  docRef: DocRef,
  data: any,
  options?: { merge?: boolean },
): Promise<void> {
  const cleaned = sanitizeForRTDB(data);
  const r = rtdbRef(docRef.db, docRef.path);
  if (options?.merge) {
    // RTDB update only updates listed top-level keys (shallow merge),
    // matching Firestore { merge: true } semantics for top-level fields.
    await update(r, cleaned ?? {});
  } else {
    await set(r, cleaned);
  }
}

export async function updateDoc(docRef: DocRef, data: any): Promise<void> {
  await update(rtdbRef(docRef.db, docRef.path), sanitizeForRTDB(data) ?? {});
}

export async function deleteDoc(docRef: DocRef): Promise<void> {
  await remove(rtdbRef(docRef.db, docRef.path));
}

export async function addDoc(
  colRef: CollectionRef,
  data: any,
): Promise<DocRef> {
  const newRef = push(rtdbRef(colRef.db, colRef.path));
  await set(newRef, sanitizeForRTDB(data));
  return {
    __isDocRef: true,
    db: colRef.db,
    path: `${colRef.path}/${newRef.key}`,
    id: newRef.key as string,
  };
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

function snapshotToDocs(rawVal: any): DocSnapshot[] {
  if (!rawVal || typeof rawVal !== "object") return [];
  return Object.entries(rawVal).map(
    ([id, data]) => new DocSnapshot(true, data, id),
  );
}

type ListenerTarget = DocRef | CollectionRef | QueryRef;

export function onSnapshot(
  target: ListenerTarget,
  next: (snap: any) => void,
  err?: (e: Error) => void,
): () => void {
  // Single document listener
  if ((target as DocRef).__isDocRef) {
    const docRef = target as DocRef;
    const unsub = onValue(
      rtdbRef(docRef.db, docRef.path),
      (snap) => {
        next(new DocSnapshot(snap.exists(), snap.val(), docRef.id));
      },
      err
        ? (e) => err(e as unknown as Error)
        : undefined,
    );
    return unsub;
  }

  // Collection or query listener
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

  const unsub = onValue(
    rtdbRef(colRef.db, colRef.path),
    (snap) => {
      const rawDocs = snapshotToDocs(snap.val());
      const docs = applyFilters(rawDocs, filters, ordering, limitCount);
      next(new QuerySnapshot(docs));
    },
    err ? (e) => err(e as unknown as Error) : undefined,
  );
  return unsub;
}

export async function getDocs(
  target: CollectionRef | QueryRef,
): Promise<QuerySnapshot> {
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

  const snap = await get(rtdbRef(colRef.db, colRef.path));
  const rawDocs = snapshotToDocs(snap.val());
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
