import { Trophy, Users, FileCheck, Star } from "lucide-react";

export const StatsSection = () => {
    const stats = [
        {
            value: "5+",
            label: "Anos de Mercado",
            icon: Trophy
        },
        {
            value: "98%",
            label: "Precisão nos Laudos",
            icon: FileCheck
        },
        {
            value: "5K+",
            label: "Laudos Emitidos",
            icon: Users
        },
        {
            value: "4.9",
            label: "Avaliação Média",
            icon: Star
        }
    ];

    return (
        <section className="py-12 bg-background">
            <div className="container px-4 md:px-6">
                <div className="w-full rounded-3xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] p-12 shadow-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center justify-center space-y-2 text-white">
                                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                                    {stat.value}
                                </span>
                                <span className="text-sm md:text-base font-medium opacity-90">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
