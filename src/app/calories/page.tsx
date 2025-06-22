import { unstable_cache } from "next/cache";
import { CaloriesClient } from "./CaloriesClient";
import { getMacroGoals } from "@/app/actions/calories";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = cookies();
  const initialMacros = await unstable_cache(
    async () => await getMacroGoals(cookieStore),
    ["macro-goals"],
    {
      tags: ["macro-goals"],
      revalidate: 60,
    }
  )();

  return <CaloriesClient initialMacros={initialMacros} />;
}
