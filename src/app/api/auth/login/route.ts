import { createClientForRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const AUTH_ERRORS: Record<string, string> = {
  INVALID_CREDENTIALS: "אימייל או סיסמה שגויים",
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

  try {
    const { client: supabase, pendingCookies } = await createClientForRouteHandler(request);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const message =
        error.message.includes("Invalid login credentials")
          ? AUTH_ERRORS.INVALID_CREDENTIALS
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
      new URL("/login?error=" + encodeURIComponent("שגיאה בהתחברות. נסו שוב."), request.url)
    );
  }
}
