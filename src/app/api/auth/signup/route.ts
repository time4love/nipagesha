import { createClientForRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const AUTH_ERRORS: Record<string, string> = {
  PASSWORD_TOO_SHORT: "הסיסמה חייבת להכיל לפחות 6 תווים",
  EMAIL_ALREADY_REGISTERED: "כתובת האימייל כבר רשומה. נסו להתחבר.",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = (formData.get("email") as string | null)?.trim();
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("נא להזין אימייל וסיסמה"), request.url)
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(AUTH_ERRORS.PASSWORD_TOO_SHORT), request.url)
    );
  }

  try {
    const { client: supabase, pendingCookies } = await createClientForRouteHandler(request);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("❌ Supabase Signup Error:", error.message);
      const message =
        error.message.includes("already registered")
          ? AUTH_ERRORS.EMAIL_ALREADY_REGISTERED
          : error.message;
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent(message), request.url)
      );
    }

    const redirectUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl, 302);
    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options as Record<string, unknown>)
    );
    return response;
  } catch (err) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("שגיאה בהרשמה. נסו שוב."), request.url)
    );
  }
}
