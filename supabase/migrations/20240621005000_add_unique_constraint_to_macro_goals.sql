-- Add unique constraint for upsert logic
ALTER TABLE macro_goals
ADD CONSTRAINT macro_goals_cycle_week_meal_unique UNIQUE (cycle_id, week, meal);

-- Drop the old unique constraint if it exists
ALTER TABLE macro_goals
DROP CONSTRAINT IF EXISTS macro_goals_user_id_meal_key; 