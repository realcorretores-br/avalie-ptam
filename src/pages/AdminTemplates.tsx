import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash2, Home, Building2, TreePine } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";

const getIconForType = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'residencial':
      return <Home className="h-6 w-6 text-primary" />;
    case 'comercial':
      return <Building2 className="h-6 w-6 text-primary" />;
    case 'rural':
      return <TreePine className="h-6 w-6 text-primary" />;
    default:
      return <FileText className="h-6 w-6 text-primary" />;
  }
};

const AdminTemplates = () => {
  const { templates, loading, refetch } = useTemplates();
  const { logAction } = useAdminLog();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_imovel: 'Residencial',
    descricao: '',
    template_data: '{}',
    is_default: false,
    ativo: true
  });

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      nome: template.nome,
      tipo_imovel: template.tipo_imovel,
      descricao: template.descricao || '',
      template_data: JSON.stringify(template.template_data, null, 2),
      is_default: template.is_default,
      ativo: template.ativo
    });
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormData({
      nome: '',
      tipo_imovel: 'Residencial',
      descricao: '',
      template_data: '{}',
      is_default: false,
      ativo: true
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validar JSON
      let templateData;
      try {
        templateData = JSON.parse(formData.template_data);
      } catch (e) {
        toast.error('JSON inválido no campo de dados do template');
        return;
      }

      if (selectedTemplate) {
        // Atualizar
        const { error } = await (supabase as any)
          .from('avaliacao_templates')
          .update({
            nome: formData.nome,
            tipo_imovel: formData.tipo_imovel,
            descricao: formData.descricao,
            template_data: templateData,
            is_default: formData.is_default,
            ativo: formData.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        
        await logAction('update_template', {
          template_id: selectedTemplate.id,
          nome: formData.nome
        });
        
        toast.success('Template atualizado com sucesso!');
      } else {
        // Criar
        const { error } = await (supabase as any)
          .from('avaliacao_templates')
          .insert({
            nome: formData.nome,
            tipo_imovel: formData.tipo_imovel,
            descricao: formData.descricao,
            template_data: templateData,
            is_default: formData.is_default,
            ativo: formData.ativo
          });

        if (error) throw error;
        
        await logAction('create_template', {
          nome: formData.nome
        });
        
        toast.success('Template criado com sucesso!');
      }

      setEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await (supabase as any)
        .from('avaliacao_templates')
        .delete()
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      await logAction('delete_template', {
        template_id: selectedTemplate.id,
        nome: selectedTemplate.nome
      });

      toast.success('Template excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates de Avaliação</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie templates pré-configurados para diferentes tipos de imóveis
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getIconForType(template.tipo_imovel)}
                    <div className="flex gap-2">
                      {template.is_default && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                      {!template.ativo && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-1">{template.nome}</h3>
                    <Badge variant="outline" className="mb-2">
                      {template.tipo_imovel}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.descricao}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o template de avaliação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Template</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Residencial Padrão"
              />
            </div>

            <div>
              <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
              <Select
                value={formData.tipo_imovel}
                onValueChange={(value) => setFormData({ ...formData, tipo_imovel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residencial">Residencial</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do template"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="template_data">Dados do Template (JSON)</Label>
              <Textarea
                id="template_data"
                value={formData.template_data}
                onChange={(e) => setFormData({ ...formData, template_data: e.target.value })}
                placeholder='{"tipoImovel": "Residencial", ...}'
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_default">Template Padrão</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o template "{selectedTemplate?.nome}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTemplates;
