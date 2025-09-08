-- HackX Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create experience_level enum
DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create judging_mode enum
DO $$ BEGIN
    CREATE TYPE judging_mode AS ENUM ('manual', 'automated', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create voting_mode enum
DO $$ BEGIN
    CREATE TYPE voting_mode AS ENUM ('public', 'private', 'judges_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create judge_status enum
DO $$ BEGIN
    CREATE TYPE judge_status AS ENUM ('waiting', 'invited', 'pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    visual TEXT,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    location TEXT NOT NULL,
    tech_stack TEXT[] DEFAULT '{}',
    experience_level experience_level NOT NULL DEFAULT 'all',
    registration_start_date TIMESTAMPTZ,
    registration_end_date TIMESTAMPTZ,
    hackathon_start_date TIMESTAMPTZ,
    hackathon_end_date TIMESTAMPTZ,
    voting_start_date TIMESTAMPTZ,
    voting_end_date TIMESTAMPTZ,
    social_links JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for hackathons updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'hackathons_updated_at_trigger'
    ) THEN
        CREATE TRIGGER hackathons_updated_at_trigger
            BEFORE UPDATE ON hackathons
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Add CHECK constraints for hackathons date validation
DO $$
BEGIN
    -- Check if constraints already exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'hackathons' AND constraint_name = 'hackathon_date_order'
    ) THEN
        ALTER TABLE hackathons ADD CONSTRAINT hackathon_date_order 
            CHECK (hackathon_start_date IS NULL OR hackathon_end_date IS NULL OR hackathon_start_date <= hackathon_end_date);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'hackathons' AND constraint_name = 'registration_date_order'
    ) THEN
        ALTER TABLE hackathons ADD CONSTRAINT registration_date_order 
            CHECK (
                (registration_start_date IS NULL AND registration_end_date IS NULL) OR
                (registration_start_date IS NOT NULL AND registration_end_date IS NOT NULL AND 
                 registration_start_date <= registration_end_date AND 
                 (hackathon_start_date IS NULL OR registration_end_date <= hackathon_start_date))
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'hackathons' AND constraint_name = 'voting_date_order'
    ) THEN
        ALTER TABLE hackathons ADD CONSTRAINT voting_date_order 
            CHECK (
                (voting_start_date IS NULL AND voting_end_date IS NULL) OR
                (voting_start_date IS NOT NULL AND voting_end_date IS NOT NULL AND 
                 voting_start_date <= voting_end_date AND 
                 (hackathon_start_date IS NULL OR voting_start_date >= hackathon_start_date) AND
                 (hackathon_end_date IS NULL OR voting_end_date <= hackathon_end_date))
            );
    END IF;
END $$;

-- Create prize_cohorts table
CREATE TABLE IF NOT EXISTS prize_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number_of_winners INTEGER NOT NULL DEFAULT 1 CHECK (number_of_winners > 0),
    prize_amount TEXT NOT NULL,
    description TEXT NOT NULL,
    judging_mode judging_mode NOT NULL DEFAULT 'manual',
    voting_mode voting_mode NOT NULL DEFAULT 'public',
    max_votes_per_judge INTEGER NOT NULL DEFAULT 1 CHECK (max_votes_per_judge > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for prize_cohorts updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'prize_cohorts_updated_at_trigger'
    ) THEN
        CREATE TRIGGER prize_cohorts_updated_at_trigger
            BEFORE UPDATE ON prize_cohorts
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prize_cohort_id UUID NOT NULL REFERENCES prize_cohorts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create judges table
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status judge_status DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hackathon_id, email)
);

-- Create trigger for judges updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'judges_updated_at_trigger'
    ) THEN
        CREATE TRIGGER judges_updated_at_trigger
            BEFORE UPDATE ON judges
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Create speakers table
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT,
    x_name TEXT,
    x_handle TEXT,
    picture TEXT,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing speakers table if needed
DO $$
BEGIN
    -- Check if created_by column exists and has wrong reference
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'speakers' AND column_name = 'created_by'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.referential_constraints rc
        JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
        WHERE kcu.table_name = 'speakers' AND kcu.column_name = 'created_by' 
        AND rc.unique_constraint_name LIKE '%users%' AND rc.unique_constraint_name NOT LIKE '%auth_users%'
    ) THEN
        -- Drop the old constraint first
        EXECUTE (
            SELECT 'ALTER TABLE speakers DROP CONSTRAINT ' || constraint_name
            FROM information_schema.referential_constraints rc
            JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
            WHERE kcu.table_name = 'speakers' AND kcu.column_name = 'created_by'
            AND rc.unique_constraint_name LIKE '%users%' AND rc.unique_constraint_name NOT LIKE '%auth_users%'
            LIMIT 1
        );
        
        -- Add the column as nullable with correct reference
        ALTER TABLE speakers ALTER COLUMN created_by DROP DEFAULT;
        ALTER TABLE speakers ALTER COLUMN created_by DROP NOT NULL;
        ALTER TABLE speakers ADD CONSTRAINT speakers_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'speakers' AND column_name = 'created_by'
    ) THEN
        -- Add the column as nullable first
        ALTER TABLE speakers ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure hackathon_id exists first before backfill
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'speakers' AND column_name = 'hackathon_id'
    ) THEN
        ALTER TABLE speakers ADD COLUMN hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE;
    END IF;
    
    -- Backfill created_by from hackathon owner for speakers without created_by
    UPDATE speakers 
    SET created_by = h.created_by 
    FROM hackathons h 
    WHERE speakers.hackathon_id = h.id 
    AND speakers.created_by IS NULL;
    
    -- Note: NOT NULL constraint should be added in a separate migration after validation
END $$;

-- Create schedule_slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL CHECK (end_date_time > start_date_time),
    has_speaker BOOLEAN DEFAULT FALSE,
    speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (NOT has_speaker OR speaker_id IS NOT NULL)
);

-- Create trigger for schedule_slots updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'schedule_slots_updated_at_trigger'
    ) THEN
        CREATE TRIGGER schedule_slots_updated_at_trigger
            BEFORE UPDATE ON schedule_slots
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Create function to validate speaker belongs to same hackathon
CREATE OR REPLACE FUNCTION validate_schedule_slot_speaker()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.speaker_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM speakers 
            WHERE id = NEW.speaker_id 
            AND hackathon_id = NEW.hackathon_id
        ) THEN
            RAISE EXCEPTION 'Speaker must belong to the same hackathon as the schedule slot';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for speaker validation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'schedule_slots_speaker_validation_trigger'
    ) THEN
        CREATE TRIGGER schedule_slots_speaker_validation_trigger
            BEFORE INSERT OR UPDATE ON schedule_slots
            FOR EACH ROW
            EXECUTE FUNCTION validate_schedule_slot_speaker();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own hackathons" ON hackathons;
DROP POLICY IF EXISTS "Users can create their own hackathons" ON hackathons;
DROP POLICY IF EXISTS "Users can update their own hackathons" ON hackathons;
DROP POLICY IF EXISTS "Users can delete their own hackathons" ON hackathons;
DROP POLICY IF EXISTS "Users can manage prize cohorts for their hackathons" ON prize_cohorts;
DROP POLICY IF EXISTS "Users can manage evaluation criteria for their prize cohorts" ON evaluation_criteria;
DROP POLICY IF EXISTS "Users can manage judges for their hackathons" ON judges;
DROP POLICY IF EXISTS "Users can manage speakers" ON speakers;
DROP POLICY IF EXISTS "Users can manage schedule slots for their hackathons" ON schedule_slots;

-- Create RLS Policies
-- Hackathons policies
CREATE POLICY "Users can view their own hackathons" ON hackathons
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own hackathons" ON hackathons
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own hackathons" ON hackathons
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own hackathons" ON hackathons
    FOR DELETE USING (auth.uid() = created_by);

-- Prize cohorts policies
CREATE POLICY "Users can manage prize cohorts for their hackathons" ON prize_cohorts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = prize_cohorts.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = prize_cohorts.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Evaluation criteria policies
CREATE POLICY "Users can manage evaluation criteria for their prize cohorts" ON evaluation_criteria
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM prize_cohorts 
            JOIN hackathons ON hackathons.id = prize_cohorts.hackathon_id
            WHERE prize_cohorts.id = evaluation_criteria.prize_cohort_id 
            AND hackathons.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prize_cohorts 
            JOIN hackathons ON hackathons.id = prize_cohorts.hackathon_id
            WHERE prize_cohorts.id = evaluation_criteria.prize_cohort_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Judges policies
CREATE POLICY "Users can manage judges for their hackathons" ON judges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = judges.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = judges.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Speakers policies - users can only manage speakers they created or for hackathons they own
DROP POLICY IF EXISTS "Users can manage speakers" ON speakers;

CREATE POLICY "Users can view speakers" ON speakers
    FOR SELECT USING (
        created_by = auth.uid() OR
        (hackathon_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = speakers.hackathon_id 
            AND hackathons.created_by = auth.uid()
        ))
    );

CREATE POLICY "Users can insert speakers" ON speakers
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        (hackathon_id IS NULL OR EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = speakers.hackathon_id 
            AND hackathons.created_by = auth.uid()
        ))
    );

CREATE POLICY "Users can update speakers" ON speakers
    FOR UPDATE USING (
        created_by = auth.uid() OR
        (hackathon_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = speakers.hackathon_id 
            AND hackathons.created_by = auth.uid()
        ))
    )
    WITH CHECK (
        created_by = auth.uid() OR
        (hackathon_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = speakers.hackathon_id 
            AND hackathons.created_by = auth.uid()
        ))
    );

CREATE POLICY "Users can delete speakers" ON speakers
    FOR DELETE USING (
        created_by = auth.uid() OR
        (hackathon_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = speakers.hackathon_id 
            AND hackathons.created_by = auth.uid()
        ))
    );

-- Schedule slots policies
CREATE POLICY "Users can manage schedule slots for their hackathons" ON schedule_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = schedule_slots.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = schedule_slots.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'completed')),
    repository_url TEXT,
    demo_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    team_members JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for projects updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'projects_updated_at_trigger'
    ) THEN
        CREATE TRIGGER projects_updated_at_trigger
            BEFORE UPDATE ON projects
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Create hackathon_registrations table
CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
    UNIQUE(user_id, hackathon_id)
);

-- Create project_hackathon_submissions table
CREATE TABLE IF NOT EXISTS project_hackathon_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected')),
    UNIQUE(project_id, hackathon_id)
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    prize_cohort_id UUID NOT NULL REFERENCES prize_cohorts(id) ON DELETE CASCADE,
    judge_email TEXT NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}',
    feedback JSONB NOT NULL DEFAULT '{}',
    overall_feedback TEXT,
    total_score INTEGER NOT NULL DEFAULT 0,
    max_possible_score INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, hackathon_id, prize_cohort_id, judge_email)
);

-- Create PL/pgSQL function to validate evaluation project-hackathon consistency
CREATE OR REPLACE FUNCTION validate_evaluation_project_hackathon()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the project belongs to the specified hackathon
    IF NOT EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = NEW.project_id 
        AND projects.hackathon_id = NEW.hackathon_id
    ) THEN
        RAISE EXCEPTION 'Project ID % does not belong to hackathon ID %. Cannot create evaluation.', 
            NEW.project_id, NEW.hackathon_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce evaluation project-hackathon consistency
DROP TRIGGER IF EXISTS evaluations_project_hackathon_check ON evaluations;
CREATE TRIGGER evaluations_project_hackathon_check
    BEFORE INSERT OR UPDATE ON evaluations
    FOR EACH ROW
    EXECUTE FUNCTION validate_evaluation_project_hackathon();

-- Create trigger for evaluations updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'evaluations_updated_at_trigger'
    ) THEN
        CREATE TRIGGER evaluations_updated_at_trigger
            BEFORE UPDATE ON evaluations
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Enable Row Level Security for new tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_hackathon_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for new tables

-- Projects policies
CREATE POLICY "Users can view own projects or projects in registered hackathons" ON projects FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM hackathon_registrations 
        WHERE hackathon_registrations.hackathon_id = projects.hackathon_id 
        AND hackathon_registrations.user_id = auth.uid()
    )
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = created_by);

-- Hackathon registrations policies
CREATE POLICY "Users can view their own registrations" ON hackathon_registrations 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own registrations" ON hackathon_registrations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrations" ON hackathon_registrations 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own registrations" ON hackathon_registrations 
    FOR DELETE USING (auth.uid() = user_id);

-- Project hackathon submissions policies
CREATE POLICY "Project owners can manage submissions" ON project_hackathon_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_hackathon_submissions.project_id 
            AND projects.created_by = auth.uid()
        )
    );

-- Evaluations policies (allow judges to manage only their own evaluations)
CREATE POLICY "Judges can view their own evaluations" ON evaluations 
    FOR SELECT USING (judge_email = auth.email());

CREATE POLICY "Judges can create their own evaluations" ON evaluations 
    FOR INSERT WITH CHECK (judge_email = auth.email());

CREATE POLICY "Judges can update their own evaluations" ON evaluations 
    FOR UPDATE USING (judge_email = auth.email()) 
    WITH CHECK (judge_email = auth.email());

CREATE POLICY "Judges can delete their own evaluations" ON evaluations 
    FOR DELETE USING (judge_email = auth.email());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON hackathons(created_by);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_at ON hackathons(created_at);
CREATE INDEX IF NOT EXISTS idx_prize_cohorts_hackathon_id ON prize_cohorts(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_prize_cohort_id ON evaluation_criteria(prize_cohort_id);
CREATE INDEX IF NOT EXISTS idx_judges_hackathon_id ON judges(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_hackathon_id ON schedule_slots(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_hackathon_id ON projects(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_user_id ON hackathon_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_hackathon_id ON hackathon_registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_project_hackathon_submissions_project_id ON project_hackathon_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_hackathon_submissions_hackathon_id ON project_hackathon_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_project_hackathon ON evaluations(project_id, hackathon_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_judge_email ON evaluations(judge_email);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted_at ON evaluations(submitted_at DESC);

-- Success message
SELECT 'Database schema created successfully! 🎉' as result;
