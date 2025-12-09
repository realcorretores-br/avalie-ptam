import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConfirmacaoCadastroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Record<string, any>;
  estrangeiro: boolean;
  tipoAvaliador: string;
  onConfirm: () => void;
  loading: boolean;
}

export const ConfirmacaoCadastro = ({
  open,
  onOpenChange,
  formData,
  estrangeiro,
  tipoAvaliador,
  onConfirm,
  loading,
}: ConfirmacaoCadastroProps) => {
  const getTipoAvaliadorLabel = () => {
    switch (tipoAvaliador) {
      case 'corretor': return 'Corretor';
      case 'arquiteto': return 'Arquiteto';
      case 'engenheiro': return 'Engenheiro';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Confirme seus dados</DialogTitle>
          <DialogDescription>
            Revise suas informações antes de finalizar o cadastro. Após o cadastro, alguns dados não poderão ser alterados.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Dados Pessoais</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Nome Completo:</span>
                  <span className="font-medium">{formData.nomeCompleto}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{formData.telefone}</span>
                </div>
                {!estrangeiro ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">CPF:</span>
                      <span className="font-medium">{formData.cpf}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">RG:</span>
                      <span className="font-medium">{formData.rg}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Passaporte:</span>
                      <span className="font-medium">{formData.passaporte}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">País de Origem:</span>
                      <span className="font-medium">{formData.paisOrigem}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Endereço</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">CEP:</span>
                  <span className="font-medium">{formData.cep}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium">{formData.endereco}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Número:</span>
                  <span className="font-medium">{formData.numero || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Complemento:</span>
                  <span className="font-medium">{formData.complemento || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Bairro:</span>
                  <span className="font-medium">{formData.bairro}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Cidade:</span>
                  <span className="font-medium">{formData.cidade}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">{formData.estado}</span>
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Dados Profissionais</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Tipo de Avaliador:</span>
                  <span className="font-medium">{getTipoAvaliadorLabel()}</span>
                </div>
                {tipoAvaliador === 'corretor' && formData.creci && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">CRECI:</span>
                    <span className="font-medium">{formData.creci}</span>
                  </div>
                )}
                {tipoAvaliador === 'arquiteto' && formData.cau && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">CAU:</span>
                    <span className="font-medium">{formData.cau}</span>
                  </div>
                )}
                {tipoAvaliador === 'engenheiro' && formData.crea && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">CREA:</span>
                    <span className="font-medium">{formData.crea}</span>
                  </div>
                )}
                {formData.cnpj && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">CNPJ:</span>
                    <span className="font-medium">{formData.cnpj}</span>
                  </div>
                )}
                {formData.cnae && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">CNAE:</span>
                    <span className="font-medium">{formData.cnae}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Voltar para Edição
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Confirmar e Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};