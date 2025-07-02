import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { DumbbellIcon, Edit, GripVertical, Loader2, Trash2 } from "lucide-react";
import type { Exercise } from "@/app/actions/workout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState } from "react";

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onRequestMove?: (exercise: Exercise, fromDayId: string) => void;
  fromDayId?: string;
  onArchive?: (id: string) => void;
}

export function ExerciseItem({ exercise, onEdit, onDelete, isDeleting, onRequestMove, fromDayId, onArchive }: ExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete(exercise.id);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleArchive = () => {
    setShowConfirm(false);
    if (onArchive) onArchive(exercise.id);
  };

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-2 text-sm bg-card p-2"
      >
        <div className="flex items-center gap-2">
          <button
            className="touch-none p-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            type="button"
            onClick={() => { if (onRequestMove && fromDayId) onRequestMove(exercise, fromDayId); }}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-primary">
            <DumbbellIcon className="h-4 w-4" />
          </span>
          <span className="flex-1 font-medium">{exercise.name}</span>
        </div>
        
        <div className="flex items-center pl-12">
          <div className="flex-1 flex flex-col gap-1 mt-2">
            {exercise.sets && exercise.sets.length > 0 ? (
              exercise.sets.map((set) => (
                <div key={set.id} className="flex gap-8 text-muted-foreground pl-2">
                  <span>{set.reps}</span>
                  <span>{set.weight !== undefined && set.weight !== null ? `${set.weight}kg` : '-'}</span>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(exercise)}
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </li>
      <ConfirmModal
        open={showConfirm}
        title="Delete Exercise"
        description={`Are you sure you want to delete '${exercise.name}'? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        extraButtons={
          <button
            className="px-4 py-2 rounded bg-muted text-muted-foreground hover:bg-accent transition mr-2"
            type="button"
            onClick={handleArchive}
          >
            Archive
          </button>
        }
      />
    </>
  );
} 