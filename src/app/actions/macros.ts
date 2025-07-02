"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Session } from "@supabase/supabase-js";

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

export async function getMacroGoals(cookieStore: ReturnType<typeof cookies>, session: Session | null) {
  const supabase = await createClient(cookieStore);
  if (!session) return [];

  const { data, error } = await supabase
    .from("macro_goals")
    .select("id, user_id, meal, carbos, fat, protein, created_at, updated_at")
    .eq("user_id", session.user.id);

  if (error) throw error;
  return data as MacroGoal[];
}

export async function upsertMacroGoal(
  cycleId: string,
  week: number,
  meal: string,
  carbos: number,
  fat: number,
  protein: number
) {
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const userId = session.user.id;

  const { error } = await supabase
    .from('macro_goals')
    .upsert([
      { user_id: userId, cycle_id: cycleId, week, meal, carbos, fat, protein }
    ], { onConflict: 'cycle_id,week,meal' });
  if (error) throw error;
}

export async function getMacrosForWeek(cycleId: string, week: number) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('macro_goals')
    .select('*')
    .eq('cycle_id', cycleId)
    .eq('week', week);
  if (error) throw error;
  return data;
} 