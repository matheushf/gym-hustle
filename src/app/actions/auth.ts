"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }

  return true;
}

export async function signup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login?email=${email}`,
    },
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  revalidatePath("/");
  redirect("/auth/login");
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }

  return session.user;
}

export async function getSelectedWorkoutId() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("user_profile")
    .select("selected_workout_id")
    .eq("user_id", session.user.id)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // ignore no row found
  return data?.selected_workout_id || null;
} 