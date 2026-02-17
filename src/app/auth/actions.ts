"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthActionResult = { error?: string };

const AUTH_ERRORS = {
  MISSING_CREDENTIALS: "נא להזין אימייל וסיסמה",
  INVALID_CREDENTIALS: "אימייל או סיסמה שגויים",
  PASSWORD_TOO_SHORT: "הסיסמה חייבת להכיל לפחות 6 תווים",
  EMAIL_ALREADY_REGISTERED: "כתובת האימייל כבר רשומה. נסו להתחבר.",
} as const;

function parseAuthFormData(formData: FormData): { email: string; password: string } | null {
  const email = (formData.get("email") as string | null)?.trim();
  const password = formData.get("password") as string | null;
  if (!email || !password) return null;
  return { email, password };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const credentials = parseAuthFormData(formData);
  if (!credentials) {
    return { error: AUTH_ERRORS.MISSING_CREDENTIALS };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    const message = error.message.includes("Invalid login credentials")
      ? AUTH_ERRORS.INVALID_CREDENTIALS
      : error.message;
    return { error: message };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const credentials = parseAuthFormData(formData);
  if (!credentials) {
    return { error: AUTH_ERRORS.MISSING_CREDENTIALS };
  }

  if (credentials.password.length < 6) {
    return { error: AUTH_ERRORS.PASSWORD_TOO_SHORT };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(credentials);

  if (error) {
    const message = error.message.includes("already registered")
      ? AUTH_ERRORS.EMAIL_ALREADY_REGISTERED
      : error.message;
    return { error: message };
  }

  redirect("/dashboard");
}
