import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Settings } from "lucide-react";

const AdminSettings = () => {
    const { settings, loading, refetch } = useSystemSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (key: keyof typeof localSettings) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('system_settings' as any)
                .upsert({
                    id: 1,
                    enable_profile: localSettings.enable_profile,
                    enable_subscription: localSettings.enable_subscription,
                    enable_payment_history: localSettings.enable_payment_history,
                    enable_notes: localSettings.enable_notes
                });

            if (error) throw error;

            toast.success('Configurações salvas com sucesso!');
            refetch();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-8 w-8" />
                            Configurações Globais
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie a visibilidade de módulos do sistema.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Módulos do Perfil do Usuário</CardTitle>
                            <CardDescription>
                                Desative módulos para escondê-los do menu lateral e da página de perfil de todos os usuários.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="enable_profile" className="flex flex-col space-y-1">
                                    <span>Perfil (Dados Pessoais)</span>
                                    <span className="font-normal text-xs text-muted-foreground">Aba de dados pessoais e formulário de perfil.</span>
                                </Label>
                                <Switch
                                    id="enable_profile"
                                    checked={localSettings.enable_profile}
                                    onCheckedChange={() => handleToggle('enable_profile')}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="enable_subscription" className="flex flex-col space-y-1">
                                    <span>Assinatura (Planos)</span>
                                    <span className="font-normal text-xs text-muted-foreground">Gestão de assinatura e troca de planos.</span>
                                </Label>
                                <Switch
                                    id="enable_subscription"
                                    checked={localSettings.enable_subscription}
                                    onCheckedChange={() => handleToggle('enable_subscription')}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="enable_payment_history" className="flex flex-col space-y-1">
                                    <span>Histórico de Pagamento</span>
                                    <span className="font-normal text-xs text-muted-foreground">Lista de faturas e comprovantes.</span>
                                </Label>
                                <Switch
                                    id="enable_payment_history"
                                    checked={localSettings.enable_payment_history}
                                    onCheckedChange={() => handleToggle('enable_payment_history')}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="enable_notes" className="flex flex-col space-y-1">
                                    <span>Anotações</span>
                                    <span className="font-normal text-xs text-muted-foreground">Bloco de notas pessoal do usuário.</span>
                                </Label>
                                <Switch
                                    id="enable_notes"
                                    checked={localSettings.enable_notes}
                                    onCheckedChange={() => handleToggle('enable_notes')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
