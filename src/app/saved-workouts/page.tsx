import { SavedWorkoutsClient } from "./SavedWorkoutsClient";
import { getAllWorkoutsForUser } from "@/app/actions/workout";

export default async function Page() {
  const workouts = await getAllWorkoutsForUser();
  return <SavedWorkoutsClient workouts={workouts} />;
} 