"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export type MacroGoal = {
  id: string;
  user_id: string;
  meal: "morning" | "lunch" | "afternoon" | "dinner";
  carbos: number;
  fat: number;
  protein: number;
  created_at: string;
  updated_at: string;
};

export async function getMacroGoals(cookieStore: ReturnType<typeof cookies>) {
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("macro_goals")
    .select("id, user_id, meal, carbos, fat, protein, created_at, updated_at")
    .eq("user_id", session.user.id);

  if (error) throw error;
  return data as MacroGoal[];
}

export async function upsertMacroGoal(meal: "morning" | "lunch" | "afternoon" | "dinner", carbos: number, fat: number, protein: number) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("macro_goals")
    .upsert([
      {
        user_id: session.user.id,
        meal,
        carbos,
        fat,
        protein,
      },
    ], { onConflict: "user_id,meal" })
    .select()
    .single();

  if (error) throw error;
  return data as MacroGoal;
} 