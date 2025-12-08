import { LandingContent } from "@/pages/Landing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FinalCTASectionProps {
    content?: LandingContent;
}

export const FinalCTASection = ({ content }: FinalCTASectionProps) => {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] relative overflow-hidden text-white">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            {content?.title || "Pronto para Simplificar Suas Avaliações?"}
                        </h2>
                        <p className="text-white/90 text-lg md:text-xl max-w-[600px] mx-auto lg:mx-0">
                            {content?.subtitle || "Junte-se a corretores e avaliadores que já modernizaram seu processo de trabalho."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                        <Button
                            size="lg"
                            className="bg-white text-[#6366f1] hover:bg-white/90 font-bold text-lg h-14 px-8 rounded-full shadow-lg"
                            onClick={() => navigate('/cadastro')}
                        >
                            Começar Agora
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white/10 bg-transparent font-bold text-lg h-14 px-8 rounded-full"
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Como Funciona
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
