import { LandingContent, LandingItem } from "@/pages/Landing";
import { Check, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactFormModal } from "./ContactFormModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PricingSectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const PricingSection = ({ content }: PricingSectionProps) => {
    const navigate = useNavigate();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const plans = [
        {
            id: "go",
            title: "PTAM Go",
            description: "Para profissionais com frequência moderada.",
            price: "R$ 69,95",
            period: "/mês",
            features: [
                "5 relatórios mensais",
                "Anotações e Logotipo",
                "Personalização de cor",
                "Métricas básicas",
                "Tutoriais em vídeo",
                "Exportação A4"
            ],
            // White card with light purple border
            cardStyle: "bg-white border-2 border-[#e0e7ff] text-slate-900",
            titleStyle: "text-[#1e1b4b]",
            priceStyle: "text-[#1e1b4b]",
            descriptionStyle: "text-slate-500",
            buttonStyle: "w-full rounded-full border-2 border-[#e0e7ff] bg-white text-[#1e1b4b] hover:bg-slate-50 font-bold py-6",
            featureIconStyle: "bg-[#1e1b4b] text-white",
            featureTextStyle: "text-slate-600",
            action: () => navigate('/cadastro')
        },
        {
            id: "pro",
            title: "PTAM Pro",
            description: "Para avaliadores ativos.",
            price: "R$ 289,95",
            period: "/mês",
            features: [
                "25 relatórios mensais",
                "15 laudos salvos",
                "Upload de fotos mobile",
                "Edição avançada",
                "Personalização visual completa",
                "Suporte prioritário",
                "Métricas detalhadas"
            ],
            // Purple card
            cardStyle: "bg-[#7c3aed] border-2 border-[#7c3aed] text-white shadow-2xl scale-105 z-10 relative mt-0",
            titleStyle: "text-white",
            priceStyle: "text-white",
            descriptionStyle: "text-white/80",
            buttonStyle: "w-full rounded-full bg-white text-[#7c3aed] hover:bg-white/90 font-bold py-6",
            featureIconStyle: "bg-white text-[#7c3aed]",
            featureTextStyle: "text-white",
            highlight: "RECOMENDADO",
            action: () => navigate('/cadastro')
        },
        {
            id: "empresa",
            title: "PTAM Empresa",
            description: "Solução definitiva para empresas.",
            price: "Sob Consulta",
            period: "",
            features: [
                "Relatórios ilimitados",
                "Salvamento ilimitado",
                "Branding completo",
                "Personalização total",
                "Tutoriais exclusivos",
                "Suporte dedicado",
                "Exportação PDF/DOC"
            ],
            // Blue card
            cardStyle: "bg-[#3b82f6] border-2 border-[#3b82f6] text-white",
            titleStyle: "text-white",
            priceStyle: "text-white",
            descriptionStyle: "text-white/80",
            buttonStyle: "w-full rounded-full bg-white text-[#3b82f6] hover:bg-white/90 font-bold py-6",
            featureIconStyle: "bg-white text-[#3b82f6]",
            featureTextStyle: "text-white",
            action: () => setIsContactModalOpen(true)
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        {content?.title || "Planos e Preços"}
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        {content?.subtitle || "Escolha o plano ideal para suas necessidades."}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 items-start pt-8">
                    {plans.map((plan) => (
                        <div key={plan.id} className="flex flex-col w-full md:w-[350px] relative">
                            {/* Wrapper for the card to handle borders and rounding perfectly */}
                            <div
                                className={`
                                    flex flex-col w-full rounded-3xl transition-all duration-300 relative overflow-hidden
                                    ${plan.highlight ? 'shadow-2xl scale-105 z-10' : ''}
                                    ${plan.id === 'go' ? 'bg-white border-2 border-[#e0e7ff]' : ''}
                                    ${plan.id === 'pro' ? 'bg-[#7c3aed] border-2 border-[#7c3aed]' : ''}
                                    ${plan.id === 'empresa' ? 'bg-[#3b82f6] border-2 border-[#3b82f6]' : ''}
                                `}
                            >
                                {/* Recommendation Banner for Pro - Inside the wrapper but at the top */}
                                {plan.highlight && (
                                    <div className="bg-[#7c3aed] text-white text-center py-2 font-bold text-sm tracking-wider flex items-center justify-center gap-2 border-b border-white/10">
                                        <ThumbsUp className="h-4 w-4" />
                                        {plan.highlight}
                                    </div>
                                )}

                                <div className="p-8 flex flex-col h-full">
                                    <div className="space-y-4 mb-8">
                                        <h3 className={`text-2xl font-bold ${plan.titleStyle}`}>
                                            {plan.title}
                                        </h3>
                                        <p className={`text-sm font-medium ${plan.descriptionStyle} min-h-[40px]`}>
                                            {plan.description}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-5xl font-bold ${plan.priceStyle}`}>
                                                {plan.price}
                                            </span>
                                            {plan.period && (
                                                <span className={`text-sm font-medium opacity-80 ${plan.priceStyle}`}>
                                                    {plan.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <Button
                                            className={plan.buttonStyle}
                                            onClick={plan.action}
                                        >
                                            {plan.id === 'empresa' ? 'Falar com Especialista' : 'Selecionar Plano'}
                                        </Button>
                                    </div>

                                    <div className="space-y-4 mt-auto">

                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <div className={`mt-0.5 rounded-[4px] p-0.5 ${plan.featureIconStyle}`}>
                                                        <Check className="h-3 w-3" strokeWidth={4} />
                                                    </div>
                                                    <span className={`font-medium ${plan.featureTextStyle}`}>
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ContactFormModal
                open={isContactModalOpen}
                onOpenChange={setIsContactModalOpen}
            />
        </section>
    );
};
