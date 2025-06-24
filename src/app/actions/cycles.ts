"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Session } from "@supabase/supabase-js";

export async function getCycles(cookieStore: ReturnType<typeof cookies>, session: Session | null) {
  const supabase = await createClient(cookieStore);
  if (!session) return [];

  const { data, error } = await supabase
    .from("cycles")
    .select("id, type, start_date, end_date, created_at")
    .eq("user_id", session.user.id)
    .order("start_date", { ascending: false });
  
  if (error) throw error;

  return data;
}

export async function addCycle({ type, start }: { type: "bulking" | "cutting"; start: Date; }) {
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("cycles")
    .insert({
      user_id: session.user.id,
      type,
      start_date: start.toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCycle({ id, end }: { id: string; end: Date }) {
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cycles")
    .update({ end_date: end.toISOString().slice(0, 10) })
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
} 