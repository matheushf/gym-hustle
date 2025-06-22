-- Create the food_ideas table
CREATE TABLE public.food_ideas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    meal text NOT NULL,
    text text NOT NULL CHECK (char_length(text) > 0),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT food_ideas_pkey PRIMARY KEY (id),
    CONSTRAINT food_ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.food_ideas IS 'Stores food ideas for different meals for each user.';
COMMENT ON COLUMN public.food_ideas.id IS 'Unique identifier for each food idea.';
COMMENT ON COLUMN public.food_ideas.user_id IS 'Foreign key to the user who created the idea.';
COMMENT ON COLUMN public.food_ideas.meal IS 'The meal category for the food idea (e.g., morning, lunch).';
COMMENT ON COLUMN public.food_ideas.text IS 'The content of the food idea.';
COMMENT ON COLUMN public.food_ideas.created_at IS 'Timestamp of when the food idea was created.';


-- Enable Row-Level Security (RLS) for the food_ideas table
ALTER TABLE public.food_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- 1. Allow users to select their own food ideas
CREATE POLICY "Allow users to select their own food ideas"
ON public.food_ideas
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow users to insert food ideas for themselves
CREATE POLICY "Allow users to insert their own food ideas"
ON public.food_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to delete their own food ideas
CREATE POLICY "Allow users to delete their own food ideas"
ON public.food_ideas
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Allow users to update their own food ideas
CREATE POLICY "Allow users to update their own food ideas"
ON public.food_ideas
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 