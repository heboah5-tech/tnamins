import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp, Firestore } from "@/lib/firestore-shim";

function getDb(): Firestore {
  if (!db) throw new Error("Supabase not configured")
  return db as Firestore
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const onlyNumbers = (value: string) => {
  return value.replace(/[^\d٠-٩]/g, '');
};

export const setupOnlineStatus = (userId: string) => {
  if (!userId || !db) return;

  const userDocRef = doc(getDb(), "pays", userId);

  setDoc(
    userDocRef,
    {
      online: true,
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  ).catch((error) =>
    console.error("Error updating online status:", error),
  );
};

export const setUserOffline = async (userId: string) => {
  if (!userId || !db) return;

  try {
    await setDoc(
      doc(getDb(), "pays", userId),
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};
