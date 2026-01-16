import { Card } from "@/components/ui/card";
import { FileText, DollarSign, Clock, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIData {
    total: number;
    ticketMedio: number;
    tempoMedio: number;
    pendentes: number;
    trends: {
        total: number;
        ticket: number;
        tempo: number;
        pendentes: number;
    };
}

export function KPIStats({ data }: { data: KPIData }) {
    const formatTrend = (val: number) => {
        return val === 0 ? "0%" : `${val > 0 ? '+' : ''}${val.toFixed(0)}%`;
    };

    const getTrendIcon = (val: number) => {
        if (val > 0) return <TrendingUp className="h-3 w-3 ml-1" />;
        if (val < 0) return <TrendingDown className="h-3 w-3 ml-1" />;
        return <Minus className="h-3 w-3 ml-1" />;
    };

    const getTrendColor = (val: number, inverse = false) => {
        if (val === 0) return "text-gray-400";
        if (inverse) {
            return val < 0 ? "text-green-600" : "text-red-500";
        }
        return val > 0 ? "text-green-600" : "text-red-500";
    };

    const cards = [
        {
            title: "Total de PTAMs",
            value: data.total,
            icon: FileText,
            trend: data.trends.total,
            color: "text-blue-600",
            bg: "bg-blue-50",
            suffix: ""
        },
        {
            title: "Ticket Médio",
            value: `R$ ${(data.ticketMedio / 1000).toFixed(1)}k`,
            icon: DollarSign,
            trend: data.trends.ticket,
            color: "text-green-600",
            bg: "bg-green-50",
            suffix: ""
        },
        {
            title: "Tempo Médio",
            value: `${data.tempoMedio}`,
            icon: Clock,
            trend: data.trends.tempo,
            inverseTrend: true, // Lower time is better
            color: "text-orange-600",
            bg: "bg-orange-50",
            suffix: " dias"
        },
        {
            title: "Pendentes",
            value: data.pendentes,
            icon: AlertCircle,
            trend: data.trends.pendentes,
            inverseTrend: true, // Fewer pending is usually better/neutral, depends. Let's keep neutral/bad if high.
            color: "text-purple-600",
            bg: "bg-purple-50",
            suffix: ""
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <Card key={index} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <div className={`flex items-center text-xs font-medium ${getTrendColor(card.trend, (card as any).inverseTrend)}`}>
                            {formatTrend(card.trend)}
                            {getTrendIcon(card.trend)}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">
                            {card.value}
                            <span className="text-lg text-gray-500 font-normal ml-1">{card.suffix}</span>
                        </h3>
                    </div>
                </Card>
            ))}
        </div>
    );
}
