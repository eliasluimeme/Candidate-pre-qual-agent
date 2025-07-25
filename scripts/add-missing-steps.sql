-- Add missing steps to existing applications
-- This script adds the 4 new steps to applications that only have the original 8 steps

DO $$
DECLARE
    app_record RECORD;
    missing_steps TEXT[] := ARRAY['Consultant Replied', 'Meeting Scheduled', 'Meeting Transcribed', 'GTM Sent'];
    step_name TEXT;
    step_order INTEGER;
BEGIN
    -- Loop through all applications
    FOR app_record IN SELECT id FROM applications LOOP
        -- Check if application has less than 12 steps
        IF (SELECT COUNT(*) FROM application_steps WHERE application_id = app_record.id) < 12 THEN
            -- Add the missing 4 steps (steps 9-12)
            FOR step_order IN 9..12 LOOP
                step_name := missing_steps[step_order - 8]; -- Array index starts at 1
                
                -- Only insert if the step doesn't already exist
                INSERT INTO application_steps (application_id, step_name, step_order, status)
                SELECT app_record.id, step_name, step_order, 'pending'
                WHERE NOT EXISTS (
                    SELECT 1 FROM application_steps 
                    WHERE application_id = app_record.id AND step_order = step_order
                );
            END LOOP;
            
            RAISE NOTICE 'Added missing steps to application: %', app_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Finished adding missing steps to existing applications';
END $$; 