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
      [_ in never]: never
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
