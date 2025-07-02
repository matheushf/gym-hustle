-- Add week column to macro_goals and food_ideas
ALTER TABLE macro_goals ADD COLUMN week integer NOT NULL DEFAULT 1;
ALTER TABLE food_ideas ADD COLUMN week integer NOT NULL DEFAULT 1;

-- Create a weeks table to track week start dates per cycle
CREATE TABLE weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES cycles(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  start_date date NOT NULL,
  UNIQUE (cycle_id, week_number)
);

-- Note: Backend logic should enforce that a new week can only be created if at least 6 days have passed since the last week's start_date. 