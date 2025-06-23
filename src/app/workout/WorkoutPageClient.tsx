"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  updateExercise,
  updateExerciseOrder,
  deleteExercise,
  createExercise,
  createWorkoutDay,
  type WorkoutDay,
  type Exercise,
} from "@/app/actions/workout";
import { DaySection } from "@/app/workout/components/workout/DaySection";
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface WorkoutPageClientProps {
  initialWorkoutDays: WorkoutDay[];
}

interface EditingExercise {
  id: string;
  name: string;
  sets: string;
  weight: string;
}

interface NewExercise {
  name: string;
  sets: string;
  weight: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function WorkoutPageClient({ initialWorkoutDays }: WorkoutPageClientProps) {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(initialWorkoutDays);
  const [editingExercise, setEditingExercise] = useState<EditingExercise | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    sets: "",
    weight: "",
  });
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editingId: null as string | null,
    deletingId: null as string | null,
  });
  const [moveExercise, setMoveExercise] = useState<{
    exercise: Exercise | null;
    fromDayId: string | null;
  } | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [pendingMoveDayId, setPendingMoveDayId] = useState<string | null>(null);

  // Create refs for each day
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const today = new Date();
    const currentDayName = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
    const ref = dayRefs.current[currentDayName];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []); // Only on mount

  async function handleUpdateExercise() {
    if (!editingExercise) return;

    setLoadingStates(prev => ({ ...prev, editingId: editingExercise.id }));
    try {
      const weight = editingExercise.weight
        ? parseFloat(editingExercise.weight)
        : undefined;

      await updateExercise(editingExercise.id, {
        name: editingExercise.name,
        sets: editingExercise.sets,
        weight,
      });

      setEditingExercise(null);
      
      // Optimistically update the UI
      setWorkoutDays(prev => prev.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => 
          ex.id === editingExercise.id 
            ? { 
                ...ex, 
                name: editingExercise.name,
                sets: editingExercise.sets,
                weight: weight,
              }
            : ex
        )
      })));
      
      toast.success("Exercise updated successfully");
    } catch {
      toast.error("Failed to update exercise");
    } finally {
      setLoadingStates(prev => ({ ...prev, editingId: null }));
    }
  }

  async function handleAddExerciseClick(
    dayName: string,
    existingDayId?: string
  ) {
    try {
      if (!existingDayId) {
        const newDay = await createWorkoutDay(dayName);
        setWorkoutDays((prev) => [...prev, newDay]);
        setIsAddingExercise(newDay.id);
      } else {
        setIsAddingExercise(existingDayId);
      }
    } catch {
      toast.error("Failed to create workout day");
    }
  }

  async function handleAddExercise(dayId: string) {
    setLoadingStates(prev => ({ ...prev, adding: true }));
    try {
      if (!newExercise.name || !newExercise.sets) {
        toast.error("Please fill in exercise name and sets");
        return;
      }

      const weight = newExercise.weight
        ? parseFloat(newExercise.weight)
        : undefined;

      const newExerciseData = await createExercise(dayId, newExercise.name, newExercise.sets, weight);

      setIsAddingExercise(null);
      setNewExercise({ name: "", sets: "", weight: "" });
      
      // Optimistically update the UI
      setWorkoutDays(prev => prev.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: [...day.exercises, newExerciseData]
          };
        }
        return day;
      }));
      
      toast.success("Exercise added successfully");
    } catch {
      toast.error("Failed to add exercise");
    } finally {
      setLoadingStates(prev => ({ ...prev, adding: false }));
    }
  }

  async function handleDeleteExercise(exerciseId: string) {
    setLoadingStates(prev => ({ ...prev, deletingId: exerciseId }));
    try {
      await deleteExercise(exerciseId);
      
      // Optimistically update the UI
      setWorkoutDays(prev => prev.map(day => ({
        ...day,
        exercises: day.exercises.filter(ex => ex.id !== exerciseId)
      })));
      
      toast.success("Exercise deleted successfully");
    } catch {
      toast.error("Failed to delete exercise");
    } finally {
      setLoadingStates(prev => ({ ...prev, deletingId: null }));
    }
  }

  function getDayWorkout(dayName: string) {
    return workoutDays.find((day) => day.name === dayName);
  }

  function handleEditExercise(exercise: Exercise) {
    setEditingExercise({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      weight: exercise.weight?.toString() || "",
    });
  }

  function handleCancelAdd() {
    setIsAddingExercise(null);
    setNewExercise({ name: "", sets: "", weight: "" });
  }

  async function handleDragEnd(event: DragEndEvent, dayId: string) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const dayWorkout = workoutDays.find(day => day.id === dayId);
    if (!dayWorkout) return;

    const oldIndex = dayWorkout.exercises.findIndex(ex => ex.id === active.id);
    const newIndex = dayWorkout.exercises.findIndex(ex => ex.id === over.id);

    setWorkoutDays(prev => prev.map(day => {
      if (day.id === dayId) {
        const newExercises = arrayMove(day.exercises, oldIndex, newIndex);
        return {
          ...day,
          exercises: newExercises,
        };
      }
      return day;
    }));

    try {
      const newExercises = arrayMove(dayWorkout.exercises, oldIndex, newIndex);
      
      await Promise.all(
        newExercises.map((exercise, index) => 
          updateExerciseOrder(exercise.id, index)
        )
      );
    } catch {
      setWorkoutDays(prev => prev.map(day => {
        if (day.id === dayId) {
          const revertedExercises = arrayMove(day.exercises, newIndex, oldIndex);
          return {
            ...day,
            exercises: revertedExercises,
          };
        }
        return day;
      }));
      toast.error("Failed to update exercise order");
    }
  }

  function handleEditingExerciseChange(field: keyof EditingExercise, value: string) {
    setEditingExercise(prev => prev ? { ...prev, [field]: value } : null);
  }

  function handleNewExerciseChange(field: keyof NewExercise, value: string) {
    setNewExercise(prev => ({ ...prev, [field]: value }));
  }

  // Handler to open the move-to-day modal
  function handleRequestMoveExercise(exercise: Exercise, fromDayId: string) {
    setMoveExercise({ exercise, fromDayId });
    setShowMoveModal(true);
  }

  // Handler to actually move the exercise
  async function handleMoveExerciseToDay(toDayId: string) {
    if (!moveExercise?.exercise || !moveExercise.fromDayId) return;
    const exercise = moveExercise.exercise;
    const fromDayId = moveExercise.fromDayId;
    setShowMoveModal(false);
    setMoveExercise(null);
    try {
      // Remove from old day, add to new day at the end
      setWorkoutDays(prev => {
        let removedExercise: Exercise | null = null;
        const newDays = prev.map(day => {
          if (day.id === fromDayId) {
            const filtered = day.exercises.filter(ex => {
              if (ex.id === exercise.id) {
                removedExercise = ex;
                return false;
              }
              return true;
            });
            return { ...day, exercises: filtered };
          }
          return day;
        }).map(day => {
          if (day.id === toDayId && removedExercise) {
            return { ...day, exercises: [...day.exercises, { ...removedExercise, order: day.exercises.length }] };
          }
          return day;
        });
        return newDays;
      });
      // Update backend: change workout_day_id and order
      await updateExercise(exercise.id, { workout_day_id: toDayId, order: workoutDays.find(d => d.id === toDayId)?.exercises.length || 0 });
      toast.success("Exercise moved successfully");
    } catch {
      toast.error("Failed to move exercise");
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <main className="space-y-4">
        {DAYS_OF_WEEK.map((dayName) => (
          <div
            key={dayName}
            ref={el => { dayRefs.current[dayName] = el; }}
          >
            <DaySection
              dayName={dayName}
              dayWorkout={getDayWorkout(dayName)}
              isLoading={false}
              isAddingExercise={isAddingExercise}
              editingExercise={editingExercise}
              newExercise={newExercise}
              loadingStates={loadingStates}
              onDragEnd={handleDragEnd}
              onAddExerciseClick={handleAddExerciseClick}
              onAddExercise={handleAddExercise}
              onCancelAdd={handleCancelAdd}
              onUpdateExercise={handleUpdateExercise}
              onEditingExerciseChange={handleEditingExerciseChange}
              onNewExerciseChange={handleNewExerciseChange}
              onEditExercise={handleEditExercise}
              onDeleteExercise={handleDeleteExercise}
              onCancelEdit={() => setEditingExercise(null)}
              onRequestMove={handleRequestMoveExercise}
            />
          </div>
        ))}
      </main>
      {showMoveModal && moveExercise?.exercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-xs border">
            {!pendingMoveDayId && (
              <>
                <h2 className="text-lg font-semibold mb-2">Move Exercise</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a day to move <span className="font-bold">{moveExercise.exercise.name}</span> to:
                </p>
              </>
            )}
            {!pendingMoveDayId ? (
              <div className="flex flex-col gap-2 mb-4">
                {DAYS_OF_WEEK.map(dayName => {
                  const day = workoutDays.find(d => d.name === dayName);
                  // Don't show current day as an option
                  if (!day || day.id === moveExercise.fromDayId) return null;
                  return (
                    <button
                      key={day.id}
                      className="w-full py-2 px-4 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition"
                      onClick={() => setPendingMoveDayId(day.id)}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-4">
                <p className="text-sm">Are you sure you want to move <span className="font-bold">{moveExercise.exercise.name}</span> to <span className="font-bold">{DAYS_OF_WEEK.find(dayName => workoutDays.find(d => d.name === dayName)?.id === pendingMoveDayId)}</span>?</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
                    onClick={() => { handleMoveExerciseToDay(pendingMoveDayId); setPendingMoveDayId(null); }}
                  >
                    Confirm
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded bg-muted text-muted-foreground hover:bg-accent transition"
                    onClick={() => setPendingMoveDayId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <button
              className="w-full py-2 px-4 rounded bg-muted text-muted-foreground hover:bg-accent transition mt-2"
              onClick={() => { setShowMoveModal(false); setMoveExercise(null); setPendingMoveDayId(null); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 