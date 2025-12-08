import { Check, X } from "lucide-react";

interface ProblemSolutionSectionProps {
    content?: {
        title: string | null;
        description: string | null;
        image_url: string | null;
    };
    items?: Array<{
        title: string | null;
        metadata: any;
    }>;
}

export const ProblemSolutionSection = ({ content, items = [] }: ProblemSolutionSectionProps) => {
    const problems = items.filter(i => i.metadata?.type === 'problem').map(i => i.title);
    const solutions = items.filter(i => i.metadata?.type === 'solution').map(i => i.title);

    // Fallback if no items
    const defaultProblems = [
        "Perda de tempo com planilhas manuais complexas",
        "Risco de erro nos cálculos (CUB, depreciação, capitalização)",
        "Fotos e dados dispersos, sem padronização",
        "Falta de padronização e demora para entregar laudos"
    ];

    const defaultSolutions = [
        "Plataforma única — preenche tudo com dados e fotos",
        "Cálculos automáticos (homogeneização, CUB, renda)",
        "Upload e organização de fotos + relatórios prontos em PDF",
        "Economia de tempo: de 2 a 4 dias para minutos"
    ];

    const displayProblems = problems.length > 0 ? problems : defaultProblems;
    const displaySolutions = solutions.length > 0 ? solutions : defaultSolutions;

    const imageUrl = content?.image_url || "/lovable-uploads/f4039869-3738-4e36-8c46-953888359740.png";

    return (
        <section className="py-20 bg-muted/30">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {content?.title || "Problema & Solução"}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {content?.description || "Entenda por que o método tradicional está te fazendo perder dinheiro e como o Avalie Certo resolve isso."}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Problems Card */}
                    <div className="bg-background rounded-2xl p-8 shadow-sm border border-red-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-red-600">
                            <X className="h-8 w-8" />
                            O Jeito Antigo
                        </h3>
                        <ul className="space-y-4">
                            {displayProblems.map((problem, index) => (
                                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                    <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <span>{problem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions Card */}
                    <div className="bg-background rounded-2xl p-8 shadow-lg border border-green-100 relative overflow-hidden transform lg:scale-105 z-10">
                        <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-600">
                            <Check className="h-8 w-8" />
                            Com Avalie Certo
                        </h3>
                        <ul className="space-y-4">
                            {displaySolutions.map((solution, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-foreground/90">{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Optional Image */}
                {imageUrl && (
                    <div className="mt-16 rounded-2xl overflow-hidden shadow-xl border max-w-4xl mx-auto">
                        <img
                            src={imageUrl}
                            alt="Comparativo Visual"
                            className="w-full h-auto"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};
