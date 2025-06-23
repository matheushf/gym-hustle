-- Add 'archived' column to exercises table
ALTER TABLE exercises ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE; 