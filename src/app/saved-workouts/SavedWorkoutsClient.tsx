"use client";

import type { Workout } from "@/app/actions/workout";
import { useTransition } from "react";
import { setSelectedWorkout } from "@/app/actions/workout";
import { Button } from "@/components/ui/button";

export function SavedWorkoutsClient({ workouts, selectedWorkoutId }: { workouts: Workout[]; selectedWorkoutId: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Saved Workouts</h1>
      {workouts.length === 0 ? (
        <div className="text-muted-foreground text-center">No saved workouts found.</div>
      ) : (
        <ul className="space-y-4">
          {workouts.map((workout) => {
            const isSelected = workout.id === selectedWorkoutId;
            return (
              <li
                key={workout.id}
                className={`border rounded-lg p-4 shadow-sm bg-card relative ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="font-semibold text-lg flex items-center justify-between">
                  <span>{workout.name}</span>
                  {isSelected && <span className="ml-2 text-xs text-primary">Selected</span>}
                </div>
                <Button
                  variant="outline"
                  className="mt-2 mb-2 ml-[-4px]"
                  disabled={isSelected || isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await setSelectedWorkout(workout.id);
                      window.location.reload();
                    });
                  }}
                >
                  {isSelected ? "Selected" : isPending ? "Selecting..." : "Select Workout"}
                </Button>
                <div className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(workout.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {workout.days?.length || 0} days
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 