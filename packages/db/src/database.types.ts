// Supabase 데이터베이스 타입 정의
// 실제 프로덕션에서는 `supabase gen types typescript` 명령으로 생성됩니다

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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          default_currency: string
          locale: string
          subscription_tier: string
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          default_currency?: string
          locale?: string
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          default_currency?: string
          locale?: string
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          name_en: string | null
          account_type: string
          account_subtype: string | null
          parent_id: string | null
          currency: string
          icon: string | null
          color: string | null
          is_active: boolean
          is_system: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          name_en?: string | null
          account_type: string
          account_subtype?: string | null
          parent_id?: string | null
          currency?: string
          icon?: string | null
          color?: string | null
          is_active?: boolean
          is_system?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          name_en?: string | null
          account_type?: string
          account_subtype?: string | null
          parent_id?: string | null
          currency?: string
          icon?: string | null
          color?: string | null
          is_active?: boolean
          is_system?: boolean
          display_order?: number
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          description: string | null
          memo: string | null
          is_voided: boolean
          voided_at: string | null
          source: string
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          description?: string | null
          memo?: string | null
          is_voided?: boolean
          voided_at?: string | null
          source?: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          description?: string | null
          memo?: string | null
          is_voided?: boolean
          voided_at?: string | null
          source?: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transaction_lines: {
        Row: {
          id: string
          journal_entry_id: string
          account_id: string
          amount: number
          currency: string
          exchange_rate: number
          memo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          account_id: string
          amount: number
          currency?: string
          exchange_rate?: number
          memo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          account_id?: string
          amount?: number
          currency?: string
          exchange_rate?: number
          memo?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          name: string
          amount: number
          currency: string
          period_type: string
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          name: string
          amount: number
          currency?: string
          period_type?: string
          start_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          name?: string
          amount?: number
          currency?: string
          period_type?: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          name: string
          template_entry: Json
          frequency: string
          next_occurrence: string
          last_processed: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template_entry: Json
          frequency: string
          next_occurrence: string
          last_processed?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template_entry?: Json
          frequency?: string
          next_occurrence?: string
          last_processed?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      balance_snapshots: {
        Row: {
          id: string
          user_id: string
          account_id: string
          snapshot_date: string
          balance: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          snapshot_date: string
          balance: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          snapshot_date?: string
          balance?: number
          currency?: string
          created_at?: string
        }
      }
      asset_prices: {
        Row: {
          id: string
          account_id: string
          price_date: string
          price: number
          currency: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          price_date: string
          price: number
          currency?: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          price_date?: string
          price?: number
          currency?: string
          source?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_account_balance: {
        Args: {
          p_account_id: string
          p_as_of_date?: string
        }
        Returns: number
      }
      get_net_worth: {
        Args: {
          p_user_id: string
          p_as_of_date?: string
        }
        Returns: number
      }
    }
    Enums: {
      account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
      subscription_tier: 'free' | 'premium' | 'premium_plus'
    }
  }
}
