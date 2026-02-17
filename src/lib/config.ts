/**
 * Supabase config. No secrets in code — use .env.local (dev) or host env (prod).
 * Dev: run `npm run dev` so dotenv-cli loads .env.local before Next starts.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase keys are missing from environment variables!");
}
