import { getCycles } from "@/app/actions/cycles";
import { CyclesClient } from "./CyclesClient";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";

  const cycles = await unstable_cache(
    async () => await getCycles(cookieStore, session),
    ["cycles", userId],
    {
      tags: ["cycles"],
      revalidate: 60,
    }
  )();

  return <CyclesClient initialCycles={cycles} />;
}
