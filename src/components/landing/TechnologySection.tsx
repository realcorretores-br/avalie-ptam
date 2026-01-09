import { useNavigate } from "react-router-dom";
import { LandingContent, LandingItem } from "@/pages/Landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TechnologySectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const TechnologySection = ({ content, items }: TechnologySectionProps) => {
    const navigate = useNavigate();
    // Default content matching the reference if not provided
    const title = content?.title || "Tecnologia que Trabalha por Você";
    const description = content?.description || "Automatize cálculos, gere relatórios e aplique metodologias oficiais sem perder tempo com planilhas complexas e manuais.";
    const imageUrl = content?.image_url || "https://placehold.co/600x400/f8fafc/64748b?text=Dashboard+Preview";

    const defaultFeatures = [
        {
            id: "01",
            title: "Cálculos conforme ABNT NBR 14653",
            description: "Total conformidade com as normas brasileiras."
        },
        {
            id: "02",
            title: "Integração com CUB atualizado",
            description: "Dados sempre em dia com os sindicatos estaduais."
        },
        {
            id: "03",
            title: "Análises automáticas",
            description: "Liquidação forçada, taxas e depreciação calculadas instantaneamente."
        }
    ];

    const displayFeatures = items && items.length > 0 ? items.map((item, index) => ({
        id: String(index + 1).padStart(2, '0'),
        title: item.title || "",
        description: item.description || ""
    })) : defaultFeatures;

    return (
        <section className="py-12 bg-background overflow-hidden" id="technology">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary rounded-full">
                                Tecnologia
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl leading-tight text-foreground">
                                {title}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-[600px]">
                                {description}
                            </p>
                        </div>

                        <div className="space-y-8">
                            {displayFeatures.map((feature, index) => (
                                <div key={index} className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {feature.id}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-foreground mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Button
                                className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                                onClick={() => navigate('/cadastro')}
                            >
                                Começar Agora
                            </Button>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-3xl" />
                        <div className="relative rounded-[2rem] overflow-hidden border border-border bg-card shadow-2xl p-2">
                            <div className="rounded-[1.5rem] overflow-hidden bg-muted/50">
                                <img
                                    src={imageUrl}
                                    alt="Tecnologia Dashboard"
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/600x400/f8fafc/64748b?text=Dashboard+Preview";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
