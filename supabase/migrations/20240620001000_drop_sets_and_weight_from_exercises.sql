-- Migration: Drop sets and weight columns from exercises table
ALTER TABLE exercises DROP COLUMN sets;
ALTER TABLE exercises DROP COLUMN weight; 