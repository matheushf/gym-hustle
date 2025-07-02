import { getWorkoutWithDays, createWorkout } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return <div className="p-8 text-center">Not authenticated</div>;

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

  if (!workout) {
    return <div className="p-8 text-center">No workout found or could not load workout.</div>;
  }

  return (
    <WorkoutPageClient
      workoutId={workout.id}
      initialWorkoutTitle={workout.name}
      initialWorkoutDays={workout.days}
    />
  );
}
