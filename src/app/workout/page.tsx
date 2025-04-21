import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { getCurrentUser } from "../actions/auth";

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
  const [workoutDays, user] = await Promise.all([
    getWorkoutDays(),
    getCurrentUser()
  ]);

  return (
    <WorkoutPageClient
      initialWorkoutDays={workoutDays}
      daysOfWeek={DAYS_OF_WEEK}
      userName={user?.email ?? "User"}
    />
  );
}
