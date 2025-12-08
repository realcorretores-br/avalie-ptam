import { ShieldCheck, Lock, Zap, FileCheck, CheckCircle } from "lucide-react";


interface GuaranteesSectionProps {
    content?: {
        title: string | null;
        subtitle: string | null;
    };
    items?: Array<{
        title: string | null;
        description: string | null;
        icon: string | null;
    }>;
}

export const GuaranteesSection = ({ content, items = [] }: GuaranteesSectionProps) => {
    const iconMap: Record<string, any> = {
        ShieldCheck,
        Lock,
        Zap,
        FileCheck,
        CheckCircle
    };

    const getIcon = (iconName: string | null) => {
        if (!iconName) return CheckCircle;
        return iconMap[iconName] || CheckCircle;
    };

    return (
        <section className="py-20">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {content?.title || "Garantias e Diferenciais"}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {content?.subtitle || "Por que profissionais de todo o Brasil confiam no Avalie Certo."}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item, index) => {
                        const Icon = getIcon(item.icon);
                        return (
                            <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
