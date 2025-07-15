-- Insert sample applications
INSERT INTO applications (candidate_name, candidate_email, position, applied_at, current_step) VALUES
('Sarah Johnson', 'sarah.johnson@email.com', 'Senior Frontend Developer', '2024-01-15 10:30:00+00', 3),
('Michael Chen', 'michael.chen@email.com', 'Full Stack Engineer', '2024-01-14 14:20:00+00', 5),
('Emily Rodriguez', 'emily.rodriguez@email.com', 'UX Designer', '2024-01-13 09:15:00+00', 1),
('David Kim', 'david.kim@email.com', 'Backend Developer', '2024-01-12 16:45:00+00', 6),
('Lisa Thompson', 'lisa.thompson@email.com', 'Product Manager', '2024-01-11 11:30:00+00', 2),
('James Wilson', 'james.wilson@email.com', 'DevOps Engineer', '2024-01-10 13:20:00+00', 0);

-- Insert application steps for each application
DO $$
DECLARE
    app_record RECORD;
    step_names TEXT[] := ARRAY['Email Received', 'Attachment Downloaded', 'Resume Parsing', 'Resume Scoring', 'CRM Update', 'Candidate Contacted'];
    step_name TEXT;
    step_order INTEGER;
BEGIN
    FOR app_record IN SELECT id, current_step FROM applications LOOP
        FOR step_order IN 1..6 LOOP
            step_name := step_names[step_order];
            
            INSERT INTO application_steps (application_id, step_name, step_order, status, completed_at)
            VALUES (
                app_record.id,
                step_name,
                step_order,
                CASE 
                    WHEN step_order < app_record.current_step THEN 'completed'
                    WHEN step_order = app_record.current_step THEN 'in-progress'
                    ELSE 'pending'
                END,
                CASE 
                    WHEN step_order < app_record.current_step THEN NOW() - INTERVAL '1 day' * (app_record.current_step - step_order)
                    ELSE NULL
                END
            );
        END LOOP;
    END LOOP;
END $$;
