import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTemplates } from "@/hooks/useTemplates";
import { FileText, Loader2, Home, Building2, TreePine } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateData: any) => void;
}

const getIconForType = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'residencial':
      return <Home className="h-8 w-8 text-primary" />;
    case 'comercial':
      return <Building2 className="h-8 w-8 text-primary" />;
    case 'rural':
      return <TreePine className="h-8 w-8 text-primary" />;
    default:
      return <FileText className="h-8 w-8 text-primary" />;
  }
};

export const TemplateSelector = ({ open, onOpenChange, onSelectTemplate }: TemplateSelectorProps) => {
  const { templates, loading } = useTemplates();

  const handleSelectTemplate = (templateData: any) => {
    onSelectTemplate(templateData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Escolher Template de Avaliação</DialogTitle>
          <DialogDescription>
            Selecione um template pré-configurado para começar sua avaliação mais rapidamente
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum template disponível</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleSelectTemplate(template.template_data)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getIconForType(template.tipo_imovel)}
                    {template.is_default && (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
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

                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template.template_data);
                    }}
                  >
                    Usar Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              onSelectTemplate({});
              onOpenChange(false);
            }}
          >
            Começar do Zero
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
