-- Add selected_workout_id to auth.users to track the user's selected workout
ALTER TABLE auth.users ADD COLUMN selected_workout_id UUID REFERENCES workouts(id);

-- (Optional) You may want to add an index for performance
CREATE INDEX IF NOT EXISTS users_selected_workout_id_idx ON auth.users(selected_workout_id); 