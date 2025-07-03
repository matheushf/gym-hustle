import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, CheckIcon, PlayIcon, SquareIcon, PencilIcon } from "lucide-react";
import { ExerciseItem } from "./ExerciseItem";
import type { Exercise, WorkoutDay } from "@/app/actions/workout";
import { useEffect, useRef, useState } from 'react';
import { EditingExercise, NewExercise } from "@/app/workout/types";
import { startWorkoutTimer, stopWorkoutTimer, getLastWorkoutTimer, type WorkoutTime, updateWorkoutTimerDuration } from '@/app/actions/workout';

interface DaySectionProps {
  dayName: string;
  dayWorkout: WorkoutDay | undefined;
  isLoading: boolean;
  isAddingExercise: string | null;
  editingExercise: EditingExercise | null;
  newExercise: NewExercise;
  loadingStates: LoadingStates;
  onDragEnd: (event: DragEndEvent, dayId: string) => void;
  onAddExerciseClick: (dayName: string, existingDayId?: string) => void;
  onAddExercise: (dayId: string) => void;
  onCancelAdd: () => void;
  onUpdateExercise: () => void;
  onEditingExerciseChange: (field: keyof EditingExercise, value: string) => void;
  onNewExerciseChange: (field: keyof NewExercise, value: string) => void;
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (id: string) => void;
  onCancelEdit: () => void;
  onRequestMove?: (exercise: Exercise, fromDayId: string) => void;
  onArchiveExercise?: (id: string) => void;
  isCurrentDay?: boolean;
  isCreatingNew?: boolean;
  onNewExerciseSetChange: (idx: number, field: 'reps' | 'weight', value: string) => void;
  onAddNewExerciseSet: () => void;
  onRemoveNewExerciseSet: (idx: number) => void;
  onEditingExerciseSetChange: (idx: number, field: 'reps' | 'weight', value: string) => void;
  onRemoveEditingExerciseSet: (idx: number) => void;
  onAddEditingExerciseSet: () => void;
  workoutId: string;
}

interface LoadingStates {
  adding: boolean;
  editingId: string | null;
  deletingId: string | null;
}

export function DaySection({
  dayName,
  dayWorkout,
  isLoading,
  isAddingExercise,
  editingExercise,
  newExercise,
  loadingStates,
  onDragEnd,
  onAddExerciseClick,
  onAddExercise,
  onCancelAdd,
  onUpdateExercise,
  onEditingExerciseChange,
  onNewExerciseChange,
  onEditExercise,
  onDeleteExercise,
  onCancelEdit,
  onRequestMove,
  onArchiveExercise,
  isCurrentDay = false,
  isCreatingNew = false,
  onNewExerciseSetChange,
  onAddNewExerciseSet,
  onRemoveNewExerciseSet,
  onEditingExerciseSetChange,
  onRemoveEditingExerciseSet,
  onAddEditingExerciseSet,
  workoutId,
}: DaySectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const weightInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousExerciseIdRef = useRef<string | null>(null);

  // TIMER STATE/LOGIC
  const [timer, setTimer] = useState<WorkoutTime | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0); // seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [editHours, setEditHours] = useState('0');
  const [editMinutes, setEditMinutes] = useState('0');

  useEffect(() => {
    if (editingExercise && editingExercise.id !== previousExerciseIdRef.current) {
      weightInputRef.current?.focus();
      previousExerciseIdRef.current = editingExercise.id;
    } else if (!editingExercise) {
      previousExerciseIdRef.current = null;
    }
  }, [editingExercise]);

  useEffect(() => {
    if (isAddingExercise) {
      nameInputRef.current?.focus();
    }
  }, [isAddingExercise]);

  // Fetch last timer on mount or when workoutId/dayName changes
  useEffect(() => {
    let ignore = false;
    async function fetchTimer() {
      setLoadingTimer(true);
      try {
        const last = await getLastWorkoutTimer(workoutId, dayName);
        if (!ignore) {
          setTimer(last);
          if (last && last.ended_at === null) {
            setIsRunning(true);
            setElapsed(Math.floor((Date.now() - new Date(last.started_at).getTime()) / 1000));
          } else if (last && last.duration_seconds != null) {
            setIsRunning(false);
            setElapsed(last.duration_seconds);
          } else {
            setIsRunning(false);
            setElapsed(0);
          }
        }
      } finally {
        setLoadingTimer(false);
      }
    }
    fetchTimer();
    return () => { ignore = true; };
  }, [workoutId, dayName]);

  // Live timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // When timer changes, update edit fields
  useEffect(() => {
    if (timer && timer.duration_seconds != null) {
      const h = Math.floor(timer.duration_seconds / 3600);
      const m = Math.floor((timer.duration_seconds % 3600) / 60);
      setEditHours(h.toString());
      setEditMinutes(m.toString());
    }
  }, [timer]);

  // Save edited duration
  async function handleSaveDuration() {
    setLoadingTimer(true);
    try {
      const hours = parseInt(editHours, 10) || 0;
      const minutes = parseInt(editMinutes, 10) || 0;
      const newDuration = hours * 3600 + minutes * 60;
      if (!timer) return;
      const updated = await updateWorkoutTimerDuration(timer.id, newDuration);
      setTimer(updated);
      setElapsed(updated.duration_seconds ?? 0);
      setEditingDuration(false);
    } finally {
      setLoadingTimer(false);
    }
  }

  // Fetch last timer on mount or when workoutId/dayName changes
  useEffect(() => {
    let ignore = false;
    async function fetchTimer() {
      setLoadingTimer(true);
      try {
        const last = await getLastWorkoutTimer(workoutId, dayName);
        if (!ignore) {
          setTimer(last);
          if (last && last.ended_at === null) {
            setIsRunning(true);
            setElapsed(Math.floor((Date.now() - new Date(last.started_at).getTime()) / 1000));
          } else if (last && last.duration_seconds != null) {
            setIsRunning(false);
            setElapsed(last.duration_seconds);
          } else {
            setIsRunning(false);
            setElapsed(0);
          }
        }
      } finally {
        setLoadingTimer(false);
      }
    }
    fetchTimer();
    return () => { ignore = true; };
  }, [workoutId, dayName]);

  // Live timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // When timer changes, update edit fields
  useEffect(() => {
    if (timer && timer.duration_seconds != null) {
      const h = Math.floor(timer.duration_seconds / 3600);
      const m = Math.floor((timer.duration_seconds % 3600) / 60);
      setEditHours(h.toString());
      setEditMinutes(m.toString());
    }
  }, [timer]);

  // Format seconds as HH:MM:SS
  function formatDuration(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }

  // Start timer handler
  async function handleStart() {
    setLoadingTimer(true);
    try {
      const started = await startWorkoutTimer(workoutId, dayName);
      setTimer(started);
      setIsRunning(true);
      setElapsed(0);
    } finally {
      setLoadingTimer(false);
    }
  }

  // Stop timer handler
  async function handleStop() {
    setLoadingTimer(true);
    try {
      const stopped = await stopWorkoutTimer(workoutId, dayName);
      setTimer(stopped);
      setIsRunning(false);
      if (stopped && stopped.duration_seconds != null) {
        setElapsed(stopped.duration_seconds);
      }
    } finally {
      setLoadingTimer(false);
    }
  }

  // Save edited duration
  const exercises = dayWorkout?.exercises || [];
  const hasExercises = exercises.length > 0;

  return (
    <div className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm${isCurrentDay && !isCreatingNew ? ' border-1 border-primary' : ''}`}>
      <h2 className="text-xl font-semibold mb-2">{dayName}</h2>
      {/* TIMER UI */}
      <div className="mb-4 ml-[-6px] flex flex-col items-start gap-2">
        {loadingTimer ? (
          <span className="text-muted-foreground text-sm">Loading timer...</span>
        ) : (
          <div className="flex items-center gap-2">
            {isCurrentDay && !isCreatingNew && (
              isRunning ? (
                <Button size="icon" variant="ghost" onClick={handleStop} disabled={loadingTimer} aria-label="Stop Timer">
                  <SquareIcon className="w-5 h-5 text-red-600" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" onClick={handleStart} disabled={loadingTimer} aria-label="Start Timer">
                  <PlayIcon className="w-5 h-5 text-green-600" />
                </Button>
              )
            )}
            <span className="text-sm flex items-center gap-2">
              {isRunning
                ? <>Workout started: <span className="font-mono ml-2">{formatDuration(elapsed)}</span></>
                : timer && timer.duration_seconds != null && !editingDuration
                  ? <>
                      Last workout: <span className="font-mono ml-2">{formatDuration(timer.duration_seconds)}</span>
                      <button
                        className="ml-1 p-1 hover:bg-muted rounded"
                        onClick={() => setEditingDuration(true)}
                        aria-label="Edit duration"
                        type="button"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                    </>
                  : timer && timer.duration_seconds != null && editingDuration
                    ? <>
                        Last workout:
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={editHours}
                          onChange={e => setEditHours(e.target.value)}
                          className="w-15 mx-1 px-1 py-0.5 border rounded text-center font-mono"
                          aria-label="Hours"
                        />
                        :
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={editMinutes}
                          onChange={e => setEditMinutes(e.target.value)}
                          className="w-15 mx-1 px-1 py-0.5 border rounded text-center font-mono"
                          aria-label="Minutes"
                        />
                        <Button size="icon" variant="ghost" onClick={handleSaveDuration} disabled={loadingTimer} aria-label="Save duration">
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingDuration(false)} disabled={loadingTimer} aria-label="Cancel edit">
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                  : <div className="ml-2">Last workout: 00:00:00</div>
              }
            </span>
          </div>
        )}
      </div>
      {/* END TIMER UI */}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Loading exercises...</p>
        </div>
      ) : (
        <>
          {hasExercises && dayWorkout && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onDragEnd(event, dayWorkout.id)}
            >
              <SortableContext
                items={exercises.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-3 mb-6">
                  {exercises.map((exercise) => (
                    editingExercise?.id === exercise.id ? (
                      <li key={exercise.id}>
                        <div className="flex flex-col gap-3">
                          <Input
                            value={editingExercise.name}
                            onChange={(e) => onEditingExerciseChange('name', e.target.value)}
                            className="w-full bg-transparent border-muted"
                          />
                          {(editingExercise.sets as { id?: string; reps: string; weight: string }[]).map((set: { id?: string; reps: string; weight: string }, idx: number) => (
                            <div className="flex items-center gap-3 mb-2" key={set.id || idx}>
                              <Input
                                placeholder="1x10"
                                value={set.reps}
                                onChange={(e) => onEditingExerciseSetChange(idx, 'reps', e.target.value)}
                                className="flex-1 bg-transparent border-muted"
                              />
                              <Input
                                placeholder="10kg"
                                type="number"
                                value={set.weight}
                                onChange={(e) => onEditingExerciseSetChange(idx, 'weight', e.target.value)}
                                className="flex-1 bg-transparent border-muted"
                              />
                              {idx === editingExercise.sets.length - 1 && (
                                <Button
                                  variant="ghost"
                                  onClick={() => onAddEditingExerciseSet()}
                                  type="button"
                                  aria-label="Add set"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                onClick={() => onRemoveEditingExerciseSet(idx)}
                                disabled={editingExercise.sets.length === 1}
                                type="button"
                                aria-label="Remove set"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex flex-1 items-end justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={onUpdateExercise}
                              disabled={loadingStates.editingId === exercise.id}
                            >
                              {loadingStates.editingId === exercise.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4 text-green-600 mr-2" /> Save
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={onCancelEdit}
                              disabled={loadingStates.editingId === exercise.id}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ) : (
                      <ExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onEdit={onEditExercise}
                        onDelete={onDeleteExercise}
                        isDeleting={loadingStates.deletingId === exercise.id}
                        onRequestMove={onRequestMove}
                        fromDayId={dayWorkout.id}
                        onArchive={onArchiveExercise}
                      />
                    )
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
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
            <div className="flex flex-col gap-3">
              <Input
                ref={nameInputRef}
                placeholder="Biceps curl"
                value={newExercise.name}
                onChange={e => onNewExerciseChange('name', e.target.value)}
                className="w-full bg-transparent border-muted"
              />
              {newExercise.sets.map((set, idx) => (
                <div className="flex items-center gap-3 mb-2" key={idx}>
                  <Input
                    placeholder="1x10"
                    value={set.reps}
                    onChange={e => onNewExerciseSetChange(idx, 'reps', e.target.value)}
                    className="flex-1 bg-transparent border-muted"
                  />
                  <Input
                    placeholder="15kg"
                    type="number"
                    value={set.weight}
                    onChange={e => onNewExerciseSetChange(idx, 'weight', e.target.value)}
                    className="flex-1 bg-transparent border-muted"
                  />
                  {idx === newExercise.sets.length - 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => onAddNewExerciseSet()}
                      type="button"
                      aria-label="Add set"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => onRemoveNewExerciseSet(idx)}
                    disabled={newExercise.sets.length === 1}
                    type="button"
                    aria-label="Remove set"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 justify-between">
                <Button
                  variant="secondary"
                  className="flex-initial"
                  onClick={onAddNewExerciseSet}
                >
                  Add Set
                </Button>
                <div className="flex gap-1 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddExercise(dayWorkout.id)}
                    disabled={loadingStates.adding}
                  >
                    {loadingStates.adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                      <Plus className="h-4 w-4 text-green-600 mr-2" />
                      Add exercise
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onCancelAdd}
                    disabled={loadingStates.adding}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground"
              onClick={() => onAddExerciseClick(dayName, dayWorkout?.id)}
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
} 