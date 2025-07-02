"use client";

import type { Workout } from "@/app/actions/workout";
import { useTransition } from "react";
import { setSelectedWorkout, deleteWorkout } from "@/app/actions/workout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import jsPDF from "jspdf";

export function SavedWorkoutsClient({ workouts, selectedWorkoutId }: { workouts: Workout[]; selectedWorkoutId: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete(workoutId: string) {
    setPendingDeleteId(null);
    startTransition(async () => {
      await deleteWorkout(workoutId);
      window.location.reload();
    });
  }

  function handleExportPDF() {
    const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);
    if (!selectedWorkout) return;
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(18);
    doc.text(selectedWorkout.name, 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Created: ${new Date(selectedWorkout.created_at).toLocaleDateString()}`, 10, y);
    y += 10;
    if (!selectedWorkout.days || selectedWorkout.days.length === 0) {
      doc.text("No days in this workout.", 10, y);
    } else {
      selectedWorkout.days.forEach((day, dayIdx) => {
        doc.setFont("helvetica", "bold");
        doc.text(`Day ${dayIdx + 1}: ${day.name}`, 10, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        if (!day.exercises || day.exercises.length === 0) {
          doc.text("  No exercises", 12, y);
          y += 8;
        } else {
          day.exercises.forEach((ex, exIdx) => {
            doc.text(`  ${exIdx + 1}. ${ex.name}`, 12, y);
            y += 7;
            if (ex.sets && ex.sets.length > 0) {
              ex.sets.forEach((set) => {
                doc.text(
                  `    Set ${set.set_number}: ${set.reps} reps @ ${set.weight ?? '-'} kg`,
                  14,
                  y
                );
                y += 6;
                if (y > 270) { doc.addPage(); y = 15; }
              });
            } else {
              doc.text("    No sets", 14, y);
              y += 6;
            }
            if (y > 270) { doc.addPage(); y = 15; }
          });
        }
        y += 4;
        if (y > 270) { doc.addPage(); y = 15; }
      });
    }
    doc.save(`${selectedWorkout.name.replace(/[^a-z0-9]/gi, '_')}_workout.pdf`);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={!selectedWorkoutId}
        >
          Export as PDF
        </Button>
      </div>
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
                {!isSelected && (
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-destructive"
                    title="Delete workout"
                    disabled={isPending}
                    onClick={() => setPendingDeleteId(workout.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
                <div className="flex gap-2 mt-2 mb-2">
                  <Button
                    variant="outline"
                    className="ml-[-4px]"
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
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(workout.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {workout.days?.length || 0} days
                </div>
                {workout.days && workout.days.length > 0 && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="days">
                      <AccordionTrigger className="text-sm font-semibold justify-start hover:text-primary hover:no-underline">View Days & Exercises</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2">
                          {workout.days.map((day) => (
                            <div key={day.id} className="border rounded p-2 bg-muted">
                              <div className="font-medium text-xs mb-1">{day.name}</div>
                              {day.exercises && day.exercises.length > 0 ? (
                                <ul className="list-disc list-inside text-xs text-muted-foreground">
                                  {day.exercises.map((ex) => (
                                    <li key={ex.id}>{ex.name}</li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-xs text-muted-foreground italic">No exercises</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                <ConfirmModal
                  open={pendingDeleteId === workout.id}
                  title="Delete Workout"
                  description={`Are you sure you want to delete '${workout.name}'? This cannot be undone.`}
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  confirmVariant="destructive"
                  onConfirm={() => handleDelete(workout.id)}
                  onCancel={() => setPendingDeleteId(null)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 