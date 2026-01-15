
import { useState, useEffect } from "react";
import { ComplementaryImage } from "@/types/ptam";

interface PhotoOrganizerProps {
    images: ComplementaryImage[] | undefined;
}

interface OrganizedImage extends ComplementaryImage {
    orientation: "portrait" | "landscape";
}

export const PhotoOrganizer = ({ images }: PhotoOrganizerProps) => {
    const [organizedImages, setOrganizedImages] = useState<OrganizedImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!images || images.length === 0) {
            setLoading(false);
            return;
        }

        const loadImages = async () => {
            const processed = await Promise.all(
                images.map(async (img) => {
                    return new Promise<OrganizedImage>((resolve) => {
                        const image = new Image();
                        const src = img.annotatedUrl || img.url;
                        image.src = src;
                        image.onload = () => {
                            resolve({
                                ...img,
                                orientation: image.height > image.width ? "portrait" : "landscape",
                            });
                        };
                        image.onerror = () => {
                            // Fallback to landscape if load fails
                            resolve({
                                ...img,
                                orientation: "landscape",
                            });
                        };
                    });
                })
            );
            setOrganizedImages(processed);
            setLoading(false);
        };

        loadImages();
    }, [images]);

    if (loading) {
        return <div className="text-center p-4">Organizando fotos...</div>;
    }

    if (organizedImages.length === 0) {
        return null;
    }

    const portraitPhotos = organizedImages.filter((img) => img.orientation === "portrait");
    const landscapePhotos = organizedImages.filter((img) => img.orientation === "landscape");

    return (
        <div className="space-y-6">
            {/* Seção de Fotos Verticais (Retrato) */}
            {portraitPhotos.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">Fotos Verticais</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {portraitPhotos.map((img, index) => (
                            <div key={img.id || index} className="flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                                {/* Altura reduzida para 3 colunas */}
                                <div className="w-full h-[300px] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                                    <img
                                        src={img.annotatedUrl || img.url}
                                        alt={`Foto Vertical ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Foto {index + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seção de Fotos Horizontais (Paisagem) */}
            {landscapePhotos.length > 0 && (
                <div className={portraitPhotos.length > 0 ? "pt-4 border-t" : ""}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">Fotos Horizontais</h3>
                    {/* Grid de 3 colunas para horizontais */}
                    <div className="grid grid-cols-3 gap-4">
                        {landscapePhotos.map((img, index) => (
                            <div key={img.id || index} className="flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                                <div className="w-full h-[200px] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                                    <img
                                        src={img.annotatedUrl || img.url}
                                        alt={`Foto Horizontal ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Foto {index + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
