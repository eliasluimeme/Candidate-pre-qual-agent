-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  position TEXT NOT NULL,
  resume TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_steps table
CREATE TABLE IF NOT EXISTS application_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_steps_application_id ON application_steps(application_id);
CREATE INDEX IF NOT EXISTS idx_application_steps_status ON application_steps(status);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_steps ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON application_steps FOR SELECT USING (true);
