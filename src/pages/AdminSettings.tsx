<<<<<<< HEAD
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
=======
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                .upsert({
                    id: 1,
                    enable_profile: localSettings.enable_profile,
                    enable_subscription: localSettings.enable_subscription,
                    enable_payment_history: localSettings.enable_payment_history,
                    enable_notes: localSettings.enable_notes,
                    site_logo: localSettings.site_logo,
                    site_favicon: localSettings.site_favicon
                });
<<<<<<< HEAD

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
                            <CardTitle>Aparência do Sistema</CardTitle>
                            <CardDescription>
                                Personalize a identidade visual do sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="site_logo">Logotipo do Sistema</Label>
                                <div className="flex items-center gap-4">
                                    {localSettings.site_logo && (
                                        <div className="bg-muted p-2 rounded-lg border">
                                            <img
                                                src={localSettings.site_logo}
                                                alt="Logo Preview"
                                                className="h-12 w-auto object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input
                                            id="site_logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const toastId = toast.loading('Enviando logo...');
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `site-logo-${Date.now()}.${fileExt}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('site-assets')
                                                        .upload(fileName, file, { upsert: true });

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('site-assets')
                                                        .getPublicUrl(fileName);

                                                    setLocalSettings(prev => ({ ...prev, site_logo: publicUrl }));
                                                    toast.success('Logo enviado com sucesso!', { id: toastId });
                                                } catch (error: any) {
                                                    console.error(error);
                                                    toast.error('Erro ao enviar logo', { id: toastId });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recomendado: Imagem PNG ou SVG com fundo transparente. Altura máxima de 40px.
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="site_favicon">Favicon do Sistema</Label>
                                <div className="flex items-center gap-4">
                                    {localSettings.site_favicon && (
                                        <div className="bg-muted p-2 rounded-lg border w-12 h-12 flex items-center justify-center">
                                            <img
                                                src={localSettings.site_favicon}
                                                alt="Favicon Preview"
                                                className="h-8 w-8 object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input
                                            id="site_favicon"
                                            type="file"
                                            accept="image/png,image/x-icon,image/svg+xml"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const toastId = toast.loading('Enviando favicon...');
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `site-favicon-${Date.now()}.${fileExt}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('site-assets')
                                                        .upload(fileName, file, { upsert: true });

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('site-assets')
                                                        .getPublicUrl(fileName);

                                                    setLocalSettings(prev => ({ ...prev, site_favicon: publicUrl }));
                                                    toast.success('Favicon enviado com sucesso!', { id: toastId });
                                                } catch (error: any) {
                                                    console.error(error);
                                                    toast.error('Erro ao enviar favicon', { id: toastId });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recomendado: .ico, .png ou .svg (32x32px).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

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
=======

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
                            <CardTitle>Aparência do Sistema</CardTitle>
                            <CardDescription>
                                Personalize a identidade visual do sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="site_logo">Logotipo do Sistema</Label>
                                <div className="flex items-center gap-4">
                                    {localSettings.site_logo && (
                                        <div className="bg-muted p-2 rounded-lg border">
                                            <img
                                                src={localSettings.site_logo}
                                                alt="Logo Preview"
                                                className="h-12 w-auto object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input
                                            id="site_logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const toastId = toast.loading('Enviando logo...');
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `site-logo-${Date.now()}.${fileExt}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('site-assets')
                                                        .upload(fileName, file, { upsert: true });

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('site-assets')
                                                        .getPublicUrl(fileName);

                                                    setLocalSettings(prev => ({ ...prev, site_logo: publicUrl }));
                                                    toast.success('Logo enviado com sucesso!', { id: toastId });
                                                } catch (error: any) {
                                                    console.error(error);
                                                    toast.error('Erro ao enviar logo', { id: toastId });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recomendado: Imagem PNG ou SVG com fundo transparente. Altura máxima de 40px.
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="site_favicon">Favicon do Sistema</Label>
                                <div className="flex items-center gap-4">
                                    {localSettings.site_favicon && (
                                        <div className="bg-muted p-2 rounded-lg border w-12 h-12 flex items-center justify-center">
                                            <img
                                                src={localSettings.site_favicon}
                                                alt="Favicon Preview"
                                                className="h-8 w-8 object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input
                                            id="site_favicon"
                                            type="file"
                                            accept="image/png,image/x-icon,image/svg+xml"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const toastId = toast.loading('Enviando favicon...');
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `site-favicon-${Date.now()}.${fileExt}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('site-assets')
                                                        .upload(fileName, file, { upsert: true });

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('site-assets')
                                                        .getPublicUrl(fileName);

                                                    setLocalSettings(prev => ({ ...prev, site_favicon: publicUrl }));
                                                    toast.success('Favicon enviado com sucesso!', { id: toastId });
                                                } catch (error: any) {
                                                    console.error(error);
                                                    toast.error('Erro ao enviar favicon', { id: toastId });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recomendado: .ico, .png ou .svg (32x32px).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

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
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
