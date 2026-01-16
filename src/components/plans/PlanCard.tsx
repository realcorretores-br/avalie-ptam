import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
    title: string;
    price: string; // Formatted price string e.g. "99"
    period: string; // e.g. "/mês" or "/unidade"
    description?: string; // e.g. "/mês" or "/unidade"
    features: string[];
    buttonText: string;
    highlighted?: boolean;
    recommended?: boolean;
    loading?: boolean;
    onClick: () => void;
}

export function PlanCard({
    title,
    price,
    period,
    description,
    features,
    buttonText,
    highlighted = false,
    recommended = false,
    loading = false,
    onClick
}: PlanCardProps) {
    return (
        <div className={cn(
            "relative p-8 rounded-2xl bg-white border transition-all duration-300 flex flex-col h-full",
            highlighted
                ? "border-blue-600 shadow-xl scale-105 z-10"
                : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
        )}>
            {recommended && (
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                    {/* Badge style from reference could be added here if needed, 
                       but standard design usually puts it top right or centered top */}
                    <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 shadow-sm uppercase tracking-wider">
                        Popular
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-500">R$</span>
                    <span className={cn("text-4xl font-extrabold tracking-tight", highlighted ? "text-blue-600" : "text-gray-900")}>
                        {price}
                    </span>
                    <span className="text-sm text-gray-500">{period}</span>
                </div>
                {description && (
                    <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{description}</p>
                )}
            </div>

            <Button
                className={cn(
                    "w-full mb-8 font-semibold h-12 rounded-lg text-base transition-colors",
                    highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={onClick}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
            </Button>

            <div className="space-y-4 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
