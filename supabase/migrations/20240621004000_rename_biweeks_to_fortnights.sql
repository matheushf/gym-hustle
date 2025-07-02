-- Rename biweeks table to fortnights (or weeks to fortnights if biweeks does not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'biweeks') THEN
    ALTER TABLE biweeks RENAME TO fortnights;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weeks') THEN
    ALTER TABLE weeks RENAME TO fortnights;
  END IF;
END $$;

-- Update RLS policies if needed
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Select own weeks" ON fortnights;
DROP POLICY IF EXISTS "Insert own weeks" ON fortnights;
DROP POLICY IF EXISTS "Update own weeks" ON fortnights;

-- Enable RLS on fortnights table
ALTER TABLE fortnights ENABLE ROW LEVEL SECURITY;

-- Policy: Allow select for fortnights where user owns the cycle
CREATE POLICY "Select own fortnights" ON fortnights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = fortnights.cycle_id AND c.user_id = auth.uid()
    )
  );

-- Policy: Allow insert for fortnights where user owns the cycle
CREATE POLICY "Insert own fortnights" ON fortnights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = fortnights.cycle_id AND c.user_id = auth.uid()
    )
  );

-- Policy: Allow update for fortnights where user owns the cycle
CREATE POLICY "Update own fortnights" ON fortnights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cycles c WHERE c.id = fortnights.cycle_id AND c.user_id = auth.uid()
    )
  ); 