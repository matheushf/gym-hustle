-- Migration: Create workout_times table for per-user, per-workout, per-day timing
CREATE TABLE workout_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  day_name VARCHAR(20) NOT NULL, -- e.g., 'Monday'
  date DATE NOT NULL, -- the day the workout was performed
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- calculated on stop
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_user_workout_day_date UNIQUE (user_id, workout_id, day_name, date)
);

CREATE INDEX workout_times_user_id_idx ON workout_times(user_id);
CREATE INDEX workout_times_workout_id_idx ON workout_times(workout_id);
CREATE INDEX workout_times_user_workout_day_date_idx ON workout_times(user_id, workout_id, day_name, date);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_workout_times_updated_at
    BEFORE UPDATE ON workout_times
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE workout_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own workout times"
  ON workout_times FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout times"
  ON workout_times FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout times"
  ON workout_times FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout times"
  ON workout_times FOR DELETE
  USING (auth.uid() = user_id); 