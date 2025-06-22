import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export default async function Page() {
  const cookieStore = cookies();
  const workoutDays = await unstable_cache(
    async () => await getWorkoutDays(cookieStore),
    ["workout-days"],
    {
      tags: ["workout-days"],
      revalidate: 60,
    }
  )();

  return (
    <WorkoutPageClient initialWorkoutDays={workoutDays} />
  );
}
