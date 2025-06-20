// import { getCycles } from "@/app/actions/cycles";
import { CaloriesClient } from "./CaloriesClient";
import { getMacroGoals } from "@/app/actions/calories";

import { Suspense } from "react";
import FullLoader from "@/components/ui/full-loader";

async function Cycles() {
  const initialMacros = await getMacroGoals();
  return (
    <Suspense fallback={<FullLoader />}>
      <CaloriesClient initialMacros={initialMacros} />
    </Suspense>
  );
}

export default async function Page() {
  return (
    <Suspense fallback={<FullLoader />}>
      <Cycles />
    </Suspense>
  );
}
