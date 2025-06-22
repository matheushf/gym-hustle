import { CaloriesClient } from "./CaloriesClient";
import { getMacroGoals } from "@/app/actions/calories";

export default async function Page() {
  const initialMacros = await getMacroGoals();

  return <CaloriesClient initialMacros={initialMacros} />;
}
