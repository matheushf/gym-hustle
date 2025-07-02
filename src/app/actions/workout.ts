"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: string;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  order: number;
  sets: ExerciseSet[];
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

export async function getWorkoutDays(
  cookieStore: ReturnType<typeof cookies>,
  session: Session | null
) {
  if (!session) return [];

  const supabase = await createClient(cookieStore);

  const { data: workoutDays } = await supabase
    .from("workout_days")
    .select(
      `
      id,
      name,
      exercises (
        id,
        name,
        sets,
        weight,
        order
      )
    `
    )
    .eq("user_id", session.user.id)
    .eq("exercises.archived", false)
    .order("created_at");

  if (workoutDays) {
    workoutDays.forEach((day) => {
      day.exercises.sort((a, b) => a.order - b.order);
    });
  }

  return workoutDays || [];
}

export async function updateExerciseWeight(exerciseId: string, weight: number) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from("exercises")
    .update({ weight })
    .eq("id", exerciseId);

  if (error) throw error;

  revalidatePath("/workout");
}

export async function createWorkoutDay(name: string, workoutId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("workout_days")
    .insert([{ name, user_id: userId, workout_id: workoutId }])
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/workout");
  revalidateTag(`workout-${userId}`);
  return data;
}

export async function createExercise(
  workoutDayId: string,
  name: string,
  order: number = 0
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from workout_day
  const { data: day } = await supabase
    .from("workout_days")
    .select("user_id")
    .eq("id", workoutDayId)
    .single();
  const userId = day?.user_id;
  const { data, error } = await supabase
    .from("exercises")
    .insert([
      {
        name,
        workout_day_id: workoutDayId,
        order,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
  return data;
}

export async function createExerciseSet(
  exerciseId: string,
  set_number: number,
  reps: string,
  weight?: number
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { data, error } = await supabase
    .from("exercise_sets")
    .insert([
      {
        exercise_id: exerciseId,
        set_number,
        reps,
        weight,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
  return data;
}

export async function updateExerciseSet(
  setId: string,
  data: { reps?: string; weight?: number; set_number?: number }
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from set
  const { data: set } = await supabase
    .from("exercise_sets")
    .select("exercise_id")
    .eq("id", setId)
    .single();
  let userId;
  if (set?.exercise_id) {
    const { data: exercise } = await supabase
      .from("exercises")
      .select("workout_day_id")
      .eq("id", set.exercise_id)
      .single();
    if (exercise?.workout_day_id) {
      const { data: day } = await supabase
        .from("workout_days")
        .select("user_id")
        .eq("id", exercise.workout_day_id)
        .single();
      userId = day?.user_id;
    }
  }
  const { error } = await supabase
    .from("exercise_sets")
    .update(data)
    .eq("id", setId);
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function deleteExerciseSet(setId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from set
  const { data: set } = await supabase
    .from("exercise_sets")
    .select("exercise_id")
    .eq("id", setId)
    .single();
  let userId;
  if (set?.exercise_id) {
    const { data: exercise } = await supabase
      .from("exercises")
      .select("workout_day_id")
      .eq("id", set.exercise_id)
      .single();
    if (exercise?.workout_day_id) {
      const { data: day } = await supabase
        .from("workout_days")
        .select("user_id")
        .eq("id", exercise.workout_day_id)
        .single();
      userId = day?.user_id;
    }
  }
  const { error } = await supabase
    .from("exercise_sets")
    .delete()
    .eq("id", setId);
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function updateExercise(
  exerciseId: string,
  data: {
    name?: string;
    sets?: string;
    weight?: number;
    workout_day_id?: string;
    order?: number;
  }
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { error } = await supabase
    .from("exercises")
    .update(data)
    .eq("id", exerciseId);
  if (error) throw error;

  console.log('oi-- revalidating', userId)
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function deleteExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function updateExerciseOrder(
  exerciseId: string,
  newOrder: number
) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { error } = await supabase
    .from("exercises")
    .update({ order: newOrder })
    .eq("id", exerciseId);
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function getArchivedExercises(
  cookieStore: ReturnType<typeof cookies>
): Promise<ArchivedExercise[]> {
  const supabase = await createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  // Get all workout day IDs for the user
  const { data: workoutDays } = await supabase
    .from("workout_days")
    .select("id")
    .eq("user_id", session.user.id);

  if (!workoutDays || workoutDays.length === 0) return [];
  const workoutDayIds = workoutDays.map((d: { id: string }) => d.id);

  // Get all archived exercises for the user, including workout day name
  const { data: exercises } = await supabase
    .from("exercises")
    .select(`id, name, sets, weight, workout_day_id, workout_days(name)`)
    .eq("archived", true)
    .in("workout_day_id", workoutDayIds)
    .order("created_at");

  return (exercises || []) as ArchivedExercise[];
}

export async function archiveExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { error } = await supabase
    .from("exercises")
    .update({ archived: true })
    .eq("id", exerciseId);
  if (error) throw error;
  revalidatePath("/workout");
  revalidatePath("/exercises-archive");
  if (userId) revalidateTag(`workout-${userId}`);
}

export async function unarchiveExercise(exerciseId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from exercise
  const { data: exercise } = await supabase
    .from("exercises")
    .select("workout_day_id")
    .eq("id", exerciseId)
    .single();
  let userId;
  if (exercise?.workout_day_id) {
    const { data: day } = await supabase
      .from("workout_days")
      .select("user_id")
      .eq("id", exercise.workout_day_id)
      .single();
    userId = day?.user_id;
  }
  const { error } = await supabase
    .from("exercises")
    .update({ archived: false })
    .eq("id", exerciseId);
  if (error) throw error;
  revalidatePath("/exercises-archive");
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

// Fetch a workout (with days, exercises, and sets)
export async function getWorkoutWithDays(workoutId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Fetch workout
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();
  if (workoutError || !workout)
    throw workoutError || new Error("Workout not found");
  // Fetch days and exercises
  const { data: days, error: daysError } = await supabase
    .from("workout_days")
    .select(
      `id, name, exercises (id, name, order)`
    )
    .eq("workout_id", workoutId)
    .eq("exercises.archived", false)
    .order("created_at");
  if (daysError) throw daysError;
  // Fetch sets for all exercises
  type DBExercise = { id: string; name: string; order: number; sets?: ExerciseSet[] };
  type DBDay = { id: string; name: string; exercises: DBExercise[] };
  const dbDays = days as DBDay[];
  const exerciseIds = dbDays.flatMap((day) => day.exercises.map((ex) => ex.id));
  let setsByExercise: Record<string, ExerciseSet[]> = {};
  if (exerciseIds.length > 0) {
    const { data: setsData, error: setsError } = await supabase
      .from("exercise_sets")
      .select("id, exercise_id, set_number, reps, weight")
      .in("exercise_id", exerciseIds);
    if (setsError) throw setsError;
    setsByExercise = (setsData || []).reduce((acc: Record<string, ExerciseSet[]>, set: ExerciseSet) => {
      if (!acc[set.exercise_id]) acc[set.exercise_id] = [];
      acc[set.exercise_id].push(set);
      return acc;
    }, {});
  }
  // Attach sets to each exercise
  dbDays.forEach((day) => {
    day.exercises.forEach((ex) => {
      ex.sets = (setsByExercise[ex.id] || []).sort((a, b) => a.set_number - b.set_number);
    });
    day.exercises.sort((a, b) => a.order - b.order);
  });
  // Cast to WorkoutDay[] with Exercise[]
  const typedDays: WorkoutDay[] = dbDays as unknown as WorkoutDay[];
  return { ...workout, days: typedDays || [] } as Workout;
}

// Create a workout for the current user
export async function createWorkout(name: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const userId = session.user.id;
  const { data, error } = await supabase
    .from("workouts")
    .insert([{ name, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/workout");
  revalidateTag(`workout-${userId}`);
  return data;
}

// Update a workout's title
export async function updateWorkoutTitle(workoutId: string, name: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get userId from workout
  const { data: workout } = await supabase
    .from("workouts")
    .select("user_id")
    .eq("id", workoutId)
    .single();
  const userId = workout?.user_id;
  const { error } = await supabase
    .from("workouts")
    .update({ name })
    .eq("id", workoutId);
  if (error) throw error;
  revalidatePath("/workout");
  if (userId) revalidateTag(`workout-${userId}`);
}

// Fetch all workouts for the current user, including days and exercises
export async function getAllWorkoutsForUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  // Get all workout IDs for the user
  const { data: workoutsRaw, error } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!workoutsRaw) return [];
  // Fetch full workout info (with days and exercises) for each
  const workouts = await Promise.all(
    workoutsRaw.map(async (w) => await getWorkoutWithDays(w.id))
  );
  return workouts;
}

// Set the selected workout for the current user
export async function setSelectedWorkout(workoutId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  // Upsert into user_profile
  const { error } = await supabase
    .from("user_profile")
    .upsert({ user_id: session.user.id, selected_workout_id: workoutId }, { onConflict: "user_id" });
  if (error) throw error;
  revalidatePath("/saved-workouts");
  revalidatePath("/workout");
}

// Returns the initial workout (with days) for the current user, or creates one if needed
export async function getInitialWorkoutForUser(supabase: ReturnType<typeof createClient>) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Try to get the selected workout from user_profile
  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("selected_workout_id")
    .eq("user_id", userId)
    .single();

  let workoutId = userProfile?.selected_workout_id;
  let workout;

  if (workoutId) {
    workout = await getWorkoutWithDays(workoutId);
    // If somehow the selected workout was deleted, fallback
    if (!workout) workoutId = undefined;
  }

  if (!workoutId) {
    // Fallback: get the first workout or create one
    const { data: foundWorkout } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (foundWorkout) {
      workout = await getWorkoutWithDays(foundWorkout.id);
    } else {
      // Create a new workout for this user
      const newWorkout = await createWorkout("My Workout");
      workout = await getWorkoutWithDays(newWorkout.id);
    }
  }

  return workout || null;
}
