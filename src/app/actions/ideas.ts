"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export type FoodIdea = {
  id: string;
  user_id: string;
  meal: "morning" | "lunch" | "afternoon" | "dinner";
  text: string;
  created_at: string;
};

export async function getFoodIdeas(cookieStore: ReturnType<typeof cookies>) {
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("food_ideas")
    .select("id, user_id, meal, text, created_at")
    .eq("user_id", session.user.id);

  if (error) throw error;
  return data as FoodIdea[];
}

export async function addFoodIdea(
  meal: "morning" | "lunch" | "afternoon" | "dinner",
  text: string
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("food_ideas")
    .insert([{ user_id: session.user.id, meal, text }])
    .select()
    .single();

  if (error) throw error;

  revalidateTag("food-ideas");
  
  return data as FoodIdea;
}

export async function deleteFoodIdea(id: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("food_ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw error;
}

export async function updateFoodIdea(id: string, newText: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("food_ideas")
    .update({ text: newText })
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw error;

  revalidateTag("food-ideas");
} 