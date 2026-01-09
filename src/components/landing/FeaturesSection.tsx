import { LandingContent, LandingItem } from "@/pages/Landing";
import { CheckCircle, BarChart, FileText, TrendingUp, Building2, Calculator, Zap, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeaturesSectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const FeaturesSection = ({ content, items }: FeaturesSectionProps) => {
    const navigate = useNavigate();
    const getIcon = (iconName: string | null) => {
        switch (iconName) {
            case 'BarChart': return <BarChart className="h-10 w-10 text-primary mb-4" />;
            case 'FileText': return <FileText className="h-10 w-10 text-primary mb-4" />;
            case 'TrendingUp': return <TrendingUp className="h-10 w-10 text-primary mb-4" />;
            case 'Building2': return <Building2 className="h-10 w-10 text-primary mb-4" />;
            case 'Calculator': return <Calculator className="h-10 w-10 text-primary mb-4" />;
            default: return <CheckCircle className="h-10 w-10 text-primary mb-4" />;
        }
    };

    const categories = [
        "Gestão e Organização",
        "Inteligência de Dados",
        "Otimização e Suporte"
    ];

    // Helper to get items for a category, falling back to hardcoded if no items exist
    const getCategoryItems = (category: string) => {
        if (items && items.length > 0) {
            return items.filter(i => i.metadata?.category === category);
        }
        // Fallback content (simplified for brevity, ideally would be the full hardcoded list)
        return [];
    };

    // If we have items, use the dynamic logic. If not, we might want to keep the hardcoded JSX for now to avoid breaking the layout if DB is empty.
    // But to support the user's request, we must use the DB items.
    // Let's keep the hardcoded structure BUT replace the content with mapped items if they exist.

    // Actually, the best approach is to define the default content as a structured array and use that if items is empty.
    const defaultFeatures = [
        {
            category: "Gestão e Organização",
            items: [
                { icon: "FileText", title: "Laudos Completos", description: "Gere laudos em PDF prontos para impressão." },
                { icon: "Calculator", title: "Cálculos Automáticos", description: "Homogeneização e saneamento automático." },
                { icon: "Building2", title: "Gestão de Imóveis", description: "Organize suas amostras e avaliações." }
            ]
        },
        {
            category: "Inteligência de Dados",
            items: [
                { icon: "TrendingUp", title: "Inferência Estatística", description: "Regressão linear múltipla avançada." },
                { icon: "BarChart", title: "Gráficos Detalhados", description: "Análise visual de dispersão e aderência." },
                { icon: "CheckCircle", title: "Validação Automática", description: "Verificação de pressupostos da NBR 14.653." }
            ]
        },
        {
            category: "Otimização e Suporte",
            items: [
                { icon: "Zap", title: "Alta Performance", description: "Resultados em segundos, não horas." },
                { icon: "Shield", title: "Segurança de Dados", description: "Seus laudos protegidos e em nuvem." },
                { icon: "Users", title: "Suporte Especializado", description: "Equipe pronta para te ajudar." }
            ]
        }
    ];

    const displayData = (items && items.length > 0)
        ? categories.map(cat => ({
            category: cat,
            items: items.filter(i => i.metadata?.category === cat)
        }))
        : defaultFeatures;

    return (
        <section className="pt-12 pb-24 bg-background" id="features">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary rounded-full">
                        Features
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                        {content?.title || "Funcionalidades Inteligentes para o Seu Sucesso"}
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground text-xl">
                        {content?.subtitle || "Tudo o que você precisa para avaliações precisas e eficientes."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayData.map((column, colIndex) => (
                        <div key={colIndex} className="bg-muted/30 rounded-3xl p-8 hover:bg-muted/50 transition-colors">
                            <h3 className="text-xl font-bold text-foreground mb-8">{column.category}</h3>
                            <div className="space-y-8">
                                {column.items.map((feature: any, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                                            {feature.icon && feature.icon.includes('fa-') ? (
                                                <i className={`${feature.icon} text-xl text-primary`} />
                                            ) : (
                                                getIcon(feature.icon)
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{feature.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button
                        className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                        onClick={() => navigate('/cadastro')}
                    >
                        Começar Agora
                    </Button>
                </div>
            </div>
        </section>
    );
};
