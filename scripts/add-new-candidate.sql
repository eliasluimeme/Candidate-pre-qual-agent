-- Insert a new application for a fresh candidate and return the ID
DO $$
DECLARE
    new_app_id UUID;
    step_names TEXT[] := ARRAY['Email Received', 'Attachment Downloaded', 'Resume Parsing', 'Resume Scoring', 'CRM Update', 'Candidate Contacted', 'Candidate Pre-Qualified', 'Consultant Notified', 'Consultant Replied', 'Meeting Scheduled', 'Meeting Transcribed', 'GTM Sent'];
    step_name TEXT;
    step_order INTEGER;
BEGIN
    -- Insert new application
    INSERT INTO applications (candidate_name, candidate_email, position, current_step)
    VALUES ('John Doe', 'john.doe@email.com', 'Software Engineer', 0)
    RETURNING id INTO new_app_id;
    
    -- Insert application steps
    FOR step_order IN 1..12 LOOP
        step_name := step_names[step_order];
        
        INSERT INTO application_steps (application_id, step_name, step_order, status)
        VALUES (new_app_id, step_name, step_order, 'pending');
    END LOOP;
    
    RAISE NOTICE 'New application created with ID: %', new_app_id;
END $$; 