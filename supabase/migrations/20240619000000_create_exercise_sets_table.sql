-- Migration: Create exercise_sets table for multiple sets/weights per exercise
CREATE TABLE exercise_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INT NOT NULL,
  reps VARCHAR(20) NOT NULL,
  weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX exercise_sets_exercise_id_idx ON exercise_sets(exercise_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_exercise_sets_updated_at
    BEFORE UPDATE ON exercise_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies (copying from exercises)
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercise sets"
  ON exercise_sets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exercises
    JOIN workout_days ON exercises.workout_day_id = workout_days.id
    WHERE exercises.id = exercise_sets.exercise_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert exercise sets for their exercises"
  ON exercise_sets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM exercises
    JOIN workout_days ON exercises.workout_day_id = workout_days.id
    WHERE exercises.id = exercise_sets.exercise_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can update exercise sets for their exercises"
  ON exercise_sets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM exercises
    JOIN workout_days ON exercises.workout_day_id = workout_days.id
    WHERE exercises.id = exercise_sets.exercise_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete exercise sets for their exercises"
  ON exercise_sets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM exercises
    JOIN workout_days ON exercises.workout_day_id = workout_days.id
    WHERE exercises.id = exercise_sets.exercise_id
    AND workout_days.user_id = auth.uid()
  )); 