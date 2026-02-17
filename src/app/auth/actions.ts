"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthActionResult = { error?: string };

export async function login(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email?.trim() || !password) {
    return { error: "נא להזין אימייל וסיסמה" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "אימייל או סיסמה שגויים" };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email?.trim() || !password) {
    return { error: "נא להזין אימייל וסיסמה" };
  }

  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "כתובת האימייל כבר רשומה. נסו להתחבר." };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}
