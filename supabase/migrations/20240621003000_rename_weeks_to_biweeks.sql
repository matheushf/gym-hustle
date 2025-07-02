-- Rename weeks table to biweeks
ALTER TABLE weeks RENAME TO biweeks;

-- If you have any foreign keys or references to 'weeks', update them accordingly.
-- For example, if you later add a biweek_id to other tables, reference biweeks(id). 