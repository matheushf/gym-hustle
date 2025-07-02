// Shared types for workout editing

export interface EditingExerciseSet {
  id?: string;
  reps: string;
  weight: string;
}

export interface EditingExercise {
  id: string;
  name: string;
  sets: EditingExerciseSet[];
}

export interface NewExerciseSet {
  reps: string;
  weight: string;
}

export interface NewExercise {
  name: string;
  sets: NewExerciseSet[];
} 