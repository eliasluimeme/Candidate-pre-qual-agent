import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          candidate_name: string
          candidate_email: string
          position: string
          applied_at: string
          current_step: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_name: string
          candidate_email: string
          position: string
          applied_at?: string
          current_step?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_name?: string
          candidate_email?: string
          position?: string
          applied_at?: string
          current_step?: number
          created_at?: string
          updated_at?: string
        }
      }
      application_steps: {
        Row: {
          id: string
          application_id: string
          step_name: string
          step_order: number
          status: "pending" | "in-progress" | "completed"
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          step_name: string
          step_order: number
          status?: "pending" | "in-progress" | "completed"
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          step_name?: string
          step_order?: number
          status?: "pending" | "in-progress" | "completed"
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
