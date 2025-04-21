-- Add order column to exercises table
ALTER TABLE exercises ADD COLUMN "order" INTEGER DEFAULT 0;

-- Update existing exercises to have sequential order
WITH ordered_exercises AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY workout_day_id ORDER BY created_at) - 1 as row_num
  FROM exercises
)
UPDATE exercises
SET "order" = ordered_exercises.row_num
FROM ordered_exercises
WHERE exercises.id = ordered_exercises.id; 