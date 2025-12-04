import { LandingContent, LandingItem } from "@/pages/Landing";
import { FileText, Calculator, TrendingUp, Cloud, Users, FileCheck } from "lucide-react";

interface BenefitsSectionProps {
    content?: LandingContent;
    ctaContent?: LandingContent;
    items?: LandingItem[];
}

export const BenefitsSection = ({ content, ctaContent, items }: BenefitsSectionProps) => {
    const benefits = [
        {
            icon: <FileCheck className="h-6 w-6 text-primary" />,
            title: "Laudos conforme normas",
            description: "Totalmente alinhado à ABNT NBR 14653"
        },
        {
            icon: <FileText className="h-6 w-6 text-primary" />,
            title: "Relatórios em PDF",
            description: "Layout profissional pronto para impressão"
        },
        {
            icon: <Calculator className="h-6 w-6 text-primary" />,
            title: "3 Métodos Oficiais",
            description: "Comparativo, Evolutivo e Renda"
        },
        {
            icon: <TrendingUp className="h-6 w-6 text-primary" />,
            title: "Cálculos Automatizados",
            description: "Sem erros manuais e planilhas"
        },
        {
            icon: <Cloud className="h-6 w-6 text-primary" />,
            title: "Nuvem Segura",
            description: "Seus dados protegidos e acessíveis"
        },
        {
            icon: <Users className="h-6 w-6 text-primary" />,
            title: "Suporte Especializado",
            description: "Equipe pronta para ajudar"
        }
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        {content?.title || "Benefícios e Diferenciais"}
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground text-xl">
                        {content?.subtitle || "Por que escolher o PTAM?"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(items && items.length > 0 ? items : benefits).map((item: any, index) => (
                        <div key={item.id || index} className="flex gap-4 p-6 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 items-start">
                            <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                                {typeof item.icon === 'string' && item.icon.includes('fa-') ? (
                                    <i className={`${item.icon} text-xl text-primary`} />
                                ) : (
                                    item.icon // Render ReactNode or fallback
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New CTA Block */}
                <div className="mt-20 rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#3b82f6] overflow-hidden text-white shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="p-12 w-full md:w-1/2 space-y-8">
                            {/* Social Proof Avatars */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-white/20 overflow-hidden">
                                            <img
                                                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                                alt="User"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                    <div className="h-10 w-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-primary font-bold text-xs">
                                        2K+
                                    </div>
                                </div>
                                <span className="text-white/80 text-sm font-medium">Avaliadores confiam</span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                                    {ctaContent?.title || "Pronto para elevar o nível das suas avaliações?"}
                                </h3>
                                <p className="text-white/80 text-lg leading-relaxed max-w-md">
                                    {ctaContent?.description || "Simplifique seu processo, elimine erros e entregue laudos profissionais em tempo recorde."}
                                </p>
                            </div>

                            <button
                                onClick={() => window.location.href = '/cadastro'}
                                className="bg-white text-primary hover:bg-white/90 font-bold py-4 px-8 rounded-full shadow-lg transition-all hover:scale-105"
                            >
                                {ctaContent?.subtitle || "Começar Teste Grátis"}
                            </button>
                        </div>

                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px] flex items-end justify-center md:justify-end overflow-hidden">
                            {/* Monitor Image Container */}
                            <div className="relative w-[90%] md:w-[120%] h-[90%] md:h-[90%] bg-white/10 rounded-tl-3xl border-t-8 border-l-8 border-white/20 shadow-2xl md:-mr-20 md:-mb-10 backdrop-blur-sm overflow-hidden">
                                {/* Placeholder for the user's monitor image */}
                                <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-xl">
                                    {/* Replace src with your monitor image */}
                                    <img
                                        src={content?.image_url || ctaContent?.image_url || "/dashboard-preview.png"}
                                        alt="Dashboard Preview"
                                        className="w-full h-full object-cover object-left-top"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
