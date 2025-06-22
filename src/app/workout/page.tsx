import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";

export default async function Page() {
  const [workoutDays] = await Promise.all([getWorkoutDays()]);

  return (
    <WorkoutPageClient initialWorkoutDays={workoutDays} />
  );
}
