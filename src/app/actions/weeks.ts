"use server";

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Create a new fortnight for a cycle, only if 13 days have passed since the last fortnight
export async function createFortnight(cycleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(cookies());

  // Get the latest fortnight for this cycle
  const { data: lastFortnight } = await supabase
    .from('fortnights')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('week_number', { ascending: false })
    .limit(1)
    .single();

  const today = new Date();
  let canCreate = false;
  let newWeekNumber = 1;

  if (!lastFortnight) {
    // No fortnights yet, allow creation
    canCreate = true;
  } else {
    const lastStart = new Date(lastFortnight.start_date);
    const diffDays = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 13) {
      canCreate = true;
      newWeekNumber = lastFortnight.week_number + 1;
    }
  }

  if (!canCreate) {
    return { success: false, error: 'You can only create a new fortnight after 13 days (2 weeks).' };
  }

  // Insert new fortnight
  const { error } = await supabase.from('fortnights').insert([
    {
      cycle_id: cycleId,
      week_number: newWeekNumber,
      start_date: today.toISOString().slice(0, 10),
    },
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Fetch all fortnights for a cycle, ordered by week_number
export async function getFortnightsForCycle(cycleId: string) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('fortnights')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('week_number', { ascending: true });
  if (error) throw error;
  return data;
} 