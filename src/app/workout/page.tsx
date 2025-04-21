"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, CheckIcon, Trash2, X, DumbbellIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getWorkoutDays,
  updateExercise,
  deleteExercise,
  createExercise,
  createWorkoutDay,
  type WorkoutDay,
  type Exercise,
} from "@/app/actions/workout";
import { logout } from "@/app/actions/auth";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface EditingExercise {
  id: string;
  name: string;
  sets: string;
  weight: string;
}

export default function WorkoutPage() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [editingExercise, setEditingExercise] =
    useState<EditingExercise | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: "",
    weight: "",
  });
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editingId: null as string | null,
    deletingId: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    loadWorkoutDays();
  }, []);

  async function loadWorkoutDays() {
    setIsLoading(true);
    try {
      const days = await getWorkoutDays();
      setWorkoutDays(days || []);
    } catch {
      toast.error("Failed to load workout days");
    } finally {
      setIsLoading(false);
    }
  }

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
      await loadWorkoutDays();
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
        // Create new workout day if it doesn't exist
        const newDay = await createWorkoutDay(dayName);
        setWorkoutDays((prev) => [...prev, newDay]);
        setIsAddingExercise(newDay.id);
      } else {
        setIsAddingExercise(existingDayId);
      }
    } catch (error) {
      toast.error("Failed to create workout day");
    }
  }

  async function handleAddExercise(dayId: string) {
    try {
      if (!newExercise.name || !newExercise.sets) {
        toast.error("Please fill in exercise name and sets");
        return;
      }

      const weight = newExercise.weight
        ? parseFloat(newExercise.weight)
        : undefined;

      await createExercise(dayId, newExercise.name, newExercise.sets, weight);

      setIsAddingExercise(null);
      setNewExercise({ name: "", sets: "", weight: "" });
      await loadWorkoutDays();
      toast.success("Exercise added successfully");
    } catch {
      toast.error("Failed to add exercise");
    }
  }

  async function handleDeleteExercise(exerciseId: string) {
    setLoadingStates(prev => ({ ...prev, deletingId: exerciseId }));
    try {
      await deleteExercise(exerciseId);
      await loadWorkoutDays();
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

  function startEditing(exercise: Exercise) {
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

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await logout();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">Gym Hustle</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Matheus Victor</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Sign out
          </Button>
        </div>
      </header>

      <main className="space-y-4">
        {DAYS_OF_WEEK.map((dayName) => {
          const dayWorkout = getDayWorkout(dayName);
          const exercises = dayWorkout?.exercises || [];
          const hasExercises = exercises.length > 0;

          return (
            <div
              key={dayName}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-6">{dayName}</h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm">Loading exercises...</p>
                </div>
              ) : (
                <>
                  {hasExercises && (
                    <ul className="space-y-3 mb-6">
                      {exercises.map((exercise) => (
                        <li
                          key={exercise.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {editingExercise?.id === exercise.id ? (
                            <div className="flex items-center gap-3 w-full">
                              <Input
                                value={editingExercise.name}
                                onChange={(e) =>
                                  setEditingExercise((prev) => ({
                                    ...prev!,
                                    name: e.target.value,
                                  }))
                                }
                                className="flex-1 bg-transparent border-muted"
                              />
                              <Input
                                value={editingExercise.sets}
                                onChange={(e) =>
                                  setEditingExercise((prev) => ({
                                    ...prev!,
                                    sets: e.target.value,
                                  }))
                                }
                                className="w-24 bg-transparent border-muted"
                              />
                              <Input
                                type="number"
                                value={editingExercise.weight}
                                onChange={(e) =>
                                  setEditingExercise((prev) => ({
                                    ...prev!,
                                    weight: e.target.value,
                                  }))
                                }
                                className="w-24 bg-transparent border-muted"
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleUpdateExercise}
                                  disabled={loadingStates.editingId === exercise.id}
                                >
                                  {loadingStates.editingId === exercise.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckIcon className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingExercise(null)}
                                  disabled={loadingStates.editingId === exercise.id}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-primary">
                                <DumbbellIcon className="h-4 w-4" />
                              </span>
                              <span className="mr-4">{exercise.name}</span>
                              <span className="mr-4 text-muted-foreground mr-2">
                                {exercise.sets}
                              </span>
                              <span className="mr-4 text-muted-foreground mr-2">
                                {exercise.weight ? `${exercise.weight}kg` : "-"}
                              </span>
                              <div className="flex-1 text-right gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(exercise)}
                                  disabled={loadingStates.deletingId === exercise.id}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  disabled={loadingStates.deletingId === exercise.id}
                                >
                                  {loadingStates.deletingId === exercise.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {!hasExercises && !isAddingExercise && (
                    <div className="text-center text-muted-foreground mb-6">
                      <p className="text-base mb-2">
                        No workout planned for {dayName}
                      </p>
                      <p className="text-sm">Guess you should rest</p>
                    </div>
                  )}

                  {isAddingExercise === dayWorkout?.id ? (
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Biceps curl"
                        value={newExercise.name}
                        onChange={(e) =>
                          setNewExercise((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="flex-1 bg-transparent border-muted"
                      />
                      <Input
                        placeholder="3×10"
                        value={newExercise.sets}
                        onChange={(e) =>
                          setNewExercise((prev) => ({
                            ...prev,
                            sets: e.target.value,
                          }))
                        }
                        className="w-24 bg-transparent border-muted"
                      />
                      <Input
                        placeholder="15kg"
                        type="number"
                        value={newExercise.weight}
                        onChange={(e) =>
                          setNewExercise((prev) => ({
                            ...prev,
                            weight: e.target.value,
                          }))
                        }
                        className="w-24 bg-transparent border-muted"
                      />
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleAddExercise(dayWorkout.id)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={loadingStates.adding}
                        >
                          {loadingStates.adding ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelAdd}
                          disabled={loadingStates.adding}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-muted-foreground"
                      onClick={() =>
                        handleAddExerciseClick(dayName, dayWorkout?.id)
                      }
                      disabled={isLoading}
                    >
                      <Plus className="h-5 w-5" />
                      Add new exercise
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
