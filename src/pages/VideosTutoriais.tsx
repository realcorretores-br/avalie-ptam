import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowLeft, Play } from "lucide-react";

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url_video: string;
  thumbnail: string;
  ordem: number;
}

const VideosTutoriais = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleWatchVideo = (video: Video) => {
    const youtubeId = getYouTubeId(video.url_video);
    if (youtubeId) {
      setSelectedVideo(video);
    } else {
      window.open(video.url_video, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">PTAM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Vídeos Tutoriais</h1>
          <p className="text-muted-foreground mb-8">
            Aprenda a usar todas as funcionalidades da plataforma
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : videos.length === 0 ? (
            <Card className="p-12 text-center">
              <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum vídeo disponível</h3>
              <p className="text-muted-foreground">
                Em breve adicionaremos tutoriais para ajudá-lo
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="relative aspect-video bg-muted group cursor-pointer" onClick={() => handleWatchVideo(video)}>
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.titulo}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-3 shadow-lg">
                        <Play className="h-8 w-8 text-primary fill-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg line-clamp-2">{video.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {video.descricao}
                    </p>
                    <Button
                      className="w-full mt-auto"
                      onClick={() => handleWatchVideo(video)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Assistir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedVideo?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.url_video)}?autoplay=1`}
                title={selectedVideo.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideosTutoriais;
