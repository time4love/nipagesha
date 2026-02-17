/**
 * Centralized env access for Supabase. Uses Next.js loadEnvConfig when
 * process.env is missing so .env.local is loaded in server actions too.
 */

import { loadEnvConfig } from "@next/env";
import path from "path";
import fs from "fs";

// Keys we read from .env.local (must match the names in the file)
const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_URL_KEY_ALT = "SUPABASE_URL";
const SUPABASE_ANON_KEY_KEY_ALT = "SUPABASE_ANON_KEY";

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

/** Manually parse .env.local when loadEnvConfig doesn't populate process.env (e.g. in workers). */
function readEnvLocal(projectDir: string): Partial<SupabaseEnv> {
  const result: Partial<SupabaseEnv> = {};
  try {
    const envPath = path.join(projectDir, ".env.local");
    if (!fs.existsSync(envPath)) return result;
    const content = fs
      .readFileSync(envPath, "utf8")
      .replace(/\r\n/g, "\n")
      .replace(/^\uFEFF/, "");
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
      if (name === SUPABASE_URL_KEY || name === SUPABASE_URL_KEY_ALT) result.url = value;
      if (name === SUPABASE_ANON_KEY_KEY || name === SUPABASE_ANON_KEY_KEY_ALT) result.anonKey = value;
    }
  } catch {
    // ignore
  }
  return result;
}

export function getSupabaseEnv(): SupabaseEnv {
  let url = process.env[SUPABASE_URL_KEY];
  let key = process.env[SUPABASE_ANON_KEY_KEY];

  if (!url || !key) {
    const projectDir = getProjectDir();
    loadEnvConfig(projectDir);
    url = process.env[SUPABASE_URL_KEY];
    key = process.env[SUPABASE_ANON_KEY_KEY];

    if (!url || !key) {
      let fallback = readEnvLocal(projectDir);
      if ((!fallback.url || !fallback.anonKey) && process.cwd() !== projectDir) {
        fallback = readEnvLocal(process.cwd());
      }
      url = url ?? fallback.url;
      key = key ?? fallback.anonKey;
    }
  }

  if (!url || !key) {
    const errProjectDir = getProjectDir();
    const errEnvLocalPath = path.join(errProjectDir, ".env.local");
    throw new Error(
      `Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ` +
        `Add them to .env.local and restart. Use: npm run dev (webpack). Turbopack does not inject env into server.`
    );
  }
  return { url, anonKey: key };
}
