import { getInitialWorkoutForUser, getLastWorkoutTimer } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return <div className="p-8 text-center">Not authenticated</div>;

  const workout = await getInitialWorkoutForUser(supabase);

  if (!workout) {
    return <div className="p-8 text-center">No workout found or could not load workout.</div>;
  }

  // Determine current day name
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const today = new Date();
  const currentDayName = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const initialCurrentDayTimer = await getLastWorkoutTimer(workout.id, currentDayName);

  return (
    <WorkoutPageClient
      workoutId={workout.id}
      initialWorkoutTitle={workout.name}
      initialWorkoutDays={workout.days}
      currentDayName={currentDayName}
      initialCurrentDayTimer={initialCurrentDayTimer}
    />
  );
}
