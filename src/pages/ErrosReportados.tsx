import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Mail, Phone, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorReport {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  status: string;
  created_at: string;
  data_resolucao: string | null;
  images?: { image_url: string }[];
}

const ErrosReportados = () => {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    loadReports();

    // Setup realtime subscription
    const channel = supabase
      .channel('error-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'error_reports'
        },
        () => {
          loadReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(reportsData);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportImages = async (reportId: string) => {
    const { data, error } = await supabase
      .from('error_report_images')
      .select('image_url')
      .eq('error_report_id', reportId);

    if (error) {
      console.error('Error fetching images:', error);
      return [];
    }

    // Try to sign the URLs if they are from Supabase Storage
    const signedImages = await Promise.all((data || []).map(async (img) => {
      try {
        // Check if it's a Supabase Storage URL
        if (img.image_url.includes('/storage/v1/object/public/error-reports/')) {
          const path = img.image_url.split('/error-reports/')[1];
          if (path) {
            const { data: signedData, error: signedError } = await supabase.storage
              .from('error-reports')
              .createSignedUrl(path, 60 * 60); // 1 hour expiry

            if (!signedError && signedData) {
              return { image_url: signedData.signedUrl };
            }
          }
        }
        return img;
      } catch (e) {
        console.error('Error signing URL:', e);
        return img;
      }
    }));

    return signedImages;
  };

  const handleSelectReport = async (report: ErrorReport) => {
    const images = await fetchReportImages(report.id);
    setSelectedReport({ ...report, images });
  };

  const handleMarkAsResolved = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({
          status: 'resolvido',
          data_resolucao: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Get the report details to find the user_id
      const { data: report } = await supabase
        .from('error_reports')
        .select('user_id')
        .eq('id', reportId)
        .single();

      if (report?.user_id) {
        await supabase.rpc('send_notification', {
          p_title: 'Erro Resolvido',
          p_message: 'Seu erro reportado foi corrigido/resolvido. Obrigado por nos ajudar a melhorar o sistema.',
          p_user_id: report.user_id,
          p_is_mass: false
        });
      }

      toast.success("Relatório marcado como resolvido");
      setSelectedReport(null);
      loadReports();
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast.error("Erro ao atualizar relatório");
    }
  };

  const handleMarkAsInAnalysis = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({ status: 'em_analise' })
        .eq('id', reportId);

      if (error) throw error;

      toast.success("Relatório marcado como em análise");
      loadReports();
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast.error("Erro ao atualizar relatório");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Enviado</Badge>;
      case 'em_analise':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Em Análise</Badge>;
      case 'resolvido':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Resolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === "todos") return true;
    return report.status === filter;
  });

  const countByStatus = (status: string) => {
    return reports.filter(r => r.status === status).length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Erros Reportados</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os relatórios de erros enviados pelos usuários
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {reports.filter(r => r.status !== 'resolvido').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('enviado')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('em_analise')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('resolvido')}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="todos" onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="todos">Todos ({reports.length})</TabsTrigger>
                <TabsTrigger value="enviado">Enviados ({countByStatus('enviado')})</TabsTrigger>
                <TabsTrigger value="em_analise">Em Análise ({countByStatus('em_analise')})</TabsTrigger>
                <TabsTrigger value="resolvido">Resolvidos ({countByStatus('resolvido')})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum relatório encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectReport(report)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{report.assunto}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {report.nome}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {report.email}
                          </span>
                          <span>
                            {new Date(report.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{selectedReport.assunto}</h3>
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Nome:</span>
                      <span>{selectedReport.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">E-mail:</span>
                      <span>{selectedReport.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span>
                      <span>{selectedReport.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Data de envio:</span>
                      <span>
                        {new Date(selectedReport.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mensagem:</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {selectedReport.mensagem}
                </p>
              </div>

              {selectedReport.images && selectedReport.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Imagens Anexadas:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.images.map((img, index) => (
                      <a
                        key={index}
                        href={img.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img.image_url}
                          alt={`Anexo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedReport.status === 'enviado' && (
                  <Button
                    onClick={() => handleMarkAsInAnalysis(selectedReport.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    Marcar como Em Análise
                  </Button>
                )}
                {selectedReport.status !== 'resolvido' && (
                  <Button
                    onClick={() => handleMarkAsResolved(selectedReport.id)}
                    className="flex-1"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Resolvido
                  </Button>
                )}
                {selectedReport.status === 'resolvido' && (
                  <div className="flex-1 text-center py-2 bg-green-100 text-green-700 rounded-md">
                    Resolvido em{' '}
                    {new Date(selectedReport.data_resolucao!).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ErrosReportados;