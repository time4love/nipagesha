/**
 * Supabase config. Uses process.env only — no secrets in code.
 * In dev: dotenv-cli loads .env.local for the main process; we also load it here
 * so workers (e.g. Turbopack) that don't inherit env get the keys.
 */
let envLoadHint = "";
if (process.env.NODE_ENV !== "production") {
  const path = require("node:path") as typeof import("node:path");
  const result = require("dotenv").config({
    path: path.resolve(process.cwd(), ".env.local"),
  });
  if (result.error) {
    envLoadHint = " (.env.local not found or unreadable)";
  } else if (result.parsed && Object.keys(result.parsed).length === 0) {
    envLoadHint = " (.env.local is empty or has no valid KEY=VALUE lines)";
  }
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase keys are missing" +
      envLoadHint +
      ". Add to .env.local in project root (no quotes, no spaces around =):\n  NEXT_PUBLIC_SUPABASE_URL=https://....\n  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...."
  );
}
