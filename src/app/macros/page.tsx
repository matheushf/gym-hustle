import { unstable_cache } from "next/cache";
import { MacrosClient } from "./MacrosClient";
import { getMacroGoals } from "@/app/actions/macros";
import { cookies } from "next/headers";
import { getFoodIdeas } from "../actions/ideas";

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

  const initialIdeas = await unstable_cache(
    async () => await getFoodIdeas(cookieStore),
    ["food-ideas"],
    {
      tags: ["food-ideas"],
      revalidate: 60,
    }
  )();

  return (
    <MacrosClient initialMacros={initialMacros} initialIdeas={initialIdeas} />
  );
}
