import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export function MetricsFilters() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Filtros Ativos
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-500">Período</label>
                        <Select defaultValue="30d">
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                                <SelectItem value="1y">Este ano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-500">Avaliador</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione o avaliador" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos Avaliadores</SelectItem>
                                <SelectItem value="current">Apenas Eu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-500">Tipo de Imóvel</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Todos os tipos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                <SelectItem value="residencial">Residencial</SelectItem>
                                <SelectItem value="comercial">Comercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="rural">Rural</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Button variant="ghost" className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                Limpar Filtros
            </Button>
        </div>
    );
}
