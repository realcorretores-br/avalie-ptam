import { useState, useEffect } from "react";
import { ComplementaryImage } from "@/types/ptam";

export interface OrganizedImage extends ComplementaryImage {
    orientation: "portrait" | "landscape";
}

export const useOrganizedPhotos = (images: ComplementaryImage[] | undefined) => {
    const [organizedImages, setOrganizedImages] = useState<OrganizedImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!images || images.length === 0) {
            setLoading(false);
            setOrganizedImages([]);
            return;
        }

        const loadImages = async () => {
            setLoading(true);
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

    return { organizedImages, loading };
};
