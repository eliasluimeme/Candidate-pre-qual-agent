-- Update an existing application: mark step 2 as completed and step 3 as in-progress
-- Replace 'APPLICATION_ID_HERE' with the actual application ID

DO $$
DECLARE
    target_app_id UUID := 'APPLICATION_ID_HERE'; -- Replace with actual application ID
BEGIN
    -- Update the application's current step to 2 (step 2 completed, step 3 in progress)
    UPDATE applications 
    SET current_step = 2, 
        updated_at = NOW()
    WHERE id = target_app_id;
    
    -- Mark step 2 as completed
    UPDATE application_steps 
    SET status = 'completed', 
        completed_at = NOW(),
        updated_at = NOW()
    WHERE application_id = target_app_id 
      AND step_order = 2;
    
    -- Mark step 3 as in-progress
    UPDATE application_steps 
    SET status = 'in-progress',
        updated_at = NOW()
    WHERE application_id = target_app_id 
      AND step_order = 3;
    
    -- Verify the updates
    RAISE NOTICE 'Application % updated: Step 2 completed, Step 3 in progress', target_app_id;
END $$; 