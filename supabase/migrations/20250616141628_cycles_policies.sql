-- Enable Row Level Security for cycles table
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cycles
CREATE POLICY "Users can view their own cycles"
  ON cycles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own cycles
CREATE POLICY "Users can insert their own cycles"
  ON cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cycles
CREATE POLICY "Users can update their own cycles"
  ON cycles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own cycles
CREATE POLICY "Users can delete their own cycles"
  ON cycles FOR DELETE
  USING (auth.uid() = user_id); 