import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";

import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

async function Workout() {
  const [workoutDays] = await Promise.all([
    getWorkoutDays(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutPageClient
        initialWorkoutDays={workoutDays}
      />
    </Suspense>
  );
}

export default async function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-screen">
          <h1 className="text-2xl font-bold text-primary mb-4">Gym Hustle</h1>
          <LoaderIcon className="animate-spin" size={32} />
        </div>
      }
    >
      <Workout />
    </Suspense>
  );
}
