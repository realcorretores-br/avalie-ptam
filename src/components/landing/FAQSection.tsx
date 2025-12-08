import { LandingContent, LandingItem } from "@/pages/Landing";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQSectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const FAQSection = ({ content, items }: FAQSectionProps) => {
    return (
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6 max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        {content?.title || "Perguntas Frequentes"}
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground text-xl">
                        {content?.subtitle || "Tire suas dúvidas sobre o PTAM."}
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {items?.map((item) => (
                        <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-6 bg-card">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6 text-left">
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                                {item.description}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};
