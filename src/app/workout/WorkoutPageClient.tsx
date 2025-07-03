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
  archiveExercise,
  createWorkout,
  getWorkoutWithDays,
  updateWorkoutTitle,
  createExerciseSet,
  deleteExerciseSet,
  updateExerciseSet,
} from "@/app/actions/workout";
import { DaySection } from "@/app/workout/components/workout/DaySection";
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { CheckIcon, X, Edit, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { EditingExercise, NewExercise } from "@/app/workout/types";

interface WorkoutPageClientProps {
  workoutId: string;
  initialWorkoutTitle: string;
  initialWorkoutDays: WorkoutDay[];
  currentDayName: string;
  initialCurrentDayTimer: import("@/app/actions/workout").WorkoutTime | null;
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

export function WorkoutPageClient({ workoutId, initialWorkoutTitle, initialWorkoutDays, currentDayName, initialCurrentDayTimer }: WorkoutPageClientProps) {
  const router = useRouter();
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(initialWorkoutDays);
  const [editingExercise, setEditingExercise] = useState<EditingExercise | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    sets: [{ reps: "", weight: "" }],
  });
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editingId: null as string | null,
    deletingId: null as string | null,
    savingTitle: false,
  });
  const [moveExercise, setMoveExercise] = useState<{
    exercise: Exercise | null;
    fromDayId: string | null;
  } | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [pendingMoveDayId, setPendingMoveDayId] = useState<string | null>(null);
  // Title state
  const [workoutTitle, setWorkoutTitle] = useState<string>(initialWorkoutTitle);
  // New workout creation state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("New Workout");
  const prevWorkoutRef = useRef<{
    id: string;
    title: string;
    days: WorkoutDay[];
  } | null>(null);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(initialWorkoutTitle);

  // Create refs for each day
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const today = new Date();
    const currentDayName = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
    const ref = dayRefs.current[currentDayName];
    if (ref) {
      window.scrollTo({ top: ref.offsetTop - 90, behavior: "smooth" });
    }
  }, []); // Only on mount

  async function handleUpdateExercise() {
    if (!editingExercise) return;
    setLoadingStates(prev => ({ ...prev, editingId: editingExercise.id }));
    // Save previous state for rollback
    const prevWorkoutDays = [...workoutDays];
    try {
      // 1. Update exercise name
      await updateExercise(editingExercise.id, { name: editingExercise.name });
      // 2. Fetch current sets from backend (to compare for deletes)
      const currentSets = workoutDays.flatMap(day => day.exercises)
        .find(ex => ex.id === editingExercise.id)?.sets || [];
      const currentSetIds = currentSets.map(set => set.id);
      const editedSetIds = editingExercise.sets.filter(set => set.id).map(set => set.id);
      // 3. Delete removed sets
      for (const setId of currentSetIds) {
        if (!editedSetIds.includes(setId)) {
          await deleteExerciseSet(setId);
        }
      }
      // 4. Update or create sets
      const updatedSets: import("@/app/actions/workout").ExerciseSet[] = [];
      for (let i = 0; i < editingExercise.sets.length; i++) {
        const set = editingExercise.sets[i];
        if (set.id) {
          // Update the set in the database
          await updateExerciseSet(set.id, {
            reps: set.reps,
            weight: set.weight ? parseFloat(set.weight) : undefined,
            set_number: i + 1,
          });
          // For optimistic update, reuse the old set object with updated values, but ensure required fields
          const prevSet = currentSets.find(s => s.id === set.id);
          if (prevSet) {
            updatedSets.push({
              ...prevSet,
              reps: set.reps,
              weight: set.weight ? parseFloat(set.weight) : undefined,
              set_number: i + 1,
            });
          }
        } else {
          const createdSet = await createExerciseSet(editingExercise.id, i + 1, set.reps, set.weight ? parseFloat(set.weight) : undefined);
          updatedSets.push(createdSet);
        }
      }
      // Optimistically update UI
      setWorkoutDays(prev => prev.map(day => ({
        ...day,
        exercises: day.exercises.map(ex =>
          ex.id === editingExercise.id
            ? { ...ex, name: editingExercise.name, sets: updatedSets }
            : ex
        ),
      })));
      setEditingExercise(null);
      toast.success("Exercise updated successfully");
      // Background refetch
      setTimeout(() => router.refresh(), 0);
    } catch {
      // Rollback on error
      setWorkoutDays(prevWorkoutDays);
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
      console.log('oi-- handleAddExerciseClick', dayName, existingDayId)
      if (!existingDayId) {
        const newDay = await createWorkoutDay(dayName, workoutId);
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
    console.log('oi-- handleAddExercise', dayId)
    try {
      if (!newExercise.name || newExercise.sets.some(set => !set.reps)) {
        toast.error("Please fill in exercise name and all sets");
        return;
      }
      // 1. Create the exercise (no sets/weight)
      const newExerciseData = await createExercise(dayId, newExercise.name);
      // 2. Create each set
      const createdSets: import("@/app/actions/workout").ExerciseSet[] = [];
      for (let i = 0; i < newExercise.sets.length; i++) {
        const set = newExercise.sets[i];
        const createdSet = await createExerciseSet(newExerciseData.id, i + 1, set.reps, set.weight ? parseFloat(set.weight) : undefined);
        createdSets.push(createdSet);
      }
      // Optimistically update UI
      setWorkoutDays(prev => prev.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: [
              ...day.exercises,
              {
                id: newExerciseData.id,
                name: newExerciseData.name,
                order: newExerciseData.order,
                sets: createdSets,
              },
            ],
          };
        }
        return day;
      }));
      setIsAddingExercise(null);
      setNewExercise({ name: '', sets: [{ reps: '', weight: '' }] });
      toast.success("Exercise added successfully");
      // Background refetch
      setTimeout(() => router.refresh(), 0);
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
      router.refresh();
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
      sets: exercise.sets.map(set => ({
        id: set.id,
        reps: set.reps,
        weight: set.weight?.toString() || ""
      }))
    });
  }

  function handleCancelAdd() {
    setIsAddingExercise(null);
    setNewExercise({ name: "", sets: [{ reps: "", weight: "" }], });
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

  // Add handlers for array-based sets
  function onNewExerciseSetChange(idx: number, field: 'reps' | 'weight', value: string) {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => i === idx ? { ...set, [field]: value } : set),
    }));
  }
  function onAddNewExerciseSet() {
    setNewExercise(prev => ({
      ...prev,
      sets: [...prev.sets, { reps: '', weight: '' }],
    }));
  }
  function onRemoveNewExerciseSet(idx: number) {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.length > 1 ? prev.sets.filter((_, i) => i !== idx) : prev.sets,
    }));
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
      router.refresh();
    } catch {
      toast.error("Failed to move exercise");
    }
  }

  async function handleArchiveExercise(exerciseId: string) {
    setWorkoutDays(prev => prev.map(day => ({
      ...day,
      exercises: day.exercises.filter(ex => ex.id !== exerciseId)
    })));
    try {
      await archiveExercise(exerciseId);
      toast.success("Exercise archived");
      router.refresh();
    } catch {
      toast.error("Failed to archive exercise");
    }
  }

  // Handler for New Workout button
  function handleStartNewWorkout() {
    prevWorkoutRef.current = {
      id: workoutId,
      title: workoutTitle,
      days: workoutDays,
    };
    setIsCreatingNew(true);
    setNewWorkoutTitle("New Workout");
    setWorkoutTitle("New Workout");
    setWorkoutDays([]);
  }

  // Handler for Discard
  function handleDiscardNewWorkout() {
    if (prevWorkoutRef.current) {
      setWorkoutTitle(prevWorkoutRef.current.title);
      setWorkoutDays(prevWorkoutRef.current.days);
      setIsCreatingNew(false);
    }
  }

  // Handler for Confirm
  async function handleConfirmNewWorkout() {
    setLoadingStates(prev => ({ ...prev, savingTitle: true }));
    try {
      const created = await createWorkout(newWorkoutTitle.trim() || "New Workout");
      // Fetch full workout with days (should be empty)
      const newWorkout = await getWorkoutWithDays(created.id);
      setWorkoutTitle(newWorkout.name);
      setWorkoutDays(newWorkout.days);
      setIsCreatingNew(false);
      toast.success("New workout created");
      router.refresh();
    } catch {
      toast.error("Failed to create workout");
    } finally {
      setLoadingStates(prev => ({ ...prev, savingTitle: false }));
    }
  }

  // Save title handler
  async function handleSaveTitle() {
    if (tempTitle.trim() === "") {
      toast.error("Title cannot be empty");
      return;
    }
    setLoadingStates(prev => ({ ...prev, savingTitle: true }));
    try {
      await updateWorkoutTitle(workoutId, tempTitle.trim());
      setWorkoutTitle(tempTitle.trim());
      setEditingTitle(false);
      toast.success("Workout title updated");
      router.refresh();
    } catch {
      toast.error("Failed to update title");
    } finally {
      setLoadingStates(prev => ({ ...prev, savingTitle: false }));
    }
  }

  function onEditingExerciseSetChange(idx: number, field: 'reps' | 'weight', value: string) {
    setEditingExercise(prev => prev ? {
      ...prev,
      sets: prev.sets.map((set, i) => i === idx ? { ...set, [field]: value } : set),
    } : null);
  }

  function onAddEditingExerciseSet() {
    setEditingExercise(prev => prev ? {
      ...prev,
      sets: [...prev.sets, { reps: '', weight: '' }],
    } : null);
  }

  function onRemoveEditingExerciseSet(idx: number) {
    setEditingExercise(prev => prev ? {
      ...prev,
      sets: prev.sets.length > 1 ? prev.sets.filter((_, i) => i !== idx) : prev.sets,
    } : null);
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex-1 min-w-0 mb-4">
        {/* Workout Title and Confirm/Discard for new workout */}
        {isCreatingNew ? (
          <div className="flex flex-1 flex-row items-center justify-center gap-2 w-full">
            <Input
              value={newWorkoutTitle}
              onChange={e => setNewWorkoutTitle(e.target.value)}
              autoFocus
              disabled={loadingStates.savingTitle}
            />
            <div className="flex gap-2">
              <Button
                aria-label="Confirm new workout"
                variant="outline"
                onClick={handleConfirmNewWorkout}
                disabled={loadingStates.savingTitle}
              >
                <CheckIcon className="w-4 h-4 inline text-green-600 mr-2" /> Create
              </Button>
              <Button
                aria-label="Discard new workout"
                variant="outline"
                onClick={handleDiscardNewWorkout}
                disabled={loadingStates.savingTitle}
              >
                <X className="w-4 h-4 inline text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          editingTitle ? (
            <div className="flex flex-row flex-1 items-center justify-between gap-2 w-full">
              <Input
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                autoFocus
                onKeyDown={async e => {
                  if (e.key === 'Enter') {
                    await handleSaveTitle();
                  } else if (e.key === 'Escape') {
                    setTempTitle(workoutTitle);
                    setEditingTitle(false);
                  }
                }}
                disabled={loadingStates.savingTitle}
              />
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Save title"
                  variant="outline"
                  className="text-green-600"
                  onClick={handleSaveTitle}
                  disabled={loadingStates.savingTitle}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
                <Button
                  aria-label="Cancel edit"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => {
                    setTempTitle(workoutTitle);
                    setEditingTitle(false);
                  }}
                  disabled={loadingStates.savingTitle}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3
                className="text-1xl font-bold text-left flex items-center gap-2 cursor-pointer"
                onClick={() => setEditingTitle(true)}
                title="Click to edit title"
              >
                {workoutTitle}
              </h3>
              {!isCreatingNew && (
                <div className="flex items-center justify-center">
                  <Button variant="outline" className="flex-initial mr-2" onClick={() => setEditingTitle(true)}>
                    <Edit className="inline w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-initial"
                    onClick={handleStartNewWorkout}
                    >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>
      <main className="space-y-4">
        {DAYS_OF_WEEK.map((dayName) => {
          const isCurrentDay = dayName === currentDayName;
          return (
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
                onArchiveExercise={handleArchiveExercise}
                isCurrentDay={isCurrentDay}
                isCreatingNew={isCreatingNew}
                onNewExerciseSetChange={onNewExerciseSetChange}
                onAddNewExerciseSet={onAddNewExerciseSet}
                onRemoveNewExerciseSet={onRemoveNewExerciseSet}
                onEditingExerciseSetChange={onEditingExerciseSetChange}
                onAddEditingExerciseSet={onAddEditingExerciseSet}
                onRemoveEditingExerciseSet={onRemoveEditingExerciseSet}
                workoutId={workoutId}
                {...(isCurrentDay ? { initialTimer: initialCurrentDayTimer } : {})}
              />
            </div>
          );
        })}
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
              <>
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
                <button
                  className="w-full py-2 px-4 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80 transition mb-2"
                  onClick={async () => {
                    if (!moveExercise.exercise) return;
                    setShowMoveModal(false);
                    setMoveExercise(null);
                    setPendingMoveDayId(null);
                    setWorkoutDays(prev => prev.map(day => ({
                      ...day,
                      exercises: day.exercises.filter(ex => ex.id !== moveExercise.exercise!.id)
                    })));
                    try {
                      await archiveExercise(moveExercise.exercise.id);
                      toast.success("Exercise archived");
                      router.refresh();
                    } catch {
                      toast.error("Failed to archive exercise");
                    }
                  }}
                >
                  Archive Exercise
                </button>
              </>
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