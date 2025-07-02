-- Migration: Copy sets/weight from exercises to exercise_sets
INSERT INTO exercise_sets (exercise_id, set_number, reps, weight, created_at, updated_at)
SELECT id, 1, sets, weight, created_at, updated_at
FROM exercises
WHERE (sets IS NOT NULL AND TRIM(sets) <> '') OR weight IS NOT NULL; 