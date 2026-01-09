import { LandingContent, LandingItem } from "@/pages/Landing";

interface TrustedBySectionProps {
    content?: LandingContent;
    items?: LandingItem[];
}

export const TrustedBySection = ({ content, items }: TrustedBySectionProps) => {
    return (
        <section className="py-10 bg-muted/30 border-y">
            <div className="container">
                <div className="text-center mb-8">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {content?.title || "Confiado por profissionais de todo o Brasil"}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all duration-500">
                    {items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            {/* If image_url exists, use it as an image logo */}
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.title || "Logo"}
                                    className="h-8 md:h-10 w-auto object-contain"
                                />
                            ) : (
                                /* Fallback to text/icon if no image */
                                <div className="flex items-center gap-2 text-xl font-bold transition-colors">
                                    {item.icon && <i className={`${item.icon} text-2xl text-primary`} />}
                                    <span className="text-foreground">{item.title}</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Fallback if no items */}
                    {(!items || items.length === 0) && (
                        <div className="text-muted-foreground text-sm italic">
                            Adicione logos na área administrativa
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
