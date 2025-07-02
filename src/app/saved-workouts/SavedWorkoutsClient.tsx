"use client";

import type { Workout } from "@/app/actions/workout";

export function SavedWorkoutsClient({ workouts }: { workouts: Workout[] }) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Saved Workouts</h1>
      {workouts.length === 0 ? (
        <div className="text-muted-foreground text-center">No saved workouts found.</div>
      ) : (
        <ul className="space-y-4">
          {workouts.map((workout) => (
            <li key={workout.id} className="border rounded-lg p-4 shadow-sm bg-card">
              <div className="font-semibold text-lg">{workout.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Created: {new Date(workout.created_at).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {workout.days?.length || 0} days
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 