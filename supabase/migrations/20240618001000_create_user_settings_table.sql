-- Create user_profile table to store per-user app-specific settings
CREATE TABLE user_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_workout_id UUID REFERENCES workouts(id),
  name TEXT,
  email TEXT,
  avatar TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_updated_at();

-- Enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON user_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON user_profile FOR DELETE USING (auth.uid() = user_id); 