import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { Plus, FileText, Gift, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function WelcomeBanner() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { subscription, loading } = useSubscription();
    const { isAdmin } = useRole();
    const [claiming, setClaiming] = useState(false);

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

    const handleClaimBonus = async () => {
        setClaiming(true);
        try {
            const { error } = await supabase.rpc('claim_bonus');
            if (error) throw error;
            toast.success("Crédito bônus resgatado com sucesso!");
            window.location.reload(); // Simple reload to refresh everything
        } catch (error) {
            console.error(error);
            toast.error("Erro ao resgatar bônus.");
        } finally {
            setClaiming(false);
        }
    };

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

                {/* Right Content */}
                <div className="flex justify-end relative">

                    {!loading && !subscription ? (
                        // BONUS CLAIM CARD
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 w-full max-w-[320px] relative overflow-hidden min-h-[160px] flex flex-col justify-center">
                            <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none transform rotate-12">
                                <Gift className="w-40 h-40 text-yellow-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gift className="text-yellow-400 w-5 h-5" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-400">
                                        Presente de Boas-vindas
                                    </h3>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    1 Crédito Grátis
                                </h2>
                                <p className="text-sm text-gray-300 mb-4 leading-snug">
                                    Resgate seu bônus para ativar sua conta e testar a plataforma agora mesmo.
                                </p>
                                <Button
                                    onClick={handleClaimBonus}
                                    disabled={claiming}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-none"
                                >
                                    {claiming ? "Resgatando..." : "Resgatar Agora"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // EXISTING CREDITS CARD
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
                    )}
                </div>
            </div>
        </Card>
    );
}
