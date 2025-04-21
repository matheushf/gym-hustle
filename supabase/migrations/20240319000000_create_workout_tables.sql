-- Create workout_days table
CREATE TABLE workout_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets VARCHAR(50) NOT NULL,
  weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX workout_days_user_id_idx ON workout_days(user_id);
CREATE INDEX exercises_workout_day_id_idx ON exercises(workout_day_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_days_updated_at
    BEFORE UPDATE ON workout_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout days"
  ON workout_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout days"
  ON workout_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout days"
  ON workout_days FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout days"
  ON workout_days FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view exercises for their workout days"
  ON exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_days
    WHERE workout_days.id = exercises.workout_day_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert exercises for their workout days"
  ON exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_days
    WHERE workout_days.id = exercises.workout_day_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can update exercises for their workout days"
  ON exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_days
    WHERE workout_days.id = exercises.workout_day_id
    AND workout_days.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete exercises for their workout days"
  ON exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_days
    WHERE workout_days.id = exercises.workout_day_id
    AND workout_days.user_id = auth.uid()
  )); 