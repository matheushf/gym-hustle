import { getCycles } from "@/app/actions/cycles";
import { CyclesClient } from "./CyclesClient";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export default async function Page() {
  const cookieStore = cookies();
  const cycles = await unstable_cache(
    async () => await getCycles(cookieStore),
    ["cycles"],
    {
      tags: ["cycles"],
      revalidate: 60,
    }
  )();

  return <CyclesClient initialCycles={cycles} />;
}
