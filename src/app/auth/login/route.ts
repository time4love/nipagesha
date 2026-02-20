import { createClientForRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent("נא להזין אימייל וסיסמה")}`,
      { status: 302 }
    );
  }

  const { client: supabase, pendingCookies } = await createClientForRouteHandler(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.message.includes("Invalid login credentials")
        ? "אימייל או סיסמה שגויים"
        : error.message;
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(message)}`,
      { status: 302 }
    );
  }

  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`, { status: 302 });
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, (options ?? {}) as Record<string, unknown>)
  );
  return response;
}
