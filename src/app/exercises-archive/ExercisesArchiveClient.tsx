"use client";

import { useState } from "react";
import { ArrowUpCircle, Trash2 } from "lucide-react";
import { unarchiveExercise, deleteExercise, type ArchivedExercise } from "@/app/actions/workout";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function ExercisesArchiveClient({
  initialArchivedExercises,
}: {
  initialArchivedExercises: ArchivedExercise[];
}) {
  const [exercises, setExercises] = useState(initialArchivedExercises);
  const [pendingUnarchiveId, setPendingUnarchiveId] = useState<string | null>(
    null
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No archived exercises.
      </div>
    );
  }

  async function handleUnarchive(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
    setPendingUnarchiveId(null);
    try {
      await unarchiveExercise(id);
      toast.success("Exercise unarchived");
    } catch {
      toast.error("Failed to unarchive exercise");
    }
  }

  async function handleDelete(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
    setPendingDeleteId(null);
    try {
      await deleteExercise(id);
      toast.success("Exercise deleted");
    } catch {
      toast.error("Failed to delete exercise");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-primary">
        Archived Exercises
      </h1>
      <ul className="space-y-3 z-[0]">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="border rounded p-4 flex flex-col gap-1 bg-card relative z-[0]"
          >
            <button
              className="absolute top-4 right-2 text-primary hover:text-green-600 transition"
              title="Unarchive"
              onClick={() => setPendingUnarchiveId(ex.id)}
            >
              <ArrowUpCircle className="w-5 h-5" />
            </button>
            <button
              className="absolute top-4 right-10 text-destructive hover:text-red-600 transition"
              title="Delete"
              onClick={() => setPendingDeleteId(ex.id)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            {ex.workout_days?.name && (
              <span className="inline-block text-xs bg-muted text-muted-foreground rounded px-2 py-0.5 mb-1 w-fit">
                {ex.workout_days.name}
              </span>
            )}
            <span className="font-semibold text-md">{ex.name}</span>
            <div className="flex flex-row gap-4">
              <span className="text-muted-foreground text-sm">
                Sets: {ex.sets}
              </span>
              <span className="text-muted-foreground text-sm">
                Weight: {ex.weight ? `${ex.weight}kg` : "-"}
              </span>
            </div>
            <ConfirmModal
              open={pendingUnarchiveId === ex.id}
              title="Unarchive Exercise"
              description={`Are you sure you want to unarchive '${ex.name}'?`}
              confirmLabel="Unarchive"
              cancelLabel="Cancel"
              confirmVariant="outline"
              onConfirm={() => handleUnarchive(ex.id)}
              onCancel={() => setPendingUnarchiveId(null)}
            />
            <ConfirmModal
              open={pendingDeleteId === ex.id}
              title="Delete Exercise"
              description={`Are you sure you want to delete '${ex.name}'? This cannot be undone.`}
              confirmLabel="Delete"
              cancelLabel="Cancel"
              confirmVariant="destructive"
              onConfirm={() => handleDelete(ex.id)}
              onCancel={() => setPendingDeleteId(null)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
