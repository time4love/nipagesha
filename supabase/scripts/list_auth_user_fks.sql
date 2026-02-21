-- Run this in Supabase SQL Editor to see all tables that reference auth.users(id)
-- and how ON DELETE is configured. Any RESTRICT/NO ACTION can cause "database error deleting user".
SELECT
  c.conrelid::regclass AS referencing_table,
  a.attname AS referencing_column,
  CASE c.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS on_delete
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
ORDER BY referencing_table::text, referencing_column;
