/**
 * Centralized env access for Supabase. Uses Next.js loadEnvConfig when
 * process.env is missing so .env.local is loaded in server actions too.
 */

import { loadEnvConfig } from "@next/env";
import path from "path";
import fs from "fs";

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/** Resolve project root (where next.config lives) so env load works from any cwd. */
function getProjectDir(): string {
  try {
    let dir: string =
      typeof __dirname !== "undefined"
        ? __dirname
        : path.join(process.cwd(), ".next", "server");
    for (let i = 0; i < 10; i++) {
      if (!dir || dir === path.dirname(dir)) break;
      const hasConfig =
        fs.existsSync(path.join(dir, "next.config.ts")) ||
        fs.existsSync(path.join(dir, "next.config.js")) ||
        fs.existsSync(path.join(dir, "next.config.mjs"));
      if (hasConfig) return dir;
      dir = path.dirname(dir);
    }
  } catch {
    // ignore
  }
  return process.cwd();
}

export function getSupabaseEnv(): SupabaseEnv {
  let url = process.env[SUPABASE_URL_KEY];
  let key = process.env[SUPABASE_ANON_KEY_KEY];

  if (!url || !key) {
    const projectDir = getProjectDir();
    loadEnvConfig(projectDir);
    url = process.env[SUPABASE_URL_KEY];
    key = process.env[SUPABASE_ANON_KEY_KEY];
  }

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local in the project root and restart the dev server."
    );
  }
  return { url, anonKey: key };
}
