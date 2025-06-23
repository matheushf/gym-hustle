import { getArchivedExercises } from "@/app/actions/workout";
import { ExercisesArchiveClient } from "./ExercisesArchiveClient";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export default async function Page() {
  const cookieStore = cookies();
  const archivedExercises = await unstable_cache(
    async () => await getArchivedExercises(cookieStore),
    ["archived-exercises"],
    {
      tags: ["archived-exercises"],
      revalidate: 60,
    }
  )();

  return (
    <ExercisesArchiveClient initialArchivedExercises={archivedExercises} />
  );
}
