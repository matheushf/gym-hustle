import { SavedWorkoutsClient } from "./SavedWorkoutsClient";
import { getAllWorkoutsForUser } from "@/app/actions/workout";
import { getSelectedWorkoutId } from "@/app/actions/auth";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const workouts = await getAllWorkoutsForUser(supabase);
  const selectedWorkoutId = await getSelectedWorkoutId();
  return <SavedWorkoutsClient workouts={workouts} selectedWorkoutId={selectedWorkoutId} />;
} 