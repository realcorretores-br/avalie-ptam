import { useNavigate } from "react-router-dom";
import { LandingContent, LandingItem } from "@/pages/Landing";
import { UserPlus, Search, Calculator, FileCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HowItWorksSectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const HowItWorksSection = ({ content, items }: HowItWorksSectionProps) => {
    const navigate = useNavigate();
    // Hardcoded steps to ensure "slightly longer" and specific content as requested
    const defaultSteps = [
        {
            id: "01",
            title: "Cadastre o Imóvel",
            description: "Insira os dados básicos do imóvel avaliando em nossa plataforma intuitiva. O sistema guia você pelos campos essenciais, garantindo que nenhuma informação importante seja esquecida para uma avaliação precisa.",
            icon: <UserPlus className="h-8 w-8 text-primary" />,
            color: "bg-blue-500/10 text-blue-500"
        },
        {
            id: "02",
            title: "Inteligência de Dados",
            description: "Nossa tecnologia varre o mercado em busca de amostras semelhantes, aplicando filtros inteligentes de localização e características para selecionar os comparativos mais adequados para o seu laudo.",
            icon: <Search className="h-8 w-8 text-purple-500" />,
            color: "bg-purple-500/10 text-purple-500"
        },
        {
            id: "03",
            title: "Tratamento Estatístico",
            description: "O sistema realiza automaticamente todos os cálculos complexos exigidos pela NBR 14.653, incluindo homogeneização, saneamento de amostras e regressão linear, eliminando erros manuais.",
            icon: <Calculator className="h-8 w-8 text-pink-500" />,
            color: "bg-pink-500/10 text-pink-500"
        },
        {
            id: "04",
            title: "Laudo Finalizado",
            description: "Receba seu laudo técnico completo em PDF, com gráficos detalhados, fundamentação teórica e formatação profissional, pronto para ser assinado e entregue ao seu cliente com total segurança.",
            icon: <FileCheck className="h-8 w-8 text-green-500" />,
            color: "bg-green-500/10 text-green-500"
        }
    ];

    const getIcon = (iconName: string | null) => {
        if (!iconName) return <UserPlus className="h-8 w-8" />;

        // Check for FontAwesome
        if (iconName.includes('fa-')) {
            return <i className={`${iconName} text-2xl`} />;
        }

        switch (iconName) {
            case 'Search': return <Search className="h-8 w-8" />;
            case 'Calculator': return <Calculator className="h-8 w-8" />;
            case 'FileCheck': return <FileCheck className="h-8 w-8" />;
            default: return <UserPlus className="h-8 w-8" />;
        }
    };

    const displaySteps = items && items.length > 0 ? items.map((item, index) => ({
        id: String(index + 1).padStart(2, '0'),
        title: item.title || "",
        description: item.description || "",
        icon: getIcon(item.icon),
        color: index === 0 ? "bg-blue-500/10 text-blue-500" :
            index === 1 ? "bg-purple-500/10 text-purple-500" :
                index === 2 ? "bg-pink-500/10 text-pink-500" :
                    "bg-green-500/10 text-green-500"
    })) : defaultSteps;

    return (
        <section id="how-it-works" className="py-12 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary rounded-full">
                        Passo a Passo
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                        {content?.title || "Como Funciona"}
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        {content?.subtitle || "Sua jornada para avaliações profissionais em 4 passos simples."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displaySteps.map((step) => (
                        <div key={step.id} className="group relative bg-background rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:-translate-y-1">
                            {/* Top Image/Icon Area */}
                            <div className={`w-full aspect-[4/3] rounded-2xl mb-6 flex items-center justify-center ${step.color} transition-colors group-hover:bg-opacity-20`}>
                                <div className="p-4 rounded-full bg-background shadow-sm">
                                    {step.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold tracking-wider text-muted-foreground/50">
                                        PASSO {step.id}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>

                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button
                        className="rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-blue-500/20 bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-all hover:scale-105 hover:shadow-blue-500/40"
                        onClick={() => navigate('/cadastro')}
                    >
                        Começar Agora
                    </Button>
                </div>
            </div>
        </section>
    );
};
