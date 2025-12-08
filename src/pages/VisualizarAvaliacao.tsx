import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { PTAMPreview } from "@/components/PTAMPreview";
import { exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import { PTAMData } from "@/types/ptam";

const VisualizarAvaliacao = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PTAMData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAvaliacao = async () => {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast.error('Avaliação não encontrada');
        navigate('/dashboard/avaliacoes-salvas');
        return;
      }

      setFormData(data.form_data as unknown as PTAMData);
      setLoading(false);
    };

    fetchAvaliacao();
  }, [id, user, navigate]);

  const handleExportPDF = async () => {
    try {
      // Select all A4 pages
      const pages = document.querySelectorAll('.a4-page-content');
      if (!pages || pages.length === 0) {
        toast.error('Erro ao localizar o conteúdo para exportação');
        return;
      }

      toast.loading('Gerando PDF...');
      // Convert NodeList to Array of HTMLElements
      await exportToPDF(Array.from(pages) as HTMLElement[], 'PTAM-Parecer-Tecnico.pdf');
      toast.dismiss();
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao exportar PDF. Tente novamente.');
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      <div className="container mx-auto px-4 py-8 print:p-0 print:m-0 print:max-w-none">
        <div className="mb-6 flex items-center justify-center print:hidden">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/avaliacoes')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={handlePrint} variant="secondary" className="gap-2">
              <FileText className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleExportPDF} variant="secondary" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <PTAMPreview data={formData} />
      </div>
    </div>
  );
};

export default VisualizarAvaliacao;
