export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      hackathons: {
        Row: {
          id: string;
          name: string;
          visual: string | null;
          short_description: string;
          full_description: string;
          location: string;
          tech_stack: string[];
          experience_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
          registration_start_date: string | null;
          registration_end_date: string | null;
          hackathon_start_date: string | null;
          hackathon_end_date: string | null;
          voting_start_date: string | null;
          voting_end_date: string | null;
          social_links: Json;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          visual?: string | null;
          short_description: string;
          full_description: string;
          location: string;
          tech_stack?: string[];
          experience_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
          registration_start_date?: string | null;
          registration_end_date?: string | null;
          hackathon_start_date?: string | null;
          hackathon_end_date?: string | null;
          voting_start_date?: string | null;
          voting_end_date?: string | null;
          social_links?: Json;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          visual?: string | null;
          short_description?: string;
          full_description?: string;
          location?: string;
          tech_stack?: string[];
          experience_level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
          registration_start_date?: string | null;
          registration_end_date?: string | null;
          hackathon_start_date?: string | null;
          hackathon_end_date?: string | null;
          voting_start_date?: string | null;
          voting_end_date?: string | null;
          social_links?: Json;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hackathons_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      prize_cohorts: {
        Row: {
          id: string;
          hackathon_id: string;
          name: string;
          number_of_winners: number;
          prize_amount: string;
          description: string;
          judging_mode: "MANUAL" | "AUTOMATED" | "HYBRID";
          voting_mode: "PUBLIC" | "PRIVATE" | "JUDGES_ONLY";
          max_votes_per_judge: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          hackathon_id: string;
          name: string;
          number_of_winners: number;
          prize_amount: string;
          description: string;
          judging_mode: "MANUAL" | "AUTOMATED" | "HYBRID";
          voting_mode: "PUBLIC" | "PRIVATE" | "JUDGES_ONLY";
          max_votes_per_judge: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          hackathon_id?: string;
          name?: string;
          number_of_winners?: number;
          prize_amount?: string;
          description?: string;
          judging_mode?: "MANUAL" | "AUTOMATED" | "HYBRID";
          voting_mode?: "PUBLIC" | "PRIVATE" | "JUDGES_ONLY";
          max_votes_per_judge?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prize_cohorts_hackathon_id_fkey";
            columns: ["hackathon_id"];
            isOneToOne: false;
            referencedRelation: "hackathons";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluation_criteria: {
        Row: {
          id: string;
          prize_cohort_id: string;
          name: string;
          points: number;
          description: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          prize_cohort_id: string;
          name: string;
          points: number;
          description: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          prize_cohort_id?: string;
          name?: string;
          points?: number;
          description?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "evaluation_criteria_prize_cohort_id_fkey";
            columns: ["prize_cohort_id"];
            isOneToOne: false;
            referencedRelation: "prize_cohorts";
            referencedColumns: ["id"];
          },
        ];
      };
      judges: {
        Row: {
          id: string;
          hackathon_id: string;
          email: string;
          status: "WAITING" | "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED";
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          hackathon_id: string;
          email: string;
          status?: "WAITING" | "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED";
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          hackathon_id?: string;
          email?: string;
          status?: "WAITING" | "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED";
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "judges_hackathon_id_fkey";
            columns: ["hackathon_id"];
            isOneToOne: false;
            referencedRelation: "hackathons";
            referencedColumns: ["id"];
          },
        ];
      };
      speakers: {
        Row: {
          id: string;
          name: string;
          position: string | null;
          x_name: string | null;
          x_handle: string | null;
          picture: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          position?: string | null;
          x_name?: string | null;
          x_handle?: string | null;
          picture?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          position?: string | null;
          x_name?: string | null;
          x_handle?: string | null;
          picture?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      schedule_slots: {
        Row: {
          id: string;
          hackathon_id: string;
          name: string;
          description: string;
          start_date_time: string;
          end_date_time: string;
          has_speaker: boolean | null;
          speaker_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          hackathon_id: string;
          name: string;
          description: string;
          start_date_time: string;
          end_date_time: string;
          has_speaker?: boolean | null;
          speaker_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          hackathon_id?: string;
          name?: string;
          description?: string;
          start_date_time?: string;
          end_date_time?: string;
          has_speaker?: boolean | null;
          speaker_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "schedule_slots_hackathon_id_fkey";
            columns: ["hackathon_id"];
            isOneToOne: false;
            referencedRelation: "hackathons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedule_slots_speaker_id_fkey";
            columns: ["speaker_id"];
            isOneToOne: false;
            referencedRelation: "speakers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      experience_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
      judging_mode: "MANUAL" | "AUTOMATED" | "HYBRID";
      voting_mode: "PUBLIC" | "PRIVATE" | "JUDGES_ONLY";
      judge_status: "WAITING" | "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
