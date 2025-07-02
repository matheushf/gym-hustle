import { SavedWorkoutsClient } from "./SavedWorkoutsClient";
import { getAllWorkoutsForUser } from "@/app/actions/workout";
import { getSelectedWorkoutId } from "@/app/actions/auth";

export default async function Page() {
  const workouts = await getAllWorkoutsForUser();
  const selectedWorkoutId = await getSelectedWorkoutId();
  return <SavedWorkoutsClient workouts={workouts} selectedWorkoutId={selectedWorkoutId} />;
} 