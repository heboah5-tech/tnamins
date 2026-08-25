const fs = require('fs');
let code = fs.readFileSync('lib/supabase-client.ts', 'utf-8');

code = code.replace(/export function safeJsonStringify[\s\S]*?async function request/g, `export function safeJsonStringify(data: any): string {
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
          value.$$typeof !== undefined ||
          value.stateNode !== undefined ||
          value.memoizedProps !== undefined ||
          key.startsWith("__react") ||
          key.startsWith("$$") ||
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

async function request`);

fs.writeFileSync('lib/supabase-client.ts', code);
