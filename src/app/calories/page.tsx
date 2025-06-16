// import { getCycles } from "@/app/actions/cycles";
import { CaloriesClient } from "./CaloriesClient";

import { Suspense } from "react";
import FullLoader from "@/components/ui/full-loader";

async function Cycles() {
  return (
    <Suspense fallback={<FullLoader />}>
      <CaloriesClient initialCalories={[]} />
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
