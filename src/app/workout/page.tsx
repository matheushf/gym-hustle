import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { getCurrentUser } from "../actions/auth";
import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

async function Workout() {
  const [workoutDays, user] = await Promise.all([
    getWorkoutDays(),
    getCurrentUser(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutPageClient
        initialWorkoutDays={workoutDays}
        userName={user?.email ?? "User"}
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
