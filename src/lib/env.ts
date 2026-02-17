/**
 * Centralized env access. Next.js loads .env.local at startup; this provides
 * a dev fallback that reads .env.local from cwd when process.env is missing.
 */

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function loadEnvLocal(): Partial<SupabaseEnv> {
  const result: Partial<SupabaseEnv> = {};
  try {
    const fs = require("fs");
    const path = require("path");
    const content = fs.readFileSync(
      path.join(process.cwd(), ".env.local"),
      "utf8"
    );
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i <= 0) continue;
      const name = trimmed.slice(0, i).trim();
      const value = trimmed
        .slice(i + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (name === SUPABASE_URL_KEY) result.url = value;
      if (name === SUPABASE_ANON_KEY_KEY) result.anonKey = value;
    }
  } catch {
    // .env.local missing or unreadable
  }
  return result;
}

export function getSupabaseEnv(): SupabaseEnv {
  let url = process.env[SUPABASE_URL_KEY];
  let key = process.env[SUPABASE_ANON_KEY_KEY];
  if (url && key) return { url, anonKey: key }

  if (process.env.NODE_ENV === "development") {
    const fallback = loadEnvLocal();
    url = url ?? fallback.url;
    key = key ?? fallback.anonKey;
  }

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local in the project root and restart the dev server."
    );
  }
  return { url, anonKey: key };
}
