const fs = require('fs');
let code = fs.readFileSync('lib/supabase-client.ts', 'utf-8');

code = code.replace(/export function sanitizeForJson[\s\S]*?export function safeJsonStringify/, `export function sanitizeForJson(value: any, seen = new WeakSet()): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") {
    if (typeof value === "function" || typeof value === "symbol") return undefined;
    if (typeof value === "bigint") return value.toString();
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  // Duck typing for DOM node, React Fiber, SyntheticEvent, Window, Document
  if (
    typeof value.nodeType === "number" ||
    typeof value.tagName === "string" ||
    typeof value.nodeName === "string" ||
    value.ownerDocument !== undefined ||
    value.defaultView !== undefined ||
    value.$$typeof !== undefined ||
    value._owner !== undefined ||
    value.stateNode !== undefined ||
    value.memoizedProps !== undefined ||
    value.memoizedState !== undefined ||
    (value.return !== undefined && value.child !== undefined) ||
    (value.target !== undefined && value.currentTarget !== undefined && value.type !== undefined)
  ) {
    return undefined;
  }

  // Cross-realm safe DOM element / Window / Document check
  try {
    const tag = Object.prototype.toString.call(value);
    if (
      tag.includes("Element") ||
      tag.includes("HTML") ||
      tag.includes("Node") ||
      tag.includes("Window") ||
      tag.includes("Document") ||
      tag.includes("Event") ||
      tag.includes("Location")
    ) {
      return undefined;
    }
  } catch {}

  // Circular reference detection
  if (seen.has(value)) {
    return undefined;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForJson(item, seen))
      .filter((item) => item !== undefined);
  }

  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (
      k.startsWith("__react") ||
      k.startsWith("$$") ||
      k.startsWith("_owner") ||
      k === "stateNode" ||
      k === "return" ||
      k === "child" ||
      k === "sibling" ||
      k === "memoizedProps" ||
      k === "memoizedState" ||
      k === "target" ||
      k === "currentTarget" ||
      k === "nativeEvent" ||
      k === "view"
    ) {
      continue;
    }
    const sanitized = sanitizeForJson(v, seen);
    if (sanitized !== undefined) {
      cleanObj[k] = sanitized;
    }
  }
  return cleanObj;
}

export function safeJsonStringify`);

fs.writeFileSync('lib/supabase-client.ts', code);
