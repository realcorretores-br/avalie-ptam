import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Folder, TrendingUp, Video, AlertCircle } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function QuickActions() {
    const navigate = useNavigate();
    const { settings } = useSystemSettings();

    const actions = [
        {
            title: "Avaliações Salvas",
            icon: Folder,
            path: "/dashboard/avaliacoes",
            color: "bg-blue-50 text-blue-600",
            show: true
        },
        {
            title: "Métricas",
            icon: TrendingUp,
            path: "/dashboard/metricas",
            color: "bg-green-50 text-green-600",
            show: settings.enable_metrics
        },
        {
            title: "Vídeos Tutoriais",
            icon: Video,
            path: "/dashboard/tutoriais",
            color: "bg-purple-50 text-purple-600",
            show: true
        },
        {
            title: "Reportar Erro",
            icon: AlertCircle,
            path: "/dashboard/reportar-erro",
            color: "bg-red-50 text-red-600",
            show: true
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.filter(a => a.show).map((action, index) => (
                <Card
                    key={index}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 text-center border-none shadow-sm"
                    onClick={() => navigate(action.path)}
                >
                    <div className={`p-3 rounded-full ${action.color}`}>
                        <action.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{action.title}</span>
                </Card>
            ))}
        </div>
    );
}
