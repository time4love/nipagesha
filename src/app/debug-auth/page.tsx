import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function DebugAuthPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  // 1. נסה לקבל את המשתמש
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 2. רשימת כל העוגיות שיש לשרת כרגע (רק שמות, לא תוכן רגיש)
  const allCookies = cookieStore.getAll().map((c) => ({
    name: c.name,
    size: c.value.length,
  }));

  // 3. בדיקת משתני סביבה (רק אם קיימים, לא את הערך)
  const envCheck = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return (
    <div className="direction-ltr whitespace-pre-wrap bg-gray-100 p-10 font-mono text-sm text-black">
      <h1 className="mb-4 text-xl font-bold">🔍 Vercel Auth Debugger</h1>

      <div className="mb-6 rounded border bg-white p-4">
        <h2 className="font-bold">1. Environment Variables</h2>
        {JSON.stringify(envCheck, null, 2)}
      </div>

      <div className="mb-6 rounded border bg-white p-4">
        <h2 className="font-bold">2. Cookies Sent to Server</h2>
        {allCookies.length === 0
          ? "❌ NO COOKIES FOUND"
          : JSON.stringify(allCookies, null, 2)}
      </div>

      <div
        className={`rounded border p-4 ${user ? "bg-green-100" : "bg-red-100"}`}
      >
        <h2 className="font-bold">3. Supabase Auth Result</h2>
        <p>User Found: {user ? "✅ YES" : "❌ NO"}</p>
        {user && <p>Email: {user.email}</p>}
        {user && <p>ID: {user.id}</p>}
        {error && <p className="text-red-600">Error: {error.message}</p>}
      </div>
    </div>
  );
}
