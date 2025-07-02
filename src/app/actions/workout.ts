"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  weight?: number;
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface ArchivedExercise {
  id: string;
  name: string;
  sets: string;
  weight?: number;
  workout_day_id: string;
  workout_days?: { name?: string };
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  days: WorkoutDay[];
}

export async function getWorkoutDays(cookieStore: ReturnType<typeof cookies>, session: Session | null) {
  if (!session) return [];

  const supabase = await createClient(cookieStore);

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
    .eq('exercises.archived', false)
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

export async function createWorkoutDay(name: string, workoutId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('workout_days')
    .insert([
      { name, user_id: session.user.id, workout_id: workoutId }
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
  workout_day_id?: string;
  order?: number;
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

export async function getArchivedExercises(cookieStore: ReturnType<typeof cookies>): Promise<ArchivedExercise[]> {
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  // Get all workout day IDs for the user
  const { data: workoutDays } = await supabase
    .from('workout_days')
    .select('id')
    .eq('user_id', session.user.id);

  if (!workoutDays || workoutDays.length === 0) return [];
  const workoutDayIds = workoutDays.map((d: { id: string }) => d.id);

  // Get all archived exercises for the user, including workout day name
  const { data: exercises } = await supabase
    .from('exercises')
    .select(`id, name, sets, weight, workout_day_id, workout_days(name)`)
    .eq('archived', true)
    .in('workout_day_id', workoutDayIds)
    .order('created_at');

  return (exercises || []) as ArchivedExercise[];
}

export async function archiveExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .update({ archived: true })
    .eq('id', exerciseId);

  if (error) throw error;
  revalidatePath('/workout');
  revalidatePath('/exercises-archive');
}

export async function unarchiveExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('exercises')
    .update({ archived: false })
    .eq('id', exerciseId);

  if (error) throw error;
  revalidatePath('/exercises-archive');
  revalidatePath('/workout');
}

// Fetch a workout (with days and exercises) by workout_id
export async function getWorkoutWithDays(workoutId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Fetch workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();
  if (workoutError || !workout) throw workoutError || new Error('Workout not found');

  // Fetch days and exercises
  const { data: days, error: daysError } = await supabase
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
    .eq('workout_id', workoutId)
    .eq('exercises.archived', false)
    .order('created_at');
  if (daysError) throw daysError;
  if (days) {
    days.forEach(day => {
      day.exercises.sort((a, b) => a.order - b.order);
    });
  }
  return { ...workout, days: days || [] } as Workout;
}

// Create a workout for the current user
export async function createWorkout(name: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('workouts')
    .insert([{ name, user_id: session.user.id }])
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/workout');
  return data;
}

// Update a workout's title
export async function updateWorkoutTitle(workoutId: string, name: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { error } = await supabase
    .from('workouts')
    .update({ name })
    .eq('id', workoutId);
  if (error) throw error;
  revalidatePath('/workout');
} 