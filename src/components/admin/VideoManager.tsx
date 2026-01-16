import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";
import { Save, Plus, Trash2, GripVertical, Edit, Play, Video as VideoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Video {
    id: string;
    titulo: string;
    descricao: string | null;
    url_video: string;
    thumbnail: string | null;
    ordem: number;
    ativo: boolean;
}

export const VideoManager = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('tutorial_videos')
                .select('*')
                .order('ordem');

            if (error) throw error;
            if (data) setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Erro ao carregar vídeos');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVideo = async (video: Partial<Video>) => {
        try {
            const videoData = {
                titulo: video.titulo,
                descricao: video.descricao,
                url_video: video.url_video,
                thumbnail: video.thumbnail,
                ordem: video.ordem || videos.length + 1,
                ativo: video.ativo ?? true
            };

            if (video.id) {
                const { error } = await supabase
                    .from('tutorial_videos')
                    .update(videoData)
                    .eq('id', video.id);
                if (error) throw error;
                toast.success('Vídeo atualizado');
            } else {
                const { error } = await supabase
                    .from('tutorial_videos')
                    .insert(videoData);
                if (error) throw error;
                toast.success('Vídeo adicionado');
            }

            setIsDialogOpen(false);
            setEditingVideo(null);
            fetchVideos();
        } catch (error) {
            console.error('Error saving video:', error);
            toast.error('Erro ao salvar vídeo');
        }
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;

        try {
            const { error } = await supabase.from('tutorial_videos').delete().eq('id', videoToDelete);
            if (error) throw error;
            toast.success('Vídeo excluído');
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Erro ao excluir vídeo');
        } finally {
            setVideoToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <VideoIcon className="h-5 w-5" />
                            Vídeos Tutoriais ({videos.length})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Gerencie os vídeos que aparecem na página de tutoriais.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingVideo({})}>
                                <Plus className="h-4 w-4 mr-2" /> Adicionar Vídeo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingVideo?.id ? 'Editar' : 'Adicionar'} Vídeo</DialogTitle>
                            </DialogHeader>
                            <VideoForm
                                video={editingVideo || {}}
                                onSave={handleSaveVideo}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-2">
                    {videos.map((video) => (
                        <div key={video.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                            <div className="h-16 w-24 bg-muted rounded overflow-hidden flex-shrink-0 relative group">
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Play className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium truncate">{video.titulo}</h4>
                                    {!video.ativo && (
                                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Inativo</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{video.descricao}</p>
                                <a href={video.url_video} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                                    {video.url_video}
                                </a>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingVideo(video);
                                    setIsDialogOpen(true);
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setVideoToDelete(video.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {videos.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum vídeo cadastrado.
                        </div>
                    )}
                </div>
            </Card>

            <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o vídeo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const VideoForm = ({ video, onSave }: { video: Partial<Video>, onSave: (v: Partial<Video>) => void }) => {
    const [localVideo, setLocalVideo] = useState(video);

    return (
        <div className="space-y-4 py-4">
            <div>
                <Label>Título</Label>
                <Input
                    value={localVideo.titulo || ''}
                    onChange={(e) => setLocalVideo({ ...localVideo, titulo: e.target.value })}
                    placeholder="Ex: Como criar um novo laudo"
                />
            </div>

            <div>
                <Label>Descrição</Label>
                <Textarea
                    value={localVideo.descricao || ''}
                    onChange={(e) => setLocalVideo({ ...localVideo, descricao: e.target.value })}
                    placeholder="Breve descrição do conteúdo do vídeo"
                />
            </div>

            <div>
                <Label>URL do Vídeo (YouTube/Vimeo/MP4)</Label>
                <Input
                    value={localVideo.url_video || ''}
                    onChange={(e) => setLocalVideo({ ...localVideo, url_video: e.target.value })}
                    placeholder="https://..."
                />
            </div>

            <div>
                <ImageUploader
                    label="Thumbnail (Capa)"
                    currentImageUrl={localVideo.thumbnail}
                    onUploadSuccess={(url) => setLocalVideo({ ...localVideo, thumbnail: url })}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Label>Ordem</Label>
                    <Input
                        type="number"
                        value={localVideo.ordem || 0}
                        onChange={(e) => setLocalVideo({ ...localVideo, ordem: parseInt(e.target.value) })}
                    />
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <Switch
                        checked={localVideo.ativo ?? true}
                        onCheckedChange={(checked) => setLocalVideo({ ...localVideo, ativo: checked })}
                    />
                    <Label>Ativo</Label>
                </div>
            </div>

            <Button onClick={() => onSave(localVideo)} className="w-full">
                <Save className="h-4 w-4 mr-2" /> Salvar Vídeo
            </Button>
        </div>
    );
};
