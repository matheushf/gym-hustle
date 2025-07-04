"use client";
import { createClient } from "@/utils/supabase/client";

export async function loginWithGoogle() {
  const supabase = createClient();
  try {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
} 