import type { ChatMessage, InsuranceApplication } from "./database-types";
import { safeJsonStringify } from "./supabase-client";

async function request<T>(body: Record<string, any>, method = "POST"): Promise<T> {
  const response = await fetch("/api/data", {
    method,
    headers: { "Content-Type": "application/json" },
    body: safeJsonStringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Database request failed");
  return result;
}

export const createApplication = async (
  data: Omit<InsuranceApplication, "id" | "createdAt" | "updatedAt">,
) => {
  const id = crypto.randomUUID();
  await request({
    operation: "upsert",
    collection: "pays",
    id,
    data: { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  });
  return id;
};

export const updateApplication = async (id: string, data: Partial<InsuranceApplication>) =>
  request({ operation: "upsert", collection: "pays", id, data: { ...data, updatedAt: new Date().toISOString() } });

export const getApplication = async (id: string) => {
  const result = await request<{ data: InsuranceApplication | null }>({
    operation: "get",
    collection: "pays",
    id,
  });
  return result.data ? ({ id, ...result.data } as InsuranceApplication) : null;
};

export const getAllApplications = async () => {
  throw new Error("Use the server-side applications query for admin lists.");
};

export const getApplicationsByStatus = async (_status: InsuranceApplication["status"]) => {
  throw new Error("Use the server-side applications query for admin lists.");
};

export const subscribeToApplications = (
  callback: (applications: InsuranceApplication[]) => void,
  onError?: (error: Error) => void,
) => {
  let stopped = false;
  const poll = async () => {
    try {
      const response = await fetch("/api/applications", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load applications");
      const result = await response.json();
      if (!stopped) callback(result.data || []);
    } catch (error) {
      if (!stopped) onError?.(error instanceof Error ? error : new Error("Unable to load applications"));
    }
    if (!stopped) setTimeout(poll, 3000);
  };
  void poll();
  return () => {
    stopped = true;
  };
};

export const sendMessage = async (data: Omit<ChatMessage, "id" | "timestamp">) =>
  request({
    operation: "insert",
    collection: "messages",
    id: crypto.randomUUID(),
    data: { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
  });

export const getMessages = async (applicationId: string) => {
  const response = await fetch(`/api/messages?applicationId=${encodeURIComponent(applicationId)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to load messages");
  const result = await response.json();
  return (result.data || []) as ChatMessage[];
};

export const subscribeToMessages = (applicationId: string, callback: (messages: ChatMessage[]) => void) => {
  let stopped = false;
  const poll = async () => {
    try {
      const messages = await getMessages(applicationId);
      if (!stopped) callback(messages);
    } catch (error) {
      console.error("[Supabase] Message subscription error:", error);
    }
    if (!stopped) setTimeout(poll, 3000);
  };
  void poll();
  return () => {
    stopped = true;
  };
};

export const markMessageAsRead = async (messageId: string) =>
  request({ operation: "upsert", collection: "messages", id: messageId, data: { read: true } });

export const deleteApplication = async (id: string) =>
  request({ collection: "pays", id }, "DELETE");

export const deleteMultipleApplications = async (ids: string[]) =>
  Promise.all(ids.map(deleteApplication));