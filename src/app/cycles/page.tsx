import { getCycles } from "@/app/actions/cycles";
import { CyclesClient } from "./CyclesClient";

export default async function Page() {
  const [cycles] = await Promise.all([getCycles()]);

  return <CyclesClient initialCycles={cycles} />;
}
