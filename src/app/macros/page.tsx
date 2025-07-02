"use server";

import { MacrosClient } from "./MacrosClient";
import { getFortnightsForCycle } from "@/app/actions/weeks";
import { getMacrosForWeek } from "@/app/actions/macros";
import { getIdeasForWeek } from "@/app/actions/ideas";
import { getCurrentCycleId, getCycleById } from "@/app/actions/cycles";

export default async function Page() {
  const cycleId = await getCurrentCycleId();
  if (!cycleId) {
    return <div className="p-8 text-center">No active cycle found.</div>;
  }

  const cycle = await getCycleById(cycleId);
  const fortnights = await getFortnightsForCycle(cycleId);
  const latestWeekNumber = fortnights.length > 0 ? fortnights[fortnights.length - 1].week_number : 1;
  const macros = await getMacrosForWeek(cycleId, latestWeekNumber);
  const ideas = await getIdeasForWeek(cycleId, latestWeekNumber);

  return (
    <MacrosClient
      cycleId={cycleId}
      cycleType={cycle?.type}
      initialWeeks={fortnights}
      initialMacros={macros}
      initialIdeas={ideas}
    />
  );
}
