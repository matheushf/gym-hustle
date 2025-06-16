import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";

import { Suspense } from "react";
import FullLoader from "@/components/ui/full-loader";

async function Workout() {
  const [workoutDays] = await Promise.all([getWorkoutDays()]);

  return (
    <Suspense fallback={<FullLoader />}>
      <WorkoutPageClient initialWorkoutDays={workoutDays} />
    </Suspense>
  );
}

export default async function Page() {
  return (
    <Suspense fallback={<FullLoader />}>
      <Workout />
    </Suspense>
  );
}
