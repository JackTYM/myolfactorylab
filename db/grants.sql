-- Run this after any migration that adds new tables to the `public` schema.
-- The Neon Data API requires the `authenticated` role to have explicit table
-- grants IN ADDITION TO RLS policies (RLS alone blocks all access via GRANT
-- absence, even with correct policies). ALTER DEFAULT PRIVILEGES only covers
-- tables created AFTER it runs, so newly-migrated tables always need this
-- re-applied.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
