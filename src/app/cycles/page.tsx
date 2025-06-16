import { getCycles } from "@/app/actions/cycles";
import { CyclesClient } from "./CyclesClient";

import { Suspense } from "react";
import FullLoader from "@/components/ui/full-loader";

async function Cycles() {
  const [cycles] = await Promise.all([getCycles()]);

  return (
    <Suspense fallback={<FullLoader />}>
      <CyclesClient initialCycles={cycles} />
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
