-- Add completion date tracking to tasks and user stories
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create function to automatically set completion date
CREATE OR REPLACE FUNCTION set_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    -- For tasks
    IF TG_TABLE_NAME = 'tasks' THEN
        IF NEW.status = 'done' AND OLD.status != 'done' THEN
            NEW.completed_at = NOW();
        ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
            NEW.completed_at = NULL;
        END IF;
    END IF;
    
    -- For user stories
    IF TG_TABLE_NAME = 'user_stories' THEN
        IF NEW.status = 'done' AND OLD.status != 'done' THEN
            NEW.completed_at = NOW();
        ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
            NEW.completed_at = NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for completion date tracking
DROP TRIGGER IF EXISTS task_completion_trigger ON tasks;
CREATE TRIGGER task_completion_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_completion_date();

DROP TRIGGER IF EXISTS user_story_completion_trigger ON user_stories;
CREATE TRIGGER user_story_completion_trigger
    BEFORE UPDATE ON user_stories
    FOR EACH ROW
    EXECUTE FUNCTION set_completion_date();

-- Create indexes for completion dates
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_completed_at ON user_stories(completed_at);
