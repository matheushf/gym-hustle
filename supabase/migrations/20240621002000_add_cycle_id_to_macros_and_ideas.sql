-- Add cycle_id to macro_goals and food_ideas
ALTER TABLE macro_goals ADD COLUMN cycle_id uuid REFERENCES cycles(id) ON DELETE CASCADE;
ALTER TABLE food_ideas ADD COLUMN cycle_id uuid REFERENCES cycles(id) ON DELETE CASCADE; 