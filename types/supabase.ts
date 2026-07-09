export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          role: "customer" | "mover" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          role?: "customer" | "mover" | "admin";
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          role?: "customer" | "mover" | "admin";
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          customer_id: string | null;
          mover_id: string | null;
          status: "new" | "contacted" | "quoted" | "booked" | "completed" | "closed";
          move_from_city: string;
          move_from_state: string;
          move_to_city: string;
          move_to_state: string;
          move_date: string | null;
          total_cu_ft: number;
          total_items: number;
          agreed_quote: number | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          mover_id?: string | null;
          status?: "new" | "contacted" | "quoted" | "booked" | "completed" | "closed";
          move_from_city: string;
          move_from_state: string;
          move_to_city: string;
          move_to_state: string;
          move_date?: string | null;
          total_cu_ft?: number;
          total_items?: number;
          agreed_quote?: number | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
        };
        Update: {
          mover_id?: string | null;
          status?: "new" | "contacted" | "quoted" | "booked" | "completed" | "closed";
          agreed_quote?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          lead_id: string;
          room: string;
          item: string;
          quantity: number;
          cu_ft_per_item: number;
        };
        Insert: {
          id?: string;
          lead_id: string;
          room: string;
          item: string;
          quantity?: number;
          cu_ft_per_item?: number;
        };
        Update: {
          quantity?: number;
          cu_ft_per_item?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_id: string | null;
          mover_id: string | null;
          lead_id: string | null;
          rating: number;
          title: string | null;
          body: string;
          customer_name: string;
          move_from_city: string | null;
          move_to_city: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          mover_id?: string | null;
          lead_id?: string | null;
          rating: number;
          title?: string | null;
          body: string;
          customer_name: string;
          move_from_city?: string | null;
          move_to_city?: string | null;
          is_verified?: boolean;
        };
        Update: {
          rating?: number;
          title?: string | null;
          body?: string;
          is_verified?: boolean;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          name: string;
          base_rate_per_cu_ft: number;
          rate_per_mile: number;
          minimum_price: number;
          labor_rate_per_hour: number;
          seasonal_multiplier_summer: number;
          seasonal_multiplier_winter: number;
          accessibility_fee: number;
          packing_service_rate: number;
          storage_rate_per_day: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          base_rate_per_cu_ft: number;
          rate_per_mile?: number;
          minimum_price?: number;
          labor_rate_per_hour?: number;
          seasonal_multiplier_summer?: number;
          seasonal_multiplier_winter?: number;
          accessibility_fee?: number;
          packing_service_rate?: number;
          storage_rate_per_day?: number;
          active?: boolean;
        };
        Update: {
          name?: string;
          base_rate_per_cu_ft?: number;
          rate_per_mile?: number;
          minimum_price?: number;
          labor_rate_per_hour?: number;
          seasonal_multiplier_summer?: number;
          seasonal_multiplier_winter?: number;
          accessibility_fee?: number;
          packing_service_rate?: number;
          storage_rate_per_day?: number;
          active?: boolean;
        };
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          created_by: string | null;
          used_by: string | null;
          used_at: string | null;
          max_uses: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          created_by?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          max_uses?: number;
          expires_at?: string | null;
        };
        Update: {
          used_by?: string | null;
          used_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
