import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

function getDb() {
  if (!firebaseConfig.databaseURL) {
    throw new Error("Firebase Realtime Database URL is not configured");
  }
  const app =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig as any);
  return getDatabase(app);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, isOnline, lastActiveAt } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const db = getDb();
    await update(ref(db, `pays/${visitorId}`), {
      isOnline: isOnline ?? false,
      lastActiveAt: lastActiveAt || new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Beacon] Error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
