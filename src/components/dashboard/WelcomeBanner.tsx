import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { Plus, FileText } from "lucide-react";

export function WelcomeBanner() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { subscription } = useSubscription();
    const { isAdmin } = useRole();

    // Calculate available credits
    const getCredits = () => {
        if (isAdmin) return "∞";

        // Check expiration
        if (subscription?.data_expiracao && new Date(subscription.data_expiracao) < new Date()) {
            return 0;
        }

        const planCredits = (subscription?.relatorios_disponiveis || 0) - (subscription?.relatorios_usados || 0);
        const extraCredits = subscription?.creditos_extra || 0;
        return Math.max(0, planCredits) + extraCredits;
    };

    const getPercentage = () => {
        if (isAdmin) return 100;
        const total = subscription?.relatorios_disponiveis || 1;
        const current = typeof getCredits() === 'number' ? getCredits() as number : total;
        return Math.min(100, Math.max(0, (current / total) * 100)); // Inverted logic: full circle = full credits
    };

    const credits = getCredits();
    const totalPlanCredits = subscription?.relatorios_disponiveis || 0;
    const percentage = getPercentage();
    const strokeDasharray = 250;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
        <Card className="relative overflow-hidden bg-[#1A1F2C] text-white border-none p-8 rounded-xl shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Content */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Bem-vindo ao Avalie PTAM, {profile?.nome_completo?.split(' ')[0] || "Usuário"}.
                        </h1>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                            Sua plataforma integrada para criação de laudos técnicos profissionais em conformidade com as normas NBR. O que vamos avaliar hoje?
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="bg-transparent border-gray-600 text-white hover:bg-white/10 hover:text-white gap-2 transition-all px-6 py-5 text-base"
                        onClick={() => navigate('/dashboard/nova-avaliacao')}
                    >
                        <Plus className="w-5 h-5" />
                        Nova Avaliação
                    </Button>
                </div>

                {/* Right Content - Credits Card */}
                <div className="flex justify-end relative">

                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 w-full max-w-[320px] relative overflow-hidden min-h-[160px] flex flex-col justify-center">

                        {/* Background Icon */}
                        <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] pointer-events-none transform rotate-12">
                            <FileText className="w-40 h-40 text-white" />
                        </div>

                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 pl-2">
                            Créditos Disponíveis
                        </h3>

                        <div className="flex items-center gap-6 pl-2">

                            {/* Circle Indicator */}
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    {/* Track */}
                                    <circle
                                        className="text-gray-700"
                                        strokeWidth="6"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="36"
                                        cx="40"
                                        cy="40"
                                    />
                                    {/* Progress */}
                                    <circle
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeWidth="6"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="36"
                                        cx="40"
                                        cy="40"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {credits}
                                    </span>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm text-gray-400">Total do plano <span className="text-gray-300 font-medium ml-1">{typeof credits === 'string' ? "∞" : totalPlanCredits}</span></span>

                                <button
                                    onClick={() => navigate('/dashboard/planos')}
                                    className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase tracking-wider text-left transition-colors pt-1"
                                >
                                    Recarregar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
