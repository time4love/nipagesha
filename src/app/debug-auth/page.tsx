import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function DebugAuthPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const allCookies = cookieStore.getAll().map((c) => ({
    name: c.name,
    size: c.value.length,
  }));

  const envCheck = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return (
    <div className="direction-ltr min-h-screen whitespace-pre-wrap bg-gray-100 p-6 font-mono text-sm text-black">
      <h1 className="mb-4 text-xl font-bold">🔍 Auth Debug</h1>

      <section className="mb-6 rounded border border-gray-300 bg-white p-4">
        <h2 className="font-bold">1. Environment</h2>
        {JSON.stringify(envCheck, null, 2)}
      </section>

      <section className="mb-6 rounded border border-gray-300 bg-white p-4">
        <h2 className="font-bold">2. Cookies (name + size only)</h2>
        {allCookies.length === 0
          ? "❌ NO COOKIES"
          : JSON.stringify(allCookies, null, 2)}
      </section>

      <section
        className={`rounded border border-gray-300 p-4 ${user ? "bg-green-50" : "bg-red-50"}`}
      >
        <h2 className="font-bold">3. User</h2>
        <p>Found: {user ? "✅ YES" : "❌ NO"}</p>
        {user && (
          <>
            <p>Email: {user.email}</p>
            <p>ID: {user.id.slice(0, 8)}…</p>
          </>
        )}
        {error && <p className="text-red-600">Error: {error.message}</p>}
      </section>

      <p className="mt-6 text-xs text-gray-500">
        Open this page after login. If cookies have size &gt; 0 and User is YES,
        auth is working. Remove this page in production when done.
      </p>
    </div>
  );
}
