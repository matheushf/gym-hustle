// import { getCycles } from "@/app/actions/cycles";
import { CaloriesClient } from "./CaloriesClient";

import { Suspense } from "react";
import FullLoader from "@/components/ui/full-loader";

async function Cycles() {
  // Mock data for demonstration
  const calories = [
    { id: '1', name: 'morning' as const, calories: 350, description: 'Oatmeal and fruit' },
    { id: '2', name: 'lunch' as const, calories: 600, description: 'Chicken salad' },
    { id: '3', name: 'afternoon' as const, calories: 200, description: 'Yogurt snack' },
    { id: '4', name: 'dinner' as const, calories: 550, description: 'Grilled fish and veggies' },
  ];

  return (
    <Suspense fallback={<FullLoader />}>
      <CaloriesClient initialCalories={calories} />
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
