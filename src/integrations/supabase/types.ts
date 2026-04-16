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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      business_settings: {
        Row: {
          business_address: string
          business_email: string
          business_name: string
          business_phone: string
          copyright_text: string
          currency_symbol: string
          favicon_url: string | null
          google_maps_url: string | null
          id: number
          logo_url: string | null
          whatsapp_business_number: string | null
        }
        Insert: {
          business_address?: string
          business_email?: string
          business_name?: string
          business_phone?: string
          copyright_text?: string
          currency_symbol?: string
          favicon_url?: string | null
          google_maps_url?: string | null
          id?: number
          logo_url?: string | null
          whatsapp_business_number?: string | null
        }
        Update: {
          business_address?: string
          business_email?: string
          business_name?: string
          business_phone?: string
          copyright_text?: string
          currency_symbol?: string
          favicon_url?: string | null
          google_maps_url?: string | null
          id?: number
          logo_url?: string | null
          whatsapp_business_number?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      contact_form_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          content: Json
          display_order: number
          id: number
          image_url: string | null
          is_active: boolean
          page_slug: string
          section_type: string
          title: string | null
        }
        Insert: {
          content?: Json
          display_order?: number
          id?: number
          image_url?: string | null
          is_active?: boolean
          page_slug: string
          section_type: string
          title?: string | null
        }
        Update: {
          content?: Json
          display_order?: number
          id?: number
          image_url?: string | null
          is_active?: boolean
          page_slug?: string
          section_type?: string
          title?: string | null
        }
        Relationships: []
      }
      footer_settings: {
        Row: {
          copyright_text: string
          footer_background_color: string
          footer_text_color: string
          id: number
          show_contact_info: boolean
          show_newsletter: boolean
          show_social_icons: boolean
        }
        Insert: {
          copyright_text?: string
          footer_background_color?: string
          footer_text_color?: string
          id?: number
          show_contact_info?: boolean
          show_newsletter?: boolean
          show_social_icons?: boolean
        }
        Update: {
          copyright_text?: string
          footer_background_color?: string
          footer_text_color?: string
          id?: number
          show_contact_info?: boolean
          show_newsletter?: boolean
          show_social_icons?: boolean
        }
        Relationships: []
      }
      header_settings: {
        Row: {
          header_background_color: string
          header_text_color: string
          id: number
          show_admin_icon: boolean
          show_cart_icon: boolean
          show_logo: boolean
          show_theme_toggle: boolean
        }
        Insert: {
          header_background_color?: string
          header_text_color?: string
          id?: number
          show_admin_icon?: boolean
          show_cart_icon?: boolean
          show_logo?: boolean
          show_theme_toggle?: boolean
        }
        Update: {
          header_background_color?: string
          header_text_color?: string
          id?: number
          show_admin_icon?: boolean
          show_cart_icon?: boolean
          show_logo?: boolean
          show_theme_toggle?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_type: string
          id: string
          items: Json
          order_status: string
          payment_method: string
          payment_status: string
          profit: number
          subtotal: number
          total_price: number
          whatsapp_sent: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_type?: string
          id: string
          items?: Json
          order_status?: string
          payment_method?: string
          payment_status?: string
          profit?: number
          subtotal?: number
          total_price?: number
          whatsapp_sent?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_type?: string
          id?: string
          items?: Json
          order_status?: string
          payment_method?: string
          payment_status?: string
          profit?: number
          subtotal?: number
          total_price?: number
          whatsapp_sent?: boolean
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          display_order: number
          id: number
          is_enabled: boolean
          method_name: string
          qr_code_url: string | null
        }
        Insert: {
          display_order?: number
          id?: number
          is_enabled?: boolean
          method_name: string
          qr_code_url?: string | null
        }
        Update: {
          display_order?: number
          id?: number
          is_enabled?: boolean
          method_name?: string
          qr_code_url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          cost_of_goods: number
          created_at: string
          id: string
          image_url: string | null
          inventory: number
          inventory_min_threshold: number
          is_available: boolean
          is_special: boolean
          name: string
          price: number
          special_end_date: string | null
          special_price: number | null
          unit: string
        }
        Insert: {
          category?: string
          cost_of_goods?: number
          created_at?: string
          id?: string
          image_url?: string | null
          inventory?: number
          inventory_min_threshold?: number
          is_available?: boolean
          is_special?: boolean
          name: string
          price?: number
          special_end_date?: string | null
          special_price?: number | null
          unit?: string
        }
        Update: {
          category?: string
          cost_of_goods?: number
          created_at?: string
          id?: string
          image_url?: string | null
          inventory?: number
          inventory_min_threshold?: number
          is_available?: boolean
          is_special?: boolean
          name?: string
          price?: number
          special_end_date?: string | null
          special_price?: number | null
          unit?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          display_order: number
          icon_name: string
          id: number
          is_enabled: boolean
          platform_name: string
          url: string
        }
        Insert: {
          display_order?: number
          icon_name: string
          id?: number
          is_enabled?: boolean
          platform_name: string
          url?: string
        }
        Update: {
          display_order?: number
          icon_name?: string
          id?: number
          is_enabled?: boolean
          platform_name?: string
          url?: string
        }
        Relationships: []
      }
      specials: {
        Row: {
          description: string
          discount_percent: number | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean
          products_included: Json
          special_type: string
          start_date: string
          title: string
        }
        Insert: {
          description?: string
          discount_percent?: number | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          products_included?: Json
          special_type?: string
          start_date?: string
          title: string
        }
        Update: {
          description?: string
          discount_percent?: number | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          products_included?: Json
          special_type?: string
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_image: string | null
          customer_name: string
          id: string
          is_approved: boolean
          rating: number
          review_text: string
        }
        Insert: {
          created_at?: string
          customer_image?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean
          rating?: number
          review_text: string
        }
        Update: {
          created_at?: string
          customer_image?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean
          rating?: number
          review_text?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          example: string | null
          id: number
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          example?: string | null
          id?: number
          label: string
          value: string
        }
        Update: {
          created_at?: string
          example?: string | null
          id?: number
          label?: string
          value?: string
        }
        Relationships: []
      }
      website_pages: {
        Row: {
          content: Json
          display_order: number
          id: number
          is_published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
        }
        Insert: {
          content?: Json
          display_order?: number
          id?: number
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
        }
        Update: {
          content?: Json
          display_order?: number
          id?: number
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
