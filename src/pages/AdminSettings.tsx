import { useEffect, useState } from "react";
import { useSystemSettings, SystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export default function AdminSettings() {
    const { settings, loading, refetch } = useSystemSettings();
    const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleToggle = (key: keyof SystemSettings) => {
        if (!localSettings) return;
        setLocalSettings(prev => prev ? { ...prev, [key]: !prev[key] } : null);
    };

    const handleSave = async () => {
        if (!localSettings) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('system_settings' as any)
                .update({
                    enable_profile: localSettings.enable_profile,
                    enable_subscription: localSettings.enable_subscription,
                    enable_payment_history: localSettings.enable_payment_history,
                    enable_notes: localSettings.enable_notes,
                    enable_metrics: localSettings.enable_metrics,
                    // keep other fields if any
                })
                .eq('id', 1);

            if (error) throw error;
            toast.success("Configurações atualizadas com sucesso!");
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar configurações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !localSettings) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Configurações Globais</h1>
                <p className="text-muted-foreground">Gerencie as funcionalidades visíveis para os usuários.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Módulos do Perfil do Usuário</CardTitle>
                    <CardDescription>
                        Desative módulos para escondê-los do menu lateral e da página de perfil de todos os usuários.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Perfil (Dados Pessoais)</Label>
                            <p className="text-sm text-muted-foreground">Aba de dados pessoais e formulário de perfil.</p>
                        </div>
                        <Switch
                            checked={localSettings.enable_profile}
                            onCheckedChange={() => handleToggle('enable_profile')}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Assinatura (Planos)</Label>
                            <p className="text-sm text-muted-foreground">Gestão de assinatura e troca de planos.</p>
                        </div>
                        <Switch
                            checked={localSettings.enable_subscription}
                            onCheckedChange={() => handleToggle('enable_subscription')}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Histórico de Pagamento</Label>
                            <p className="text-sm text-muted-foreground">Lista de faturas e comprovantes.</p>
                        </div>
                        <Switch
                            checked={localSettings.enable_payment_history}
                            onCheckedChange={() => handleToggle('enable_payment_history')}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Anotações</Label>
                            <p className="text-sm text-muted-foreground">Bloco de notas pessoal do usuário.</p>
                        </div>
                        <Switch
                            checked={localSettings.enable_notes}
                            onCheckedChange={() => handleToggle('enable_notes')}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                            <Label className="text-blue-600">Métricas de Desempenho (Dashboard)</Label>
                            <p className="text-sm text-muted-foreground">Visualização da página de Métricas com gráficos e KPIs.</p>
                        </div>
                        <Switch
                            checked={localSettings.enable_metrics}
                            onCheckedChange={() => handleToggle('enable_metrics')}
                        />
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    Salvar Alterações
                </Button>
            </div>
        </div>
    );
}
