import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Upload, X } from "lucide-react";
import { PrintSettings } from "@/types/print";
import { compressImage } from "@/lib/exportUtils"; // We will add this utility
import { toast } from "sonner";

interface PrintSettingsDialogProps {
    settings: PrintSettings;
    onSettingsChange: (settings: PrintSettings) => void;
}

export const PrintSettingsDialog = ({ settings, onSettingsChange }: PrintSettingsDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'headerLogo' | 'footerLogo') => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) { // 500KB limit
            toast.error("A imagem deve ter no máximo 500KB.");
            return;
        }

        try {
            // Basic read for now, we can add compression if needed but 500kb check helps
            const reader = new FileReader();
            reader.onloadend = () => {
                onSettingsChange({
                    ...settings,
                    [field]: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Erro ao carregar imagem", error);
            toast.error("Erro ao carregar a imagem.");
        }
    };

    const removeImage = (field: 'headerLogo' | 'footerLogo') => {
        onSettingsChange({
            ...settings,
            [field]: undefined
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 print:hidden">
                    <Settings className="h-4 w-4" />
                    Configurar Impressão
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configurações de Impressão e PDF</DialogTitle>
                    <DialogDescription>
                        Personalize o cabeçalho e rodapé que aparecerão em todas as páginas do documento impresso ou PDF.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Cabeçalho */}
                    <div className="space-y-4 border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg flex items-center gap-2">Cabeçalho</h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="show-header"
                                    checked={settings.showHeader}
                                    onCheckedChange={(c) => onSettingsChange({ ...settings, showHeader: c })}
                                />
                                <Label htmlFor="show-header">Ativar</Label>
                            </div>
                        </div>

                        {settings.showHeader && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto Esquerdo</Label>
                                        <Input
                                            value={settings.headerLeftText}
                                            onChange={(e) => onSettingsChange({ ...settings, headerLeftText: e.target.value })}
                                            placeholder="Ex: Nome da Empresa"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto Direito</Label>
                                        <Input
                                            value={settings.headerRightText}
                                            onChange={(e) => onSettingsChange({ ...settings, headerRightText: e.target.value })}
                                            placeholder="Ex: Site ou Telefone"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Logotipo do Cabeçalho</Label>
                                    <div className="flex items-center gap-4">
                                        {settings.headerLogo ? (
                                            <div className="relative group border rounded p-1">
                                                <img src={settings.headerLogo} alt="Logo Header" className="h-12 w-auto object-contain" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={() => removeImage('headerLogo')}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <Input
                                                    id="header-logo"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'headerLogo')}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">Máx. 500KB. Recomendado: PNG transparente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Rodapé */}
                    <div className="space-y-4 border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg flex items-center gap-2">Rodapé</h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="show-footer"
                                    checked={settings.showFooter}
                                    onCheckedChange={(c) => onSettingsChange({ ...settings, showFooter: c })}
                                />
                                <Label htmlFor="show-footer">Ativar</Label>
                            </div>
                        </div>

                        {settings.showFooter && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto Esquerdo</Label>
                                        <Input
                                            value={settings.footerLeftText}
                                            onChange={(e) => onSettingsChange({ ...settings, footerLeftText: e.target.value })}
                                            placeholder="Ex: Endereço completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto Direito</Label>
                                        <Input
                                            value={settings.footerRightText}
                                            onChange={(e) => onSettingsChange({ ...settings, footerRightText: e.target.value })}
                                            placeholder="Ex: Página {page} de {total}"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Logotipo do Rodapé</Label>
                                    <div className="flex items-center gap-4">
                                        {settings.footerLogo ? (
                                            <div className="relative group border rounded p-1">
                                                <img src={settings.footerLogo} alt="Logo Footer" className="h-12 w-auto object-contain" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={() => removeImage('footerLogo')}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <Input
                                                    id="footer-logo"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'footerLogo')}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">Máx. 500KB. Recomendado: PNG transparente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button onClick={() => setIsOpen(false)}>Concluir</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
