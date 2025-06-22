-- Create macro_goals table for per-user, per-meal macro goals
CREATE TABLE macro_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal TEXT NOT NULL CHECK (meal IN ('morning', 'lunch', 'afternoon', 'dinner')),
  carbos INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (user_id, meal)
);

-- Trigger to update updated_at
CREATE TRIGGER update_macro_goals_updated_at
  BEFORE UPDATE ON macro_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE macro_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own macro goals"
  ON macro_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own macro goals"
  ON macro_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own macro goals"
  ON macro_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own macro goals"
  ON macro_goals FOR DELETE
  USING (auth.uid() = user_id); 