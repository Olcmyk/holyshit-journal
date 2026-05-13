export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string
          title: string
          abstract: string
          keywords: string[]
          authors: Json
          highlights: string[]
          pdf_url: string
          pdf_hash: string
          pdf_pages: number
          morality_score: number | null
          humor_score: number | null
          scientific_score: number | null
          ai_review_notes: string | null
          status: 'pending' | 'approved' | 'rejected' | 'selected'
          rejection_reason: string | null
          submitted_at: string
          reviewed_at: string | null
          month_year: string
          vote_count: number
          final_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          abstract: string
          keywords: string[]
          authors: Json
          highlights: string[]
          pdf_url: string
          pdf_hash: string
          pdf_pages: number
          morality_score?: number | null
          humor_score?: number | null
          scientific_score?: number | null
          ai_review_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'selected'
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          month_year: string
          vote_count?: number
          final_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          abstract?: string
          keywords?: string[]
          authors?: Json
          highlights?: string[]
          pdf_url?: string
          pdf_hash?: string
          pdf_pages?: number
          morality_score?: number | null
          humor_score?: number | null
          scientific_score?: number | null
          ai_review_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'selected'
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          month_year?: string
          vote_count?: number
          final_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          submission_id: string
          question_text: string
          options: Json
          correct_answer: number
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          question_text: string
          options: Json
          correct_answer: number
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          question_text?: string
          options?: Json
          correct_answer?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          submission_id: string
          fingerprint: string
          ip_address: string
          user_agent: string | null
          voted_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          fingerprint: string
          ip_address: string
          user_agent?: string | null
          voted_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          fingerprint?: string
          ip_address?: string
          user_agent?: string | null
          voted_at?: string
        }
      }
      vote_cooldowns: {
        Row: {
          id: string
          submission_id: string
          fingerprint: string
          ip_address: string
          failed_at: string
          cooldown_until: string
        }
        Insert: {
          id?: string
          submission_id: string
          fingerprint: string
          ip_address: string
          failed_at?: string
          cooldown_until: string
        }
        Update: {
          id?: string
          submission_id?: string
          fingerprint?: string
          ip_address?: string
          failed_at?: string
          cooldown_until?: string
        }
      }
      selected_papers: {
        Row: {
          id: string
          submission_id: string
          month_year: string
          rank: number
          final_score: number
          selected_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          month_year: string
          rank: number
          final_score: number
          selected_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          month_year?: string
          rank?: number
          final_score?: number
          selected_at?: string
        }
      }
      ip_blocks: {
        Row: {
          id: string
          ip_address: string
          reason: string
          blocked_at: string
          blocked_until: string
          request_count: number
        }
        Insert: {
          id?: string
          ip_address: string
          reason: string
          blocked_at?: string
          blocked_until: string
          request_count?: number
        }
        Update: {
          id?: string
          ip_address?: string
          reason?: string
          blocked_at?: string
          blocked_until?: string
          request_count?: number
        }
      }
      submission_order_cache: {
        Row: {
          id: string
          month_year: string
          order_seed: number
          valid_until: string
          created_at: string
        }
        Insert: {
          id?: string
          month_year: string
          order_seed: number
          valid_until: string
          created_at?: string
        }
        Update: {
          id?: string
          month_year?: string
          order_seed?: number
          valid_until?: string
          created_at?: string
        }
      }
    }
  }
}
