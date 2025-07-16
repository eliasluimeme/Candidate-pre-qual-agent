-- Insert a new application for a fresh candidate and return the ID
DO $$
DECLARE
    new_app_id UUID;
    step_names TEXT[] := ARRAY['Email Received', 'Attachment Downloaded', 'Resume Parsed', 'Resume Scored', 'CRM Updated', 'Candidate Contacted', 'Candidate Pre-Qualified', 'Consultant Notified'];
    step_name TEXT;
    step_order INTEGER;
BEGIN
    -- Insert new application with first step completed
    INSERT INTO applications (candidate_name, candidate_email, position, applied_at, current_step) 
    VALUES ('John Doe', 'john.doe@email.com', 'Software Engineer', NOW(), 1)
    RETURNING id INTO new_app_id;
    
    -- Create all 8 steps for the new application
    FOR step_order IN 1..8 LOOP
        step_name := step_names[step_order];
        
        INSERT INTO application_steps (application_id, step_name, step_order, status, completed_at)
        VALUES (
            new_app_id,
            step_name,
            step_order,
            CASE 
                WHEN step_order = 1 THEN 'completed'  -- First step is completed
                WHEN step_order = 2 THEN 'in-progress'  -- Second step is in progress
                ELSE 'pending'  -- All other steps are pending
            END,
            CASE 
                WHEN step_order = 1 THEN NOW()  -- First step completed now
                ELSE NULL  -- No completion date for other steps
            END
        );
    END LOOP;
    
    -- Return the new application ID
    RAISE NOTICE 'New application created with ID: %', new_app_id;
END $$; 