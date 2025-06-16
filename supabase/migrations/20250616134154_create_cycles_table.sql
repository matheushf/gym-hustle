-- Migration to create the cycles table for bulking and cutting logs
CREATE TABLE cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bulking', 'cutting')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_cycles_user_id ON cycles(user_id); 