import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Building2, FileText, Award, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LandingContent } from "@/pages/Landing";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
    content?: LandingContent;
}

export const HeroSection = ({ content }: HeroSectionProps) => {
    const navigate = useNavigate();

    const title = content?.title || "Relatórios de Avaliação Imobiliária Profissional em Minutos";
    const subtitle = content?.subtitle || "Comparativo Direto, CUB ou Capitalização de Renda. Gere laudos prontos em PDF A4 para venda ou locação.";
    const badge = content?.description || "Avaliação Imobiliária Profissional";
    const imageUrl = content?.image_url || "/lovable-uploads/f4039869-3738-4e36-8c46-953888359740.png";

    return (
        <section className="relative pt-24 pb-0 lg:pt-32 lg:pb-0 overflow-hidden">
            {/* Background Gradients - Enhanced for "light background" effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[120%] max-w-[100vw] -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/15 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/15 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-pink-500/15 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
            </div>

            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center mb-6">
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary rounded-full">
                        ✨ {badge}
                    </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground mb-6 max-w-4xl mx-auto">
                    {title}
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                    <Button
                        size="lg"
                        className="rounded-full text-base h-12 px-8 shadow-lg shadow-primary/25 bg-[linear-gradient(135deg,#8b5cf6_0%,#3b82f6_100%)] hover:opacity-90 transition-opacity"
                        onClick={() => navigate('/auth')}
                    >
                        Começar Grátis
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full text-base h-12 px-8 border-2 hover:bg-muted/50"
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Como Funciona
                    </Button>
                </div>

                {/* Dashboard Image - Fitted within section */}
                <div className="relative max-w-5xl mx-auto perspective-1000 z-20">
                    <div className="relative rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.01]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />

                        {/* Browser Header */}
                        <div className="h-8 bg-muted/80 border-b flex items-center px-3 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                            </div>
                            <div className="ml-3 flex-1 h-5 bg-background/50 rounded-md text-[10px] flex items-center px-2 text-muted-foreground max-w-xs mx-auto">
                                app.avaliecerto.com.br/dashboard
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative aspect-[16/9] bg-muted/20 overflow-hidden">
                            <img
                                src={imageUrl}
                                alt="Dashboard Preview"
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                    e.currentTarget.src = "https://placehold.co/1200x800/png?text=Dashboard+Preview";
                                }}
                            />
                        </div>
                    </div>
                    {/* Floating Elements (Optional decoration) */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse delay-1000" />
                </div>

            </div>

        </section>
    );
};
