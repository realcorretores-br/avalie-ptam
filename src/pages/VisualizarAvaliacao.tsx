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
import { PrintSettingsDialog } from "@/components/PrintSettingsDialog";
import { PrintSettings, defaultPrintSettings } from "@/types/print";

const VisualizarAvaliacao = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PTAMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(defaultPrintSettings);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // 820px to include potential scrollbars or extra padding safety
      // 32px is total horizontal padding (16px * 2)
      const newScale = Math.min(1, (window.innerWidth - 32) / 800);
      setScale(newScale);
    };

    // Initial calc
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... (Keep existing fetch logic)
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

  // ... (Keep existing handlers)
  const handleExportPDF = async () => {
    try {
      const pages = document.querySelectorAll('.a4-page');
      if (!pages || pages.length === 0) {
        toast.error('Erro ao localizar o conteúdo para exportação');
        return;
      }
      toast.loading('Gerando PDF...');
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

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 print:p-0 print:m-0 print:max-w-none">
        <div className="mb-6 flex items-center justify-center print:hidden">
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/avaliacoes/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <PrintSettingsDialog
              settings={printSettings}
              onSettingsChange={setPrintSettings}
            />

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

        <div className="w-full flex justify-center pb-4 print:block print:w-auto">
          {/* Wrapper to clip overflow and handle height of scaled content if necessary */}
          <div
            className="origin-top"
            style={{
              transform: `scale(${scale})`,
              width: '210mm',
              // Fix for layout height not shrinking with scale:
              marginBottom: `-${(1 - scale) * 100}%`
            }}
          >
            <PTAMPreview data={formData} printSettings={printSettings} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarAvaliacao;
