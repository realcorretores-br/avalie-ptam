<<<<<<< HEAD
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminLog {
    id: string;
    created_at: string;
    user_id: string;
    action: string;
    details: Record<string, unknown>;
    ip_address: string | null;
    profiles?: {
        email: string;
        full_name: string;
    };
}

const AdminLogs = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("admin_logs")
                .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;

            setLogs(data as unknown as AdminLog[]);
        } catch (error) {
            console.error("Error fetching admin logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                    Últimos 50 registros
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Ações</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum registro encontrado.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data/Hora</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Ação</TableHead>
                                        <TableHead>Detalhes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                                                    locale: ptBR,
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {log.profiles?.full_name || "N/A"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.profiles?.email || log.user_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {log.details ? JSON.stringify(log.details) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogs;
=======
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminLog {
    id: string;
    created_at: string;
    user_id: string;
    action: string;
    details: Record<string, unknown>;
    ip_address: string | null;
    profiles?: {
        email: string;
        full_name: string;
    };
}

const AdminLogs = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("admin_logs")
                .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;

            setLogs(data as unknown as AdminLog[]);
        } catch (error) {
            console.error("Error fetching admin logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                    Últimos 50 registros
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Ações</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum registro encontrado.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data/Hora</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Ação</TableHead>
                                        <TableHead>Detalhes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                                                    locale: ptBR,
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {log.profiles?.full_name || "N/A"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.profiles?.email || log.user_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {log.details ? JSON.stringify(log.details) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogs;
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
