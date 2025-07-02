-- 1. Create workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Add workout_id to workout_days (nullable for now)
ALTER TABLE workout_days ADD COLUMN workout_id UUID;

-- 3. For each user, create a workout and assign all their days to it
WITH users_with_days AS (
  SELECT DISTINCT user_id FROM workout_days
),
inserted_workouts AS (
  INSERT INTO workouts (user_id, name)
  SELECT user_id, 'My Workout' FROM users_with_days
  RETURNING id, user_id
)
UPDATE workout_days wd
SET workout_id = iw.id
FROM inserted_workouts iw
WHERE wd.user_id = iw.user_id;

-- 4. Set workout_id as NOT NULL and add FK constraint
ALTER TABLE workout_days ALTER COLUMN workout_id SET NOT NULL;
ALTER TABLE workout_days ADD CONSTRAINT workout_days_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE;

-- 5. Index for performance
CREATE INDEX workout_days_workout_id_idx ON workout_days(workout_id);

-- 6. RLS: Enable and add policies for workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- 7. Update workout_days RLS to require workout ownership
DROP POLICY IF EXISTS "Users can view their own workout days" ON workout_days;
CREATE POLICY "Users can view their own workout days" ON workout_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_days.workout_id AND workouts.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert their own workout days" ON workout_days;
CREATE POLICY "Users can insert their own workout days" ON workout_days FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_days.workout_id AND workouts.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can update their own workout days" ON workout_days;
CREATE POLICY "Users can update their own workout days" ON workout_days FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_days.workout_id AND workouts.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can delete their own workout days" ON workout_days;
CREATE POLICY "Users can delete their own workout days" ON workout_days FOR DELETE USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_days.workout_id AND workouts.user_id = auth.uid())
); 