import { deflateSync, inflateSync } from "fflate";

// prefix used to identify deflate-compressed values vs old plain-text URLs.
const DEFLATE_PREFIX = "z:";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "==".slice(base64.length % 4 || 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function compressQuery(query: string): string {
  const bytes = new TextEncoder().encode(query);
  const compressed = deflateSync(bytes, { level: 6 });
  return DEFLATE_PREFIX + toBase64Url(compressed);
}

export function decompressQuery(value: string): string {
  // prefixed with "z:" followed by deflate-compressed base64url data
  if (value.startsWith(DEFLATE_PREFIX)) {
    try {
      const bytes = fromBase64Url(value.slice(DEFLATE_PREFIX.length));
      return new TextDecoder().decode(inflateSync(bytes));
    } catch {
      //
    }
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "string") return parsed;
  } catch {
    //
  }

  // plain text URL, ideally should never get here
  return value;
}

export function stringifySearchParams(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined) continue;
    if (key === "query" && typeof value === "string") {
      params.set(key, compressQuery(value));
    } else {
      params.set(key, JSON.stringify(value));
    }
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export function parseSearchParams(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(
    searchStr.startsWith("?") ? searchStr.slice(1) : searchStr,
  );
  const result: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    if (key === "query") {
      result[key] = decompressQuery(value);
    } else {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    }
  }
  return result;
}
