import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploaderProps {
    currentImageUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    bucketName?: string;
    label?: string;
}

export const ImageUploader = ({
    currentImageUrl,
    onUploadSuccess,
    bucketName = 'landing_images',
    label = "Imagem"
}: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para fazer upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setPreviewUrl(data.publicUrl);
            onUploadSuccess(data.publicUrl);
            toast.success('Imagem enviada com sucesso!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUploadSuccess('');
    };

    return (
        <div className="space-y-4">
            <Label>{label}</Label>

            {previewUrl ? (
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full max-w-md aspect-video border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                    <Label htmlFor={`image-upload-${label}`} className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span>Clique para selecionar uma imagem</span>
                    </Label>
                    <Input
                        id={`image-upload-${label}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </div>
            )}

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando imagem...
                </div>
            )}
        </div>
    );
};
