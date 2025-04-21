import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function WorkoutPage() {
  const workoutDays = await getWorkoutDays();

  return (
    <WorkoutPageClient 
      initialWorkoutDays={workoutDays}
      daysOfWeek={DAYS_OF_WEEK}
    />
  );
}
