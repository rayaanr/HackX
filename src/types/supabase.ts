export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      evaluation_criteria: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          name: string;
          points: number;
          prize_cohort_id: string;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          id?: string;
          name: string;
          points: number;
          prize_cohort_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          name?: string;
          points?: number;
          prize_cohort_id?: string;
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
      hackathon_registrations: {
        Row: {
          hackathon_id: string | null;
          id: string;
          registered_at: string | null;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          hackathon_id?: string | null;
          id?: string;
          registered_at?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          hackathon_id?: string | null;
          id?: string;
          registered_at?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hackathon_registrations_hackathon_id_fkey";
            columns: ["hackathon_id"];
            isOneToOne: false;
            referencedRelation: "hackathons";
            referencedColumns: ["id"];
          },
        ];
      };
      hackathons: {
        Row: {
          created_at: string | null;
          created_by: string;
          experience_level: Database["public"]["Enums"]["experience_level"];
          full_description: string;
          hackathon_end_date: string | null;
          hackathon_start_date: string | null;
          id: string;
          location: string;
          name: string;
          registration_end_date: string | null;
          registration_start_date: string | null;
          short_description: string;
          social_links: Json | null;
          tech_stack: string[];
          updated_at: string | null;
          visual: string | null;
          voting_end_date: string | null;
          voting_start_date: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          experience_level: Database["public"]["Enums"]["experience_level"];
          full_description: string;
          hackathon_end_date?: string | null;
          hackathon_start_date?: string | null;
          id?: string;
          location: string;
          name: string;
          registration_end_date?: string | null;
          registration_start_date?: string | null;
          short_description: string;
          social_links?: Json | null;
          tech_stack?: string[];
          updated_at?: string | null;
          visual?: string | null;
          voting_end_date?: string | null;
          voting_start_date?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          experience_level?: Database["public"]["Enums"]["experience_level"];
          full_description?: string;
          hackathon_end_date?: string | null;
          hackathon_start_date?: string | null;
          id?: string;
          location?: string;
          name?: string;
          registration_end_date?: string | null;
          registration_start_date?: string | null;
          short_description?: string;
          social_links?: Json | null;
          tech_stack?: string[];
          updated_at?: string | null;
          visual?: string | null;
          voting_end_date?: string | null;
          voting_start_date?: string | null;
        };
        Relationships: [];
      };
      judges: {
        Row: {
          created_at: string | null;
          email: string;
          hackathon_id: string;
          id: string;
          status: Database["public"]["Enums"]["judge_status"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          hackathon_id: string;
          id?: string;
          status?: Database["public"]["Enums"]["judge_status"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          hackathon_id?: string;
          id?: string;
          status?: Database["public"]["Enums"]["judge_status"];
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
      prize_cohorts: {
        Row: {
          created_at: string | null;
          description: string;
          hackathon_id: string;
          id: string;
          judging_mode: Database["public"]["Enums"]["judging_mode"];
          max_votes_per_judge: number;
          name: string;
          number_of_winners: number;
          prize_amount: string;
          updated_at: string | null;
          voting_mode: Database["public"]["Enums"]["voting_mode"];
        };
        Insert: {
          created_at?: string | null;
          description: string;
          hackathon_id: string;
          id?: string;
          judging_mode: Database["public"]["Enums"]["judging_mode"];
          max_votes_per_judge: number;
          name: string;
          number_of_winners: number;
          prize_amount: string;
          updated_at?: string | null;
          voting_mode: Database["public"]["Enums"]["voting_mode"];
        };
        Update: {
          created_at?: string | null;
          description?: string;
          hackathon_id?: string;
          id?: string;
          judging_mode?: Database["public"]["Enums"]["judging_mode"];
          max_votes_per_judge?: number;
          name?: string;
          number_of_winners?: number;
          prize_amount?: string;
          updated_at?: string | null;
          voting_mode?: Database["public"]["Enums"]["voting_mode"];
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
      projects: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          demo_url: string | null;
          description: string | null;
          hackathon_id: string | null;
          id: string;
          name: string;
          repository_url: string | null;
          status: string | null;
          team_members: Json | null;
          tech_stack: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          demo_url?: string | null;
          description?: string | null;
          hackathon_id?: string | null;
          id?: string;
          name: string;
          repository_url?: string | null;
          status?: string | null;
          team_members?: Json | null;
          tech_stack?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          demo_url?: string | null;
          description?: string | null;
          hackathon_id?: string | null;
          id?: string;
          name?: string;
          repository_url?: string | null;
          status?: string | null;
          team_members?: Json | null;
          tech_stack?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_hackathon_id_fkey";
            columns: ["hackathon_id"];
            isOneToOne: false;
            referencedRelation: "hackathons";
            referencedColumns: ["id"];
          },
        ];
      };
      schedule_slots: {
        Row: {
          created_at: string | null;
          description: string;
          end_date_time: string;
          hackathon_id: string;
          has_speaker: boolean | null;
          id: string;
          name: string;
          speaker_id: string | null;
          start_date_time: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          end_date_time: string;
          hackathon_id: string;
          has_speaker?: boolean | null;
          id?: string;
          name: string;
          speaker_id?: string | null;
          start_date_time: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          end_date_time?: string;
          hackathon_id?: string;
          has_speaker?: boolean | null;
          id?: string;
          name?: string;
          speaker_id?: string | null;
          start_date_time?: string;
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
      speakers: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          picture: string | null;
          position: string | null;
          x_handle: string | null;
          x_name: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          picture?: string | null;
          position?: string | null;
          x_handle?: string | null;
          x_name?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          picture?: string | null;
          position?: string | null;
          x_handle?: string | null;
          x_name?: string | null;
        };
        Relationships: [];
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
      judge_status: "WAITING" | "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED";
      judging_mode: "MANUAL" | "AUTOMATED" | "HYBRID";
      voting_mode: "PUBLIC" | "PRIVATE" | "JUDGES_ONLY";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
