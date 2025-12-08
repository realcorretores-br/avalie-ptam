import { LandingContent, LandingItem } from "@/pages/Landing";
import { Star, Quote } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialsSectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const TestimonialsSection = ({ content, items }: TestimonialsSectionProps) => {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        {content?.title || "O que dizem nossos clientes"}
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground text-xl">
                        {content?.subtitle || "Histórias reais de quem transformou suas avaliações."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items?.map((item) => (
                        <Card key={item.id} className="border-none shadow-lg bg-background relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-primary/10">
                                <Quote className="h-12 w-12" />
                            </div>
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/10">
                                    <AvatarImage src={item.image_url || ""} alt={item.title || "User"} />
                                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                        {item.title?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed italic">
                                    "{item.description}"
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
