"use client";
import { createClient } from "@/utils/supabase/client";

export async function loginWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/workout", // or your desired redirect URL
    },
  });
  if (error) throw error;
} 