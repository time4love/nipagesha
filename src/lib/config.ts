/**
 * Supabase config. No secrets in code — use .env.local (dev) or host env (prod).
 * Dev: run `npm run dev` so dotenv-cli loads .env.local before Next starts.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
/** Server-only: for search and message-by-id (unauthenticated child flow). */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Server-only: salt for anonymizing IP in access logs (HMAC). Prefer LOG_SALT env; fallback to service key. */
export const ACCESS_LOG_SALT =
  process.env.LOG_SALT ?? process.env.ACCESS_LOG_SALT ?? SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase keys are missing from environment variables!");
}
