import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const cookieStore = await cookies();

  if (!email || !password) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent("נא להזין אימייל וסיסמה")}`,
      { status: 302 }
    );
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, (options ?? {}) as Record<string, unknown>)
            );
          } catch {
            // התעלמות
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = error.message.includes("Invalid login credentials")
      ? "אימייל או סיסמה שגויים"
      : error.message;
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(message)}`,
      { status: 302 }
    );
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 302,
  });
}
