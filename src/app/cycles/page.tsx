import { getCycles } from "@/app/actions/cycles";
import { CyclesClient } from "./CyclesClient";

import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

async function Cycles() {
  const [cycles] = await Promise.all([
    getCycles(),
  ]);

  console.log('cycles', cycles);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CyclesClient initialCycles={cycles}
      />
    </Suspense>
  );
}

export default async function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-screen">
          <h1 className="text-2xl font-bold text-primary mb-4">Gym Hustle</h1>
          <LoaderIcon className="animate-spin" size={32} />
        </div>
      }
    >
      <Cycles />
    </Suspense>
  );
}
