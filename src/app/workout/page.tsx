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

  // Try to find a workout for this user
  let workout;
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

  return (
    <WorkoutPageClient
      workoutId={workout.id}
      initialWorkoutTitle={workout.name}
      initialWorkoutDays={workout.days}
    />
  );
}
