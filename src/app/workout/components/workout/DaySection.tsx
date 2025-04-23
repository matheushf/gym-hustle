import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, CheckIcon } from "lucide-react";
import { ExerciseItem } from "./ExerciseItem";
import type { Exercise, WorkoutDay } from "@/app/actions/workout";
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (editingExercise) {
      weightInputRef.current?.focus();
    }
  }, [editingExercise]);

  useEffect(() => {
    if (isAddingExercise) {
      nameInputRef.current?.focus();
    }
  }, [isAddingExercise]);

  const exercises = dayWorkout?.exercises || [];
  const hasExercises = exercises.length > 0;

  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{dayName}</h2>

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
                          <div className="flex items-center gap-3">
                            <Input
                              value={editingExercise.sets}
                              onChange={(e) => onEditingExerciseChange('sets', e.target.value)}
                              className="flex-1 bg-transparent border-muted"
                            />
                            <Input
                              ref={weightInputRef}
                              type="number"
                              value={editingExercise.weight}
                              onChange={(e) => onEditingExerciseChange('weight', e.target.value)}
                              className="flex-1 bg-transparent border-muted"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={onUpdateExercise}
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
                                onClick={onCancelEdit}
                                disabled={loadingStates.editingId === exercise.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
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
                onChange={(e) => onNewExerciseChange('name', e.target.value)}
                className="w-full bg-transparent border-muted"
              />
              <div className="flex items-center gap-3">
                <Input
                  placeholder="3×10"
                  value={newExercise.sets}
                  onChange={(e) => onNewExerciseChange('sets', e.target.value)}
                  className="flex-1 bg-transparent border-muted"
                />
                <Input
                  placeholder="15kg"
                  type="number"
                  value={newExercise.weight}
                  onChange={(e) => onNewExerciseChange('weight', e.target.value)}
                  className="flex-1 bg-transparent border-muted"
                />
                <div className="flex gap-1">
                  <Button
                    onClick={() => onAddExercise(dayWorkout.id)}
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