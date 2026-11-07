export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      approval_actions: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: number
          reason: string | null
          request_id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: never
          reason?: string | null
          request_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: never
          reason?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_actions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          effective_at: string | null
          id: string
          proposed_payload: Json
          reason: string
          request_type: string
          requested_at: string
          requested_by: string
          resource_id: string | null
          resource_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          effective_at?: string | null
          id?: string
          proposed_payload: Json
          reason: string
          request_type: string
          requested_at?: string
          requested_by: string
          resource_id?: string | null
          resource_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          effective_at?: string | null
          id?: string
          proposed_payload?: Json
          reason?: string
          request_type?: string
          requested_at?: string
          requested_by?: string
          resource_id?: string | null
          resource_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_kind: string
          actor_user_id: string | null
          id: number
          idempotency_key: string | null
          merchant_id: string | null
          metadata: Json
          occurred_at: string
          outcome: string
          reason: string | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_kind: string
          actor_user_id?: string | null
          id?: never
          idempotency_key?: string | null
          merchant_id?: string | null
          metadata?: Json
          occurred_at?: string
          outcome: string
          reason?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_kind?: string
          actor_user_id?: string | null
          id?: never
          idempotency_key?: string | null
          merchant_id?: string | null
          metadata?: Json
          occurred_at?: string
          outcome?: string
          reason?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_order_items: {
        Row: {
          created_at: string
          id: string
          line_total_amount: number
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string | null
          unit_price_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_amount: number
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot?: string | null
          unit_price_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total_amount?: number
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string | null
          unit_price_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "commerce_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merchant_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_orders: {
        Row: {
          campaign_id: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          customer_note: string | null
          discount_amount: number
          id: string
          location_id: string | null
          member_user_id: string
          merchant_id: string
          order_code: string
          placed_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          discount_amount?: number
          id?: string
          location_id?: string | null
          member_user_id: string
          merchant_id: string
          order_code: string
          placed_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          discount_amount?: number
          id?: string
          location_id?: string | null
          member_user_id?: string
          merchant_id?: string
          order_code?: string
          placed_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_orders_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "merchant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_orders_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_records: {
        Row: {
          actor_user_id: string | null
          command: string
          created_at: string
          expires_at: string | null
          id: string
          idempotency_key: string
          request_hash: string
          response_payload: Json | null
          scope: string
        }
        Insert: {
          actor_user_id?: string | null
          command: string
          created_at?: string
          expires_at?: string | null
          id?: string
          idempotency_key: string
          request_hash: string
          response_payload?: Json | null
          scope: string
        }
        Update: {
          actor_user_id?: string | null
          command?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          idempotency_key?: string
          request_hash?: string
          response_payload?: Json | null
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_records_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          line_number: number
          merchant_id: string | null
          transaction_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          line_number: number
          merchant_id?: string | null
          transaction_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          line_number?: number
          merchant_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "journal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_transactions: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          description: string
          effective_at: string
          id: string
          idempotency_key: string | null
          posted_at: string | null
          posted_by: string | null
          reversal_of: string | null
          source_id: string | null
          source_type: string
          status: string
          transaction_code: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency: string
          description: string
          effective_at: string
          id?: string
          idempotency_key?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reversal_of?: string | null
          source_id?: string | null
          source_type: string
          status?: string
          transaction_code: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          effective_at?: string
          id?: string
          idempotency_key?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reversal_of?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          transaction_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_transactions_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "journal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_accounts: {
        Row: {
          account_class: string
          account_code: string
          account_name: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          account_class: string
          account_code: string
          account_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          account_class?: string
          account_code?: string
          account_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          merchant_id: string
          name: string
          starts_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          merchant_id: string
          name: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          merchant_id?: string
          name?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          created_at: string
          joined_at: string
          marketing_consent_at: string | null
          member_code: string | null
          referral_code: string | null
          referred_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          joined_at?: string
          marketing_consent_at?: string | null
          member_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          joined_at?: string
          marketing_consent_at?: string | null
          member_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_locations: {
        Row: {
          address_line: string | null
          city: string
          created_at: string
          district: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          merchant_id: string
          name: string
          phone: string | null
          updated_at: string
          ward: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          merchant_id: string
          name: string
          phone?: string | null
          updated_at?: string
          ward?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          merchant_id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_locations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_obligations: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          description: string
          due_at: string | null
          id: string
          merchant_id: string
          obligation_type: string
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency: string
          description: string
          due_at?: string | null
          id?: string
          merchant_id: string
          obligation_type: string
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          due_at?: string | null
          id?: string
          merchant_id?: string
          obligation_type?: string
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_obligations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_obligations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_products: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          image_url: string | null
          merchant_id: string
          name: string
          price_amount: number
          sku: string | null
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          merchant_id: string
          name: string
          price_amount: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          merchant_id?: string
          name?: string
          price_amount?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_type: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          legal_name: string
          logo_url: string | null
          onboarding_status: Database["public"]["Enums"]["merchant_onboarding_status"]
          slug: string | null
          status: Database["public"]["Enums"]["account_status"]
          tax_identifier: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          legal_name: string
          logo_url?: string | null
          onboarding_status?: Database["public"]["Enums"]["merchant_onboarding_status"]
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          tax_identifier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          legal_name?: string
          logo_url?: string | null
          onboarding_status?: Database["public"]["Enums"]["merchant_onboarding_status"]
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          tax_identifier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          description: string
          id: string
        }
        Insert: {
          code: string
          description: string
          id?: string
        }
        Update: {
          code?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      points_accounts: {
        Row: {
          created_at: string
          id: string
          member_user_id: string
          policy_version_id: string | null
          program_code: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_user_id: string
          policy_version_id?: string | null
          program_code: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_user_id?: string
          policy_version_id?: string | null
          program_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_accounts_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "points_accounts_policy_version_id_fkey"
            columns: ["policy_version_id"]
            isOneToOne: false
            referencedRelation: "policy_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      points_entries: {
        Row: {
          actor_user_id: string | null
          entry_type: string
          id: string
          idempotency_key: string | null
          occurred_at: string
          points_account_id: string
          points_delta: number
          reason: string
          reverses_entry_id: string | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          actor_user_id?: string | null
          entry_type: string
          id?: string
          idempotency_key?: string | null
          occurred_at?: string
          points_account_id: string
          points_delta: number
          reason: string
          reverses_entry_id?: string | null
          source_id?: string | null
          source_type: string
        }
        Update: {
          actor_user_id?: string | null
          entry_type?: string
          id?: string
          idempotency_key?: string | null
          occurred_at?: string
          points_account_id?: string
          points_delta?: number
          reason?: string
          reverses_entry_id?: string | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_entries_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_entries_points_account_id_fkey"
            columns: ["points_account_id"]
            isOneToOne: false
            referencedRelation: "points_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_entries_reverses_entry_id_fkey"
            columns: ["reverses_entry_id"]
            isOneToOne: false
            referencedRelation: "points_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      points_holds: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          points_account_id: string
          points_amount: number
          reason: string
          resolved_at: string | null
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_account_id: string
          points_amount: number
          reason: string
          resolved_at?: string | null
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_account_id?: string
          points_amount?: number
          reason?: string
          resolved_at?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_holds_points_account_id_fkey"
            columns: ["points_account_id"]
            isOneToOne: false
            referencedRelation: "points_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_sets: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_sets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_versions: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          effective_from: string | null
          effective_until: string | null
          id: string
          policy_set_id: string
          status: string
          version: number
        }
        Insert: {
          config: Json
          created_at?: string
          created_by: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          policy_set_id: string
          status: string
          version: number
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          policy_set_id?: string
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_versions_policy_set_id_fkey"
            columns: ["policy_set_id"]
            isOneToOne: false
            referencedRelation: "policy_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reconciliation_batches: {
        Row: {
          batch_code: string
          completed_at: string | null
          created_at: string
          created_by: string
          currency: string
          id: string
          period_end: string | null
          period_start: string | null
          source_reference: string | null
          source_system: string
          status: string
        }
        Insert: {
          batch_code: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          currency: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          source_reference?: string | null
          source_system: string
          status?: string
        }
        Update: {
          batch_code?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          source_reference?: string | null
          source_system?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_items: {
        Row: {
          batch_id: string
          created_at: string
          expected_amount: number | null
          external_reference: string | null
          id: string
          internal_reference: string | null
          observed_amount: number | null
          resolution_note: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          expected_amount?: number | null
          external_reference?: string | null
          id?: string
          internal_reference?: string | null
          observed_amount?: number | null
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          expected_amount?: number | null
          external_reference?: string | null
          id?: string
          internal_reference?: string | null
          observed_amount?: number | null
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "reconciliation_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          id: string
          is_platform_role: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_platform_role?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_platform_role?: boolean
          name?: string
        }
        Relationships: []
      }
      settlement_batches: {
        Row: {
          batch_code: string
          created_at: string
          created_by: string
          currency: string
          id: string
          merchant_id: string | null
          period_end: string | null
          period_start: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          batch_code: string
          created_at?: string
          created_by: string
          currency: string
          id?: string
          merchant_id?: string | null
          period_end?: string | null
          period_start?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          batch_code?: string
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          merchant_id?: string | null
          period_end?: string | null
          period_start?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_batches_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_batches_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_lines: {
        Row: {
          amount: number
          batch_id: string
          created_at: string
          currency: string
          description: string
          id: string
          obligation_id: string | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          amount: number
          batch_id: string
          created_at?: string
          currency: string
          description: string
          id?: string
          obligation_id?: string | null
          source_id?: string | null
          source_type: string
        }
        Update: {
          amount?: number
          batch_id?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          obligation_id?: string | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_lines_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "settlement_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_lines_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "merchant_obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_grants: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          merchant_id: string | null
          revoked_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          merchant_id?: string | null
          revoked_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          merchant_id?: string | null
          revoked_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_grants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_grants_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_merchant: {
        Args: {
          p_business_type?: string
          p_contact_email?: string
          p_contact_phone?: string
          p_display_name: string
          p_legal_name: string
          p_slug?: string
        }
        Returns: string
      }
      admin_create_policy_set: {
        Args: { p_code: string; p_description?: string; p_name: string }
        Returns: string
      }
      create_policy_version_draft: {
        Args: { p_config: Json; p_policy_set_id: string }
        Returns: string
      }
      merchant_create_campaign: {
        Args: {
          p_description?: string
          p_ends_at?: string
          p_merchant_id: string
          p_name: string
          p_starts_at?: string
        }
        Returns: string
      }
      merchant_create_location: {
        Args: {
          p_address_line?: string
          p_city?: string
          p_district?: string
          p_is_primary?: boolean
          p_merchant_id: string
          p_name: string
          p_phone?: string
          p_ward?: string
        }
        Returns: string
      }
      merchant_create_product: {
        Args: {
          p_category_id?: string
          p_description?: string
          p_image_url?: string
          p_merchant_id: string
          p_name: string
          p_price_amount: number
          p_sku?: string
        }
        Returns: string
      }
      review_approval_request: {
        Args: { p_decision: string; p_reason: string; p_request_id: string }
        Returns: string
      }
      submit_budget_approval_request: {
        Args: {
          p_amount: number
          p_campaign_id: string
          p_currency: string
          p_funding_source: string
          p_merchant_id: string
          p_purpose: string
          p_reason: string
        }
        Returns: string
      }
      submit_policy_approval_request: {
        Args: {
          p_policy_set_id: string
          p_proposed_config: Json
          p_reason: string
        }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "closed"
      approval_status: "pending" | "approved" | "rejected" | "cancelled"
      campaign_status:
        | "draft"
        | "scheduled"
        | "active"
        | "paused"
        | "ended"
        | "cancelled"
      merchant_onboarding_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "suspended"
      order_status:
        | "draft"
        | "placed"
        | "accepted"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      product_status: "draft" | "active" | "hidden" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "closed"],
      approval_status: ["pending", "approved", "rejected", "cancelled"],
      campaign_status: [
        "draft",
        "scheduled",
        "active",
        "paused",
        "ended",
        "cancelled",
      ],
      merchant_onboarding_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "suspended",
      ],
      order_status: [
        "draft",
        "placed",
        "accepted",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      product_status: ["draft", "active", "hidden", "archived"],
    },
  },
} as const
