import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ensure Supabase env vars are available in server actions (loaded from .env.local at startup)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
