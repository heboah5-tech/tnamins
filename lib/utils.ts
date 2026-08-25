import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./supabase-client";
import { doc, setDoc, Firestore } from "./supabase-client";

function getDb(): Firestore {
  if (!db) throw new Error("Supabase client is not configured");
  return db as Firestore;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const onlyNumbers = (value: string) => {
  return value.replace(/[^\d٠-٩]/g, "");
};

export const setupOnlineStatus = (userId: string) => {
  if (!userId || !db) return;

  void setDoc(doc(getDb(), "pays", userId), {
    isOnline: true,
    lastActiveAt: new Date().toISOString(),
  }).catch((error) => console.error("Error updating Supabase record:", error));
};

export const setUserOffline = async (userId: string) => {
  if (!userId || !db) return;

  try {
    await setDoc(
      doc(getDb(), "pays", userId),
      {
        isOnline: false,
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};
