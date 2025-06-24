import { unstable_cache } from "next/cache";
import { MacrosClient } from "./MacrosClient";
import { getMacroGoals } from "@/app/actions/macros";
import { cookies } from "next/headers";
import { getFoodIdeas } from "../actions/ideas";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";

  const initialMacros = await unstable_cache(
    async () => await getMacroGoals(cookieStore, session),
    ["macro-goals", userId],
    {
      tags: ["macro-goals"],
      revalidate: 60,
    }
  )();

  const initialIdeas = await unstable_cache(
    async () => await getFoodIdeas(cookieStore, session),
    ["food-ideas", userId],
    {
      tags: ["food-ideas"],
      revalidate: 60,
    }
  )();

  return (
    <MacrosClient initialMacros={initialMacros} initialIdeas={initialIdeas} />
  );
}
