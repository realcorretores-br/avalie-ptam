import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AvaliacaoTemplate {
  id: string;
  nome: string;
  tipo_imovel: string;
  descricao: string;
  template_data: any;
  is_default: boolean;
  ativo: boolean;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<AvaliacaoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('avaliacao_templates')
        .select('*')
        .eq('ativo', true)
        .order('tipo_imovel', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  return { templates, loading, refetch: fetchTemplates };
};
