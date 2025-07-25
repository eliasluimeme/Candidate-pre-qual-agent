-- Update an existing application: mark step 2 as completed and step 3 as in-progress
-- Steps: 1-Email Received, 2-Attachment Downloaded, 3-Resume Parsing, 4-Resume Scoring, 
--        5-CRM Update, 6-Candidate Contacted, 7-Candidate Pre-Qualified, 8-Consultant Notified,
--        9-Consultant Replied, 10-Meeting Scheduled, 11-Meeting Transcribed, 12-GTM Sent

DO $$
DECLARE
    target_app_id UUID := 'APPLICATION_ID_HERE';
    target_step INTEGER := 2; 
BEGIN
    -- Update the application's current step (completed step + 1 for next in-progress step)
    UPDATE applications 
    SET current_step = target_step, 
        updated_at = NOW()
    WHERE id = target_app_id;
    
    -- Mark target step as completed
    UPDATE application_steps 
    SET status = 'completed', 
        completed_at = NOW(),
        updated_at = NOW()
    WHERE application_id = target_app_id 
      AND step_order = target_step;
    
    -- Mark next step as in-progress (if not the final step)
    IF target_step < 12 THEN
        UPDATE application_steps 
        SET status = 'in-progress',
            updated_at = NOW()
        WHERE application_id = target_app_id 
          AND step_order = target_step + 1;
    END IF;
    
    -- Verify the updates
    RAISE NOTICE 'Application % updated: Step % completed, Step % in progress', target_app_id, target_step, CASE WHEN target_step < 12 THEN target_step + 1 ELSE target_step END;
END $$; 