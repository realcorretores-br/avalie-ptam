import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    FileText,
    LayoutTemplate,
    AlertTriangle,
    Settings,
    Database,
    ShoppingBag,
    Activity
} from "lucide-react";

export default function Admin() {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: "CMS / Planos",
            description: "Gerenciar planos, preços e conteúdo da landing page",
            icon: <ShoppingBag className="h-8 w-8 text-blue-500" />,
            path: "/dashboard/admin/cms",
        },
        {
            title: "Gateways de Pagamento",
            description: "Configurar chaves de API e métodos de pagamento",
            icon: <CreditCard className="h-8 w-8 text-green-500" />,
            path: "/dashboard/admin/gateways",
        },
        {
            title: "Templates de Avaliação",
            description: "Editar modelos e textos padrão para laudos",
            icon: <LayoutTemplate className="h-8 w-8 text-purple-500" />,
            path: "/dashboard/admin/templates",
        },
        {
            title: "Conteúdo do Site",
            description: "Gerenciar textos e imagens do site institucional",
            icon: <FileText className="h-8 w-8 text-orange-500" />,
            path: "/dashboard/conteudo",
        },
        {
            title: "Configurações Globais",
            description: "Ativar/desativar módulos e recursos do sistema",
            icon: <Settings className="h-8 w-8 text-slate-500" />,
            path: "/dashboard/admin/settings",
        },
        {
            title: "Logs do Sistema",
            description: "Visualizar histórico de ações administrativas",
            icon: <Database className="h-8 w-8 text-indigo-500" />,
            path: "/dashboard/admin/logs",
        },
        {
            title: "Erros Reportados",
            description: "Acompanhar bugs reportados pelos usuários",
            icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
            path: "/dashboard/admin/erros",
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                    <p className="text-muted-foreground mt-2">
                        Bem-vindo ao centro de controle da plataforma. Selecione um módulo abaixo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Card
                            key={item.path}
                            className="hover:shadow-md transition-shadow cursor-pointer border-slate-200"
                            onClick={() => navigate(item.path)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-semibold">
                                    {item.title}
                                </CardTitle>
                                {item.icon}
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm mt-2">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
