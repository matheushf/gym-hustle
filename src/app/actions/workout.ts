"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  weight?: string;
  workout_day_id: string;
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  user_id: string;
  exercises: Exercise[];
}

export async function getWorkoutDays() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data: workoutDays } = await supabase
    .from('workout_days')
    .select(`
      id,
      name,
      exercises (
        id,
        name,
        sets,
        weight,
        order
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at');

  if (workoutDays) {
    workoutDays.forEach(day => {
      day.exercises.sort((a, b) => a.order - b.order);
    });
  }

  return workoutDays || [];
}

export async function updateExerciseWeight(exerciseId: string, weight: number) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .update({ weight })
    .eq('id', exerciseId);

  if (error) throw error;
  
  revalidatePath('/workout');
}

export async function createWorkoutDay(name: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('workout_days')
    .insert([
      { name, user_id: session.user.id }
    ])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/workout');
  return data;
}

export async function createExercise(workoutDayId: string, name: string, sets: string, weight?: number) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from('exercises')
    .insert([
      { 
        name, 
        sets, 
        weight,
        workout_day_id: workoutDayId 
      }
    ])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/workout');
  return data;
}

export async function updateExercise(exerciseId: string, data: {
  name?: string;
  sets?: string;
  weight?: number;
}) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .update(data)
    .eq('id', exerciseId);

  if (error) throw error;
  
  revalidatePath('/workout');
}

export async function deleteExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId);

  if (error) throw error;
  
  revalidatePath('/workout');
}

export async function updateExerciseOrder(exerciseId: string, newOrder: number) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .update({ order: newOrder })
    .eq('id', exerciseId);

  if (error) throw error;
  
  revalidatePath('/workout');
} 