-- Create a function to update current_step based on completed steps
CREATE OR REPLACE FUNCTION update_application_current_step()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate the highest completed step for this application
    UPDATE applications 
    SET current_step = (
        SELECT COALESCE(MAX(step_order), 0)
        FROM application_steps 
        WHERE application_id = COALESCE(NEW.application_id, OLD.application_id)
        AND status = 'completed'
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.application_id, OLD.application_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update current_step when application_steps change
DROP TRIGGER IF EXISTS trigger_update_current_step ON application_steps;
CREATE TRIGGER trigger_update_current_step
    AFTER INSERT OR UPDATE OR DELETE ON application_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_application_current_step();

-- Update existing data to ensure consistency
DO $$
DECLARE
    app_record RECORD;
BEGIN
    FOR app_record IN SELECT id FROM applications LOOP
        UPDATE applications 
        SET current_step = (
            SELECT COALESCE(MAX(step_order), 0)
            FROM application_steps 
            WHERE application_id = app_record.id
            AND status = 'completed'
        ),
        updated_at = NOW()
        WHERE id = app_record.id;
    END LOOP;
END $$; 