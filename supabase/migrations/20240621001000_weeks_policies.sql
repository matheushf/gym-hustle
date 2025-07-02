-- Enable RLS on weeks table
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow select for weeks where user owns the cycle
CREATE POLICY "Select own weeks" ON weeks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = weeks.cycle_id AND c.user_id = auth.uid()
    )
  );

-- Policy: Allow insert for weeks where user owns the cycle
CREATE POLICY "Insert own weeks" ON weeks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = weeks.cycle_id AND c.user_id = auth.uid()
    )
  );

-- Policy: Allow update for weeks where user owns the cycle
CREATE POLICY "Update own weeks" ON weeks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = weeks.cycle_id AND c.user_id = auth.uid()
    )
  ); 