import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { DumbbellIcon, Edit, GripVertical, Loader2, Trash2 } from "lucide-react";
import type { Exercise } from "@/app/actions/workout";

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ExerciseItem({ exercise, onEdit, onDelete, isDeleting }: ExerciseItemProps) {
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

  return (
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
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-primary">
          <DumbbellIcon className="h-4 w-4" />
        </span>
        <span className="flex-1 font-medium">{exercise.name}</span>
      </div>
      
      <div className="flex items-center pl-12">
        <div className="flex-1 flex items-center gap-4">
          <span className="text-muted-foreground">{exercise.sets}</span>
          <span className="text-muted-foreground">
            {exercise.weight ? `${exercise.weight}kg` : "-"}
          </span>
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
            onClick={() => onDelete(exercise.id)}
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
  );
} 