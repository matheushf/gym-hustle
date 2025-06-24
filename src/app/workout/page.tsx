import { getWorkoutDays } from "@/app/actions/workout";
import { WorkoutPageClient } from "./WorkoutPageClient";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";

  const workoutDays = await unstable_cache(
    async () => await getWorkoutDays(cookieStore, session),
    ["workout-days", userId],
    {
      tags: ["workout-days"],
      revalidate: 60,
    }
  )();

  return (
    <WorkoutPageClient initialWorkoutDays={workoutDays} />
  );
}
