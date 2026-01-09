import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Edit, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string | string[]) => void;
  currentImage?: string;
  annotatedImage?: string;
  onAnnotate?: () => void;
  onRemove?: () => void;
  label: string;
  maxSizeMB?: number;
  allowMultiple?: boolean;
}

<<<<<<< HEAD
export const ImageUpload = ({
  onImageSelect,
  currentImage,
=======
export const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
  annotatedImage,
  onAnnotate,
  onRemove,
  label,
  maxSizeMB = 1,
  allowMultiple = false
}: ImageUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  const compressImage = useCallback(async (file: File): Promise<string> => {
=======
  const compressImage = async (file: File): Promise<string> => {
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      const compressedFile = await imageCompression(file, options);
<<<<<<< HEAD

=======
      
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
<<<<<<< HEAD
  }, [maxSizeMB]);
=======
  };
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Validate all files
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }
    }

    setIsCompressing(true);

    try {
      if (allowMultiple) {
        // Process multiple files
        const imageUrls: string[] = [];
        for (const file of acceptedFiles) {
          if (file.size > maxSizeMB * 1024 * 1024) {
            toast.info(`Comprimindo ${file.name}...`);
          }
          const imageUrl = await compressImage(file);
          imageUrls.push(imageUrl);
        }
        onImageSelect(imageUrls);
        toast.success(`${imageUrls.length} imagem(ns) carregada(s) com sucesso!`);
      } else {
        // Single file
        const file = acceptedFiles[0];
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.info(`Comprimindo imagem (maior que ${maxSizeMB}MB)...`);
        }
        const imageUrl = await compressImage(file);
        onImageSelect(imageUrl);
        toast.success("Imagem carregada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao processar imagem");
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
<<<<<<< HEAD
  }, [maxSizeMB, onImageSelect, allowMultiple, compressImage]);
=======
  }, [maxSizeMB, onImageSelect, allowMultiple]);
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: allowMultiple ? 30 : 1,
    multiple: allowMultiple,
    useFsAccessApi: false, // Disable File System Access API for better mobile compatibility
  });

  const displayImage = annotatedImage || currentImage;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
<<<<<<< HEAD

=======
      
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
      {/* Hidden input for "Trocar Imagem" button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            await onDrop(Array.from(files));
            e.target.value = ''; // Reset input
          }
        }}
      />
<<<<<<< HEAD

      {!displayImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
            }`}
=======
      
      {!displayImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          }`}
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isCompressing ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Comprimindo imagem...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-sm text-muted-foreground">Solte a imagem aqui...</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Arraste uma imagem ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Máximo {maxSizeMB}MB - JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative group rounded-lg overflow-hidden border">
<<<<<<< HEAD
            <img
              src={displayImage}
              alt="Preview"
=======
            <img 
              src={displayImage} 
              alt="Preview" 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
              className="w-full h-auto max-h-96 object-contain bg-muted"
            />
            {annotatedImage && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Anotada
              </div>
            )}
          </div>
<<<<<<< HEAD

          <div className="flex gap-2">
            {onAnnotate && (
              <Button
                variant="outline"
=======
          
          <div className="flex gap-2">
            {onAnnotate && (
              <Button 
                variant="outline" 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                size="sm"
                onClick={onAnnotate}
              >
                <Edit className="h-4 w-4 mr-2" />
                {annotatedImage ? "Editar Anotações" : "Adicionar Anotações"}
              </Button>
            )}
            {onRemove && (
<<<<<<< HEAD
              <Button
                variant="outline"
=======
              <Button 
                variant="outline" 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                size="sm"
                onClick={onRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
<<<<<<< HEAD
            <Button
              variant="outline"
=======
            <Button 
              variant="outline" 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Trocar Imagem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
