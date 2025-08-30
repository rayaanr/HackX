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

-- Create prize_cohorts table
CREATE TABLE IF NOT EXISTS prize_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number_of_winners INTEGER NOT NULL DEFAULT 1,
    prize_amount TEXT NOT NULL,
    description TEXT NOT NULL,
    judging_mode judging_mode NOT NULL DEFAULT 'manual',
    voting_mode voting_mode NOT NULL DEFAULT 'public',
    max_votes_per_judge INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prize_cohort_id UUID NOT NULL REFERENCES prize_cohorts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
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

-- Create speakers table
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT,
    x_name TEXT,
    x_handle TEXT,
    picture TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedule_slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    has_speaker BOOLEAN DEFAULT FALSE,
    speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    );

-- Judges policies
CREATE POLICY "Users can manage judges for their hackathons" ON judges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = judges.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Speakers policies (global access for now, can be restricted later)
CREATE POLICY "Users can manage speakers" ON speakers FOR ALL USING (true);

-- Schedule slots policies
CREATE POLICY "Users can manage schedule slots for their hackathons" ON schedule_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = schedule_slots.hackathon_id 
            AND hackathons.created_by = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON hackathons(created_by);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_at ON hackathons(created_at);
CREATE INDEX IF NOT EXISTS idx_prize_cohorts_hackathon_id ON prize_cohorts(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_prize_cohort_id ON evaluation_criteria(prize_cohort_id);
CREATE INDEX IF NOT EXISTS idx_judges_hackathon_id ON judges(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_hackathon_id ON schedule_slots(hackathon_id);

-- Success message
SELECT 'Database schema created successfully! 🎉' as result;
