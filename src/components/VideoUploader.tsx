import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VideoUploaderProps {
  onUploadSuccess: () => void;
}

export const VideoUploader = ({ onUploadSuccess }: VideoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    ordem: 0,
  });

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Selecione um arquivo de vídeo");
      return;
    }

    setUploading(true);

    try {
      // Upload do vídeo
      const videoPath = `videos/${Date.now()}-${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from('ptam-images')
        .upload(videoPath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (videoError) throw videoError;

      // Obter URL pública do vídeo
      const { data: videoData } = supabase.storage
        .from('ptam-images')
        .getPublicUrl(videoPath);

      // Upload da thumbnail (opcional)
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbnailError } = await supabase.storage
          .from('ptam-images')
          .upload(thumbnailPath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (thumbnailError) throw thumbnailError;

        const { data: thumbnailData } = supabase.storage
          .from('ptam-images')
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = thumbnailData.publicUrl;
      }

      // Inserir registro no banco
      const { error: dbError } = await supabase
        .from('tutorial_videos')
        .insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          url_video: videoData.publicUrl,
          thumbnail: thumbnailUrl,
          ordem: formData.ordem,
          ativo: true,
        });

      if (dbError) throw dbError;

      toast.success("Vídeo enviado com sucesso!");
      
      // Limpar formulário
      setVideoFile(null);
      setThumbnailFile(null);
      setFormData({
        titulo: "",
        descricao: "",
        ordem: 0,
      });
      
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast.error(error.message || "Erro ao enviar vídeo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload de Vídeo</h3>
      <form onSubmit={handleVideoUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem de Exibição</Label>
          <Input
            id="ordem"
            type="number"
            value={formData.ordem}
            onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">Arquivo de Vídeo *</Label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            required
          />
          {videoFile && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {videoFile.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail (Opcional)</Label>
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
          {thumbnailFile && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {thumbnailFile.name}
            </p>
          )}
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Vídeo
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
