import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useBlocker } from "react-router-dom"; // Added useBlocker
import { PTAMData, defaultPTAMData } from "@/types/ptam";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Eye, ArrowLeft, Printer } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Added Dialog components
import { Solicitante } from "./form-sections/Solicitante";
import { Avaliador } from "./form-sections/Avaliador";
import { Finalidade } from "./form-sections/Finalidade";
import { Objeto } from "./form-sections/Objeto";
import { Vistoria } from "./form-sections/Vistoria";
import { Localizacao } from "./form-sections/Localizacao";
import { DoImovel } from "./form-sections/DoImovel";
import { SituacaoDocumental } from "./form-sections/SituacaoDocumental";
import { Fatores } from "./form-sections/Fatores";
import { Metodologia } from "./form-sections/Metodologia";
import { Valores } from "./form-sections/Valores";
import { Conclusao } from "./form-sections/Conclusao";
import { Liquidacao } from "./form-sections/Liquidacao";
import { Justificativa } from "./form-sections/Justificativa";
import { ConsideracoesFinais } from "./form-sections/ConsideracoesFinais";
import { PTAMPreview } from "./PTAMPreview";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/exportUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFormValidation } from "@/hooks/useFormValidation";
import { TemplateSelector } from "./TemplateSelector";

const sections = [
  { id: 1, title: "Solicitante", component: Solicitante },
  { id: 2, title: "Avaliador", component: Avaliador },
  { id: 3, title: "Finalidade", component: Finalidade },
  { id: 4, title: "Objeto", component: Objeto },
  { id: 5, title: "Vistoria", component: Vistoria },
  { id: 6, title: "Localização", component: Localizacao },
  { id: 7, title: "Do Imóvel", component: DoImovel },
  { id: 8, title: "Situação Documental", component: SituacaoDocumental },
  { id: 9, title: "Fatores de Preço", component: Fatores },
  { id: 10, title: "Metodologia", component: Metodologia },
  { id: 11, title: "Valores", component: Valores },
  { id: 12, title: "Conclusão", component: Conclusao },
  { id: 13, title: "Liquidação", component: Liquidacao },
  { id: 14, title: "Justificativa", component: Justificativa },
  { id: 15, title: "Considerações Finais", component: ConsideracoesFinais },
];

export const PTAMForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { validateSection } = useFormValidation();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<PTAMData>({ ...defaultPTAMData } as PTAMData);
  const [showPreview, setShowPreview] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Check if user effectively has a recurring plan
  const hasRecurringPlan = subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (subscription.plans as any)?.tipo !== 'avulso';

  // Persistence Key
  const STORAGE_KEY = `ptam_form_draft_${user?.id || 'guest'}`;

  // Load initial data logic - Improved Step Persistence
  useEffect(() => {
    if (location.state?.editData) {
      setFormData(location.state.editData as PTAMData);
      setDraftId(location.state.avaliacaoId || null);
      if (typeof location.state.currentSection === 'number') {
        setCurrentSection(location.state.currentSection);
      } else if (location.state.editData.savedSection !== undefined) {
        // Restore section from DB data
        setCurrentSection(location.state.editData.savedSection);
      }
    } else {
      // Restore from Local Storage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.user_id === user?.id) {
            setFormData(prev => ({ ...prev, ...parsed.formData }));
            // Ensure section is restored and valid
            if (typeof parsed.currentSection === 'number' && parsed.currentSection >= 0) {
              setCurrentSection(parsed.currentSection);
            }
            setDraftId(parsed.draftId || null);
            toast.info('Rascunho recuperado automaticamente.');
          }
        } catch (e) {
          console.error('Error parsing local storage draft', e);
        }
      } else if (!location.state?.skipTemplate) {
        setShowTemplateSelector(true);
      }
    }
  }, [user?.id]);

  // Save to Local Storage
  useEffect(() => {
    if (user?.id && formData) {
      const stateToSave = {
        formData,
        currentSection,
        draftId,
        user_id: user.id,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [formData, currentSection, draftId, user?.id]);

  // Handle Browser Close/Reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData && Object.keys(formData).length > 0 && !isFinalized) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, isFinalized]);

  // Internal Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isFinalized &&
      Object.keys(formData).length > 0 &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const handleBlockerDiscard = () => {
    if (blocker.state === "blocked") {
      localStorage.removeItem(STORAGE_KEY); // Discard logic
      blocker.proceed();
    }
  };

  const handleBlockerSave = async () => {
    if (blocker.state === "blocked") {
      await handleSaveDraft(); // Save then proceed
      blocker.proceed();
    }
  };

  //  // Auto-save: salvar automaticamente a cada alteração
  useEffect(() => {
    if (!user || !formData || Object.keys(formData).length === 0) return;

    const autoSave = async () => {
      try {
        // Incluir currentSection no form_data para persistência entre navegadores
        const formDataWithSection = { ...formData, savedSection: currentSection };

        const dataToSave = {
          user_id: user.id,
          form_data: formDataWithSection as any,
          status: 'rascunho',
          finalidade: formData.finalidade || null,
          tipo_imovel: formData.tipoImovel || null,
          endereco_imovel: formData.enderecoImovel || null,
          valor_final: formData.valorMedio ? parseFloat(formData.valorMedio.replace(/[^\d,]/g, '').replace(',', '.') || '0') : null
        };

        if (draftId) {
          // Atualizar rascunho existente
          await supabase
            .from('avaliacoes')
            .update(dataToSave)
            .eq('id', draftId);
        } else {
          // Verificar limite de rascunhos antes do auto-save
          const { count } = await supabase
            .from('avaliacoes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'rascunho');

          if (count !== null && count >= 5) {
            // Silently fail or maybe show a toast only once? 
            // For auto-save, it's better not to spam toasts. 
            // But the user needs to know why it's not saving.
            // Let's log it and maybe show a toast if it's the first time failing?
            // For now, just return to prevent saving.
            console.log('Auto-save skipped: Draft limit reached');
            return;
          }

          // Criar novo rascunho
          const { data, error } = await supabase
            .from('avaliacoes')
            .insert([dataToSave])
            .select()
            .single();

          if (!error && data) {
            setDraftId(data.id);
          }
        }
      } catch (error) {
        console.error('Erro no auto-save:', error);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, user, draftId, currentSection]); // Added currentSection dependency

  const handleTemplateSelect = (templateData: any) => {
    if (Object.keys(templateData).length > 0) {
      setFormData((prev) => ({ ...prev, ...templateData }));
      toast.success('Template carregado com sucesso!');
    }
  };

  const updateFormData = (data: Partial<PTAMData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const progress = ((currentSection + 1) / sections.length) * 100;
  const CurrentSectionComponent = sections[currentSection].component;

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar');
      return;
    }

    try {
      // Incluir currentSection
      const formDataWithSection = { ...formData, savedSection: currentSection };

      const dataToSave = {
        user_id: user.id,
        form_data: formDataWithSection as any,
        status: 'rascunho',
        finalidade: formData.finalidade || null,
        tipo_imovel: formData.tipoImovel || null,
        endereco_imovel: formData.enderecoImovel || null,
        valor_final: formData.valorMedio ? parseFloat(formData.valorMedio.replace(/[^\d,]/g, '').replace(',', '.') || '0') : null
      };

      if (draftId) {
        await supabase
          .from('avaliacoes')
          .update(dataToSave)
          .eq('id', draftId);
      } else {
        // Verificar limite de rascunhos
        const { count } = await supabase
          .from('avaliacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'rascunho');

        if (count !== null && count >= 5) {
          toast.error('Limite de 5 rascunhos atingido. Exclua ou finalize um rascunho existente para criar um novo.');
          return;
        }

        const { data, error } = await supabase
          .from('avaliacoes')
          .insert([dataToSave])
          .select()
          .single();

        if (!error && data) {
          setDraftId(data.id);
        }
      }

      toast.success('Avaliação salva como rascunho. Você pode continuar depois em Avaliações Salvas.');
      navigate('/dashboard/avaliacoes');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    }
  };

  const handleNext = () => {
    // Validar campos obrigatórios antes de avançar
    const validation = validateSection(currentSection, formData);

    if (!validation.isValid) {
      toast.error('Por favor, preencha todos os campos obrigatórios antes de avançar.');
      return;
    }

    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleFinalize = async () => {
    if (!user || !subscription) {
      toast.error('Erro: Você precisa estar logado com um plano ativo');
      return;
    }

    try {
      // Verificar se há relatórios disponíveis
      if (subscription.relatorios_usados >= subscription.relatorios_disponiveis) {
        toast.error('Você não tem relatórios disponíveis. Compre mais créditos.');
        return;
      }

      // Salvar avaliação na tabela avaliacoes
      const { error: saveError } = await supabase
        .from('avaliacoes')
        .insert([{
          user_id: user.id,
          form_data: formData as any,
          status: 'finalizado',
          finalidade: formData.finalidade,
          tipo_imovel: formData.tipoImovel,
          endereco_imovel: formData.enderecoImovel,
          valor_final: parseFloat(formData.valorMedio?.replace(/[^\d,]/g, '').replace(',', '.') || '0')
        }]);

      if (saveError) throw saveError;

      // Incrementar contador de relatórios usados
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          relatorios_usados: subscription.relatorios_usados + 1
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      setIsFinalized(true);
      // Clear local storage on success
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Relatório finalizado com sucesso! 1 crédito foi descontado.');
    } catch (error) {
      console.error('Erro ao finalizar relatório:', error);
      toast.error('Erro ao finalizar relatório. Tente novamente.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const previewElement = document.getElementById('ptam-preview-content');
      if (!previewElement) {
        toast.error('Erro ao localizar o conteúdo para exportação');
        return;
      }

      toast.loading('Gerando PDF...');
      await exportToPDF([previewElement], 'PTAM-Parecer-Tecnico.pdf');
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

  if (showPreview) {
    return (
      <div className="min-h-screen bg-muted/30">
        <style>{`
          @media print {
            body, html {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .print-hide {
              display: none !important;
            }
            .a4-page {
              box-shadow: none !important;
              margin: 0 !important;
              page-break-after: always;
            }
          }
        `}</style>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-center print-hide">
            <div className="flex gap-3">
              {!isFinalized ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button onClick={handleFinalize} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Finalizar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/avaliacoes')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Minhas Avaliações
                  </Button>
                </>
              )}
              <Button
                onClick={handlePrint}
                variant="secondary"
                className="gap-2"
                disabled={!isFinalized}
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="secondary"
                className="gap-2"
                disabled={!isFinalized}
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
          <div className="a4-page mx-auto" style={{ maxWidth: '210mm' }}>
            <PTAMPreview data={formData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleTemplateSelect}
      />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">PTAM - Sistema de Avaliação</h1>
                  <p className="text-sm text-muted-foreground">Parecer Técnico de Avaliação Mercadológica - ABNT NBR 14.653</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSaveDraft}>
                  Concluir Depois
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Seção {currentSection + 1} de {sections.length}: {sections[currentSection].title}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
            <div>
              <Card className="p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  {currentSection + 1}. {sections[currentSection].title}
                </h2>
                <CurrentSectionComponent data={formData} updateData={updateFormData} />
              </Card>

              <div className="mt-6 flex items-center justify-between">
                <Button onClick={handlePrevious} disabled={currentSection === 0} variant="outline">
                  Anterior
                </Button>
                <div className="flex gap-3">
                  <Button onClick={handlePreview} variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </Button>
                  {currentSection === sections.length - 1 ? (
                    <Button onClick={handlePreview} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Finalizar e Visualizar
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>Próximo</Button>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <Card className="sticky top-4 p-4">
                <h3 className="mb-4 font-semibold text-foreground">Navegação</h3>
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setCurrentSection(index);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${index === currentSection
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {section.id}
                      </span>
                      <span className="flex-1 truncate">{section.title}</span>
                      {index < currentSection && (
                        <span className="text-primary">✓</span>
                      )}
                    </button>
                  ))}
                </nav>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasRecurringPlan ? "Você tem alterações não salvas" : "Atenção: Você não possui um plano ativo"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {hasRecurringPlan ? (
                "Se você sair agora, as alterações não salvas serão perdidas. Deseja salvar como rascunho antes de sair?"
              ) : (
                <>
                  <p>Você não possui um plano ativo (Mensal ou Anual).</p>
                  <p className="font-bold text-destructive">
                    Se sair agora, você perderá este rascunho e todo o progresso feito, pois o salvamento é exclusivo para assinantes.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset()}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockerDiscard} className="bg-destructive hover:bg-destructive/90 text-white">
              {hasRecurringPlan ? "Sair sem Salvar" : "Sair e Perder Dados"}
            </AlertDialogAction>
            {hasRecurringPlan && (
              <AlertDialogAction onClick={handleBlockerSave}>
                Salvar e Sair
              </AlertDialogAction>
            )}
            {!hasRecurringPlan && (
              <Button variant="default" onClick={() => {
                // Save locally just in case? No, honesty first.
                // Redirect to plans?
                window.open('/dashboard/planos', '_blank');
              }}>
                Assinar Agora
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
