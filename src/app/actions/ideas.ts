"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import type { Session } from "@supabase/supabase-js";

export type FoodIdea = {
  id: string;
  user_id: string;
  meal: "morning" | "lunch" | "afternoon" | "dinner";
  text: string;
  created_at: string;
};

export async function getFoodIdeas(cookieStore: ReturnType<typeof cookies>, session: Session | null) {
  const supabase = await createClient(cookieStore);
  const { data: { session: sessionInner } } = await supabase.auth.getSession();
  const effectiveSession = session || sessionInner;
  if (!effectiveSession) return [];

  const { data, error } = await supabase
    .from("food_ideas")
    .select("id, user_id, meal, text, created_at")
    .eq("user_id", effectiveSession.user.id);

  if (error) throw error;
  return data as FoodIdea[];
}

export async function addFoodIdea(
  cycleId: string,
  week: number,
  meal: string,
  text: string
) {
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const user_id = session.user.id;
  const { data, error } = await supabase
    .from('food_ideas')
    .insert([{ cycle_id: cycleId, week, meal, text, user_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
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

export async function getIdeasForWeek(cycleId: string, week: number) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('food_ideas')
    .select('*')
    .eq('cycle_id', cycleId)
    .eq('week', week);
  if (error) throw error;
  return data;
} 