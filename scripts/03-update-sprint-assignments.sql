-- Add sprint assignment tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id UUID;
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS sprint_id UUID;

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_sprint_id_fkey'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_sprint_id_fkey 
        FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_stories_sprint_id_fkey'
    ) THEN
        ALTER TABLE user_stories ADD CONSTRAINT user_stories_sprint_id_fkey 
        FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add current sprint tracking
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Create indexes for sprint assignments if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_sprint_id') THEN
        CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_stories_sprint_id') THEN
        CREATE INDEX idx_user_stories_sprint_id ON user_stories(sprint_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sprints_is_current') THEN
        CREATE INDEX idx_sprints_is_current ON sprints(is_current);
    END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION ensure_single_current_sprint()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        UPDATE sprints SET is_current = FALSE WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS ensure_single_current_sprint_trigger ON sprints;
CREATE TRIGGER ensure_single_current_sprint_trigger
    BEFORE UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_sprint();

-- Set the first sprint as current if none exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sprints WHERE is_current = TRUE) THEN
        UPDATE sprints SET is_current = TRUE WHERE id = (
            SELECT id FROM sprints ORDER BY created_at LIMIT 1
        );
    END IF;
END $$;
