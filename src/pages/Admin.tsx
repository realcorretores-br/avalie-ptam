import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { UserManagement } from "@/components/admin/UserManagement";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";
import { Download, Send, Bell, Users, Activity } from "lucide-react";
import AdminLogs from "./admin/AdminLogs";

export default function Admin() {
    const { isAdmin, loading: roleLoading } = useRole();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
                        <p className="text-slate-500">Visão geral do desempenho e gestão da plataforma.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Button>
                        <Button variant="outline" className="gap-2 bg-white">
                            <Download className="w-4 h-4" />
                            Exportar
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsNotificationOpen(true)}>
                            <Send className="w-4 h-4" />
                            Notificar
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="analytics" className="space-y-6">
                    <div className="bg-slate-100/50 p-1 rounded-lg w-fit">
                        <TabsList className="bg-transparent border-0 h-9 p-0 gap-1">
                            <TabsTrigger
                                value="analytics"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 h-8 text-slate-600 data-[state=active]:text-slate-900"
                            >
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 h-8 text-slate-600 data-[state=active]:text-slate-900"
                            >
                                Usuários
                            </TabsTrigger>
                            <TabsTrigger
                                value="logs"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 h-8 text-slate-600 data-[state=active]:text-slate-900"
                            >
                                Logs
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="analytics" className="m-0 focus-visible:ring-0">
                        <DashboardOverview />
                    </TabsContent>

                    <TabsContent value="users" className="m-0 focus-visible:ring-0">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="logs" className="m-0 focus-visible:ring-0">
                        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <Activity className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Logs do Sistema</h3>
                            <p className="text-slate-500 max-w-sm mt-1">
                                O histórico de atividades administrativas será exibido aqui.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <SendNotificationDialog
                    open={isNotificationOpen}
                    onOpenChange={setIsNotificationOpen}
                />
            </div>
        </AdminLayout>
    );
}

