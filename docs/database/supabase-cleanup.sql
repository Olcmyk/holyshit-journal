-- Clean up existing tables first
DROP TABLE IF EXISTS submission_order_cache CASCADE;
DROP TABLE IF EXISTS ip_blocks CASCADE;
DROP TABLE IF EXISTS selected_papers CASCADE;
DROP TABLE IF EXISTS vote_cooldowns CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;

-- Drop the trigger function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
