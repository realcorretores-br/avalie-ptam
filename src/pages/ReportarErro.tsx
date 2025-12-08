import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, Upload, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReportarErro = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);

  const loadHistorico = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('error_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistorico(data);
      setShowHistorico(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      toast.error("Você pode anexar no máximo 5 imagens");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede o tamanho máximo de 5MB`);
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} não é um formato válido (JPG, PNG, WEBP)`);
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assunto.trim() || !mensagem.trim()) {
      toast.error("Preencha todos os campos obrigatórios antes de enviar.");
      return;
    }

    if (mensagem.length < 50) {
      toast.error("A mensagem deve ter no mínimo 50 caracteres.");
      return;
    }

    if (mensagem.length > 1000) {
      toast.error("A mensagem deve ter no máximo 1000 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Create error report
      const { data: errorReport, error: reportError } = await supabase
        .from('error_reports')
        .insert({
          user_id: user?.id,
          nome: profile?.nome_completo || '',
          email: profile?.email || '',
          telefone: profile?.telefone || '',
          assunto: assunto.trim(),
          mensagem: mensagem.trim(),
          status: 'enviado'
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Upload images if any
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${user?.id}/${errorReport.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('error-reports')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('error-reports')
            .getPublicUrl(fileName);

          await supabase
            .from('error_report_images')
            .insert({
              error_report_id: errorReport.id,
              image_url: publicUrl
            });
        }
      }

      // Send notification to user
      const { error: notificationError } = await supabase.rpc('send_notification', {
        p_title: 'Relatório Recebido',
        p_message: 'Recebemos seu reporte de erro. Um técnico já foi informado e analisará seu problema o mais rápido possível.',
        p_user_id: user?.id ?? null,
        p_is_mass: false
      });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Fallback: Try direct insert if RPC fails (though unlikely to work if RLS blocks, but worth a try or just log)
      }

      toast.success("Seu relatório de erro foi enviado com sucesso. Nossa equipe já está analisando.");

      // Reset form
      setAssunto("");
      setMensagem("");
      setImages([]);

      // Reload historico
      loadHistorico();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error("Erro ao enviar relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado':
        return 'text-blue-600 bg-blue-100';
      case 'em_analise':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolvido':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'enviado':
        return 'Enviado';
      case 'em_analise':
        return 'Em análise';
      case 'resolvido':
        return 'Resolvido';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <CardTitle>Reportar Erro</CardTitle>
          </div>
          <CardDescription>
            Relate qualquer problema ou erro que você encontrou. Nossa equipe analisará e responderá em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={profile?.nome_completo || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={profile?.telefone || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assunto">
                Assunto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value.slice(0, 100))}
                placeholder="Resuma o erro em poucas palavras"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {assunto.length}/100 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">
                Mensagem <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value.slice(0, 1000))}
                placeholder="Descreva o erro em detalhes (mínimo 50 caracteres)"
                className="min-h-[150px]"
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {mensagem.length}/1000 caracteres (mínimo 50)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Anexar Imagens (opcional)</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={images.length >= 5}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Imagem
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {images.length}/5 imagens
                  </span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, WEBP. Máximo 5MB por imagem.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Enviando..." : "Enviar Relatório"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loadHistorico}
              >
                Ver Histórico
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showHistorico && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Relatórios</CardTitle>
            <CardDescription>
              Acompanhe o status dos seus relatórios enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historico.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Você ainda não enviou nenhum relatório
              </p>
            ) : (
              <div className="space-y-4">
                {historico.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{report.assunto}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportarErro;