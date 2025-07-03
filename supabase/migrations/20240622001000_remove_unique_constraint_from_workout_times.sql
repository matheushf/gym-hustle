-- Migration: Remove unique constraint from workout_times to allow multiple timers per day
ALTER TABLE workout_times DROP CONSTRAINT IF EXISTS unique_user_workout_day_date; 