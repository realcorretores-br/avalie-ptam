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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      additional_reports_purchases: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          preco_total: number
          preco_unitario: number
          quantidade: number
          status: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          preco_total: number
          preco_unitario?: number
          quantidade: number
          status?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
          status?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "additional_reports_purchases_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      avaliacao_templates: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          is_default: boolean | null
          nome: string
          template_data: Json
          tipo_imovel: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_default?: boolean | null
          nome: string
          template_data: Json
          tipo_imovel: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_default?: boolean | null
          nome?: string
          template_data?: Json
          tipo_imovel?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          created_at: string | null
          endereco_imovel: string | null
          finalidade: string | null
          form_data: Json
          id: string
          status: string | null
          tipo_imovel: string | null
          updated_at: string | null
          user_id: string
          valor_final: number | null
        }
        Insert: {
          created_at?: string | null
          endereco_imovel?: string | null
          finalidade?: string | null
          form_data: Json
          id?: string
          status?: string | null
          tipo_imovel?: string | null
          updated_at?: string | null
          user_id: string
          valor_final?: number | null
        }
        Update: {
          created_at?: string | null
          endereco_imovel?: string | null
          finalidade?: string | null
          form_data?: Json
          id?: string
          status?: string | null
          tipo_imovel?: string | null
          updated_at?: string | null
          user_id?: string
          valor_final?: number | null
        }
        Relationships: []
      }
      error_report_images: {
        Row: {
          created_at: string
          error_report_id: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          error_report_id: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          error_report_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_report_images_error_report_id_fkey"
            columns: ["error_report_id"]
            isOneToOne: false
            referencedRelation: "error_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      error_reports: {
        Row: {
          assunto: string
          created_at: string
          data_resolucao: string | null
          email: string
          id: string
          mensagem: string
          nome: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assunto: string
          created_at?: string
          data_resolucao?: string | null
          email: string
          id?: string
          mensagem: string
          nome: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assunto?: string
          created_at?: string
          data_resolucao?: string | null
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      landing_content: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          logo_url: string | null
          metadata: Json | null
          section: string
          subtitle: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          section: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          section?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      landing_items: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          order_index: number | null
          section: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          order_index?: number | null
          section: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          order_index?: number | null
          section?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_mass: boolean
          message: string
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_mass?: boolean
          message: string
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_mass?: boolean
          message?: string
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          ativo: boolean | null
          beneficios: Json | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco: number
          relatorios_incluidos: number | null
          tipo: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          ativo?: boolean | null
          beneficios?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco: number
          relatorios_incluidos?: number | null
          tipo: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          ativo?: boolean | null
          beneficios?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
          relatorios_incluidos?: number | null
          tipo?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bairro: string | null
          bloqueado_ate: string | null
          cau: string | null
          cep: string
          cidade: string
          cnae: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          crea: string | null
          created_at: string | null
          creci: string | null
          data_cadastro: string | null
          data_ultimo_relatorio: string | null
          email: string
          endereco: string
          estado: string
          estrangeiro: boolean | null
          id: string
          logo_url: string | null
          nome_completo: string
          numero: string | null
          pais_origem: string | null
          passaporte: string | null
          rg: string | null
          telefone: string
          theme_color: string | null
          tipo_avaliador: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          bloqueado_ate?: string | null
          cau?: string | null
          cep: string
          cidade: string
          cnae?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          crea?: string | null
          created_at?: string | null
          creci?: string | null
          data_cadastro?: string | null
          data_ultimo_relatorio?: string | null
          email: string
          endereco: string
          estado: string
          estrangeiro?: boolean | null
          id: string
          logo_url?: string | null
          nome_completo: string
          numero?: string | null
          pais_origem?: string | null
          passaporte?: string | null
          rg?: string | null
          telefone: string
          theme_color?: string | null
          tipo_avaliador?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          bloqueado_ate?: string | null
          cau?: string | null
          cep?: string
          cidade?: string
          cnae?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          crea?: string | null
          created_at?: string | null
          creci?: string | null
          data_cadastro?: string | null
          data_ultimo_relatorio?: string | null
          email?: string
          endereco?: string
          estado?: string
          estrangeiro?: boolean | null
          id?: string
          logo_url?: string | null
          nome_completo?: string
          numero?: string | null
          pais_origem?: string | null
          passaporte?: string | null
          rg?: string | null
          telefone?: string
          theme_color?: string | null
          tipo_avaliador?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ptam_reports: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_data: Json
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string | null
          data_expiracao: string | null
          data_inicio: string | null
          data_saldo_expira: string | null
          id: string
          payment_id: string | null
          payment_method_id: string | null
          payment_status: string | null
          plan_id: string
          plano_anterior_id: string | null
          relatorios_disponiveis: number | null
          relatorios_usados: number | null
          saldo_acumulado: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          data_saldo_expira?: string | null
          id?: string
          payment_id?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          plan_id: string
          plano_anterior_id?: string | null
          relatorios_disponiveis?: number | null
          relatorios_usados?: number | null
          saldo_acumulado?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          data_saldo_expira?: string | null
          id?: string
          payment_id?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          plan_id?: string
          plano_anterior_id?: string | null
          relatorios_disponiveis?: number | null
          relatorios_usados?: number | null
          saldo_acumulado?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_videos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          ordem: number | null
          thumbnail: string | null
          titulo: string
          url_video: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          thumbnail?: string | null
          titulo: string
          url_video: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          thumbnail?: string | null
          titulo?: string
          url_video?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_accumulated_balances: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_notification: {
        Args: {
          p_title: string
          p_message: string
          p_user_id: string | null
          p_is_mass: boolean
        }
        Returns: void
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_type: "avulso" | "mensal_basico" | "mensal_pro" | "personalizado"
      subscription_status: "pending" | "active" | "cancelled" | "expired"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      plan_type: ["avulso", "mensal_basico", "mensal_pro", "personalizado"],
      subscription_status: ["pending", "active", "cancelled", "expired"],
    },
  },
} as const
