import { useState, useRef } from "react";
import { PTAMData, ComplementaryImage } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageAnnotation } from "@/components/ImageAnnotation";
import { Button } from "@/components/ui/button";
import { X, Edit, Sparkles, Info, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import imageCompression from 'browser-image-compression';

interface DoImovelProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const DoImovel = ({ data, updateData }: DoImovelProps) => {
  const [showMainAnnotation, setShowMainAnnotation] = useState(false);
  const [annotatingComplementaryId, setAnnotatingComplementaryId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleGenerateDescription = () => {
    const parts: string[] = [];

    if (data.tipoImovel) {
      const tipoMap: Record<string, string> = {
        'apartamento': 'Apartamento',
        'casa': 'Casa',
        'casa_condominio': 'Casa de condomínio',
        'sobrado': 'Sobrado',
        'sobrado_condominio': 'Sobrado em condomínio',
        'outros': data.tipoImovelOutro || 'Imóvel'
      };
      parts.push(`Imóvel tipo ${tipoMap[data.tipoImovel] || data.tipoImovel}`);
    }

    const details: string[] = [];
    if (data.quartos) details.push(`${data.quartos} quarto${Number(data.quartos) > 1 ? 's' : ''}`);
    if (data.banheiros) details.push(`${data.banheiros} banheiro${Number(data.banheiros) > 1 ? 's' : ''}`);
    if (data.suites) details.push(`${data.suites} suíte${Number(data.suites) > 1 ? 's' : ''}`);
    if (data.vagas) details.push(`${data.vagas} vaga${Number(data.vagas) > 1 ? 's' : ''} na garagem`);

    let description = parts.join(' ');
    if (details.length > 0) {
      description += ', ' + details.join(', ');
    }
    description += '.';

    updateData({ descricaoImovel: description });
    toast.success('Descrição gerada automaticamente!');
  };

  const handleAddComplementaryImage = (url: string | string[]) => {
    const currentImages = data.imovelImagensComplementares || [];

    const urls = Array.isArray(url) ? url : [url];

    if (currentImages.length + urls.length > 30) {
      toast.error(`Máximo de 30 imagens. Você pode adicionar apenas ${30 - currentImages.length} imagem(ns).`);
      return;
    }

    const newImages: ComplementaryImage[] = urls.map(u => ({
      id: Math.random().toString(36).substring(7),
      url: u,
    }));

    updateData({ imovelImagensComplementares: [...currentImages, ...newImages] });
  };

  const handleRemoveComplementaryImage = (id: string) => {
    const currentImages = data.imovelImagensComplementares || [];
    updateData({
      imovelImagensComplementares: currentImages.filter(img => img.id !== id)
    });
  };

  const handleSaveComplementaryAnnotation = (id: string, annotatedUrl: string) => {
    const currentImages = data.imovelImagensComplementares || [];
    updateData({
      imovelImagensComplementares: currentImages.map(img =>
        img.id === id ? { ...img, annotatedUrl } : img
      ),
    });
    setAnnotatingComplementaryId(null);
  };

  const annotatingImage = data.imovelImagensComplementares?.find(
    img => img.id === annotatingComplementaryId
  );

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    toast.loading('Processando foto...');

    try {
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Comprimir imagem
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };

        const compressedFile = await imageCompression(file, options);

        // Upload para Supabase Storage
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const { data: uploadData, error } = await supabase.storage
          .from('ptam-images')
          .upload(fileName, compressedFile);

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('ptam-images')
          .getPublicUrl(uploadData.path);

        urls.push(publicUrl);
      }

      handleAddComplementaryImage(urls);
      toast.dismiss();
      toast.success('Foto(s) adicionada(s) com sucesso!');
    } catch (error) {
      console.error('Erro ao processar foto:', error);
      toast.dismiss();
      toast.error('Erro ao processar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {showMainAnnotation && data.imovelImagemPrincipal && (
        <ImageAnnotation
          imageUrl={data.imovelImagemPrincipal}
          onSave={(annotatedUrl) => {
            updateData({ imovelImagemPrincipalAnotada: annotatedUrl });
            setShowMainAnnotation(false);
          }}
          onCancel={() => setShowMainAnnotation(false)}
        />
      )}

      {annotatingComplementaryId && annotatingImage && (
        <ImageAnnotation
          imageUrl={annotatingImage.url}
          onSave={(annotatedUrl) => handleSaveComplementaryAnnotation(annotatingComplementaryId, annotatedUrl)}
          onCancel={() => setAnnotatingComplementaryId(null)}
        />
      )}
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Preencha os detalhes e características do imóvel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="space-y-2">
          <Label htmlFor="tipoImovel">Tipo de Imóvel <span className="text-destructive">*</span></Label>
          <select id="tipoImovel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.tipoImovel || ""} onChange={(e) => updateData({ tipoImovel: e.target.value })}>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="casa_condominio">Casa de condomínio</option>
            <option value="sobrado">Sobrado</option>
            <option value="sobrado_condominio">Sobrado em condomínio</option>
            <option value="outros">Outros</option>
          </select>
        </div>
        {data.tipoImovel === "outros" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tipoImovelOutro">Especifique o Tipo de Imóvel</Label>
            <Input id="tipoImovelOutro" value={data.tipoImovelOutro || ""} onChange={(e) => updateData({ tipoImovelOutro: e.target.value })} placeholder="Ex: Galpão comercial" />
          </div>
        )}
        <div className="space-y-2"><Label htmlFor="quartos">Quartos</Label><Input id="quartos" type="number" value={data.quartos || ""} onChange={(e) => updateData({ quartos: e.target.value })} placeholder="Ex: 3" /></div>
        <div className="space-y-2"><Label htmlFor="banheiros">Banheiros</Label><Input id="banheiros" type="number" value={data.banheiros || ""} onChange={(e) => updateData({ banheiros: e.target.value })} placeholder="Ex: 2" /></div>
        <div className="space-y-2"><Label htmlFor="suites">Suítes</Label><Input id="suites" type="number" value={data.suites || ""} onChange={(e) => updateData({ suites: e.target.value })} placeholder="Ex: 1" /></div>
        <div className="space-y-2"><Label htmlFor="vagas">Vagas na Garagem</Label><Input id="vagas" type="number" value={data.vagas || ""} onChange={(e) => updateData({ vagas: e.target.value })} placeholder="Ex: 2" /></div>
        <div className="space-y-2"><Label htmlFor="anoConstrucao">Ano de Construção (opcional)</Label><Input id="anoConstrucao" type="number" value={data.anoConstrucao || ""} onChange={(e) => updateData({ anoConstrucao: e.target.value })} placeholder="Ex: 2010" /></div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateDescription}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Descrição Automática
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricaoImovel">
          Descrição do Imóvel <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="descricaoImovel"
          value={data.descricaoImovel || ""}
          onChange={(e) => updateData({ descricaoImovel: e.target.value })}
          placeholder="Descreva o tipo de construção, materiais, distribuição dos cômodos, acabamentos, estado de conservação..."
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="areaTotal">
            Área Total do Terreno (m²) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="areaTotal"
            type="number"
            step="0.01"
            value={data.areaTotal || ""}
            onChange={(e) => updateData({ areaTotal: e.target.value })}
            placeholder="Ex: 325.50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaConstruida">
            Área Construída (m²) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="areaConstruida"
            type="number"
            step="0.01"
            value={data.areaConstruida || ""}
            onChange={(e) => updateData({ areaConstruida: e.target.value })}
            placeholder="Ex: 140.05"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medidas">Medidas do Terreno (opcional)</Label>
        <Textarea
          id="medidas"
          value={data.medidas || ""}
          onChange={(e) => updateData({ medidas: e.target.value })}
          placeholder="Ex: 10,00m de frente e fundos, por 32,70m de um lado e 32,40m do outro"
          rows={2}
        />
      </div>

      {/* Main Property Image */}
      <div className="space-y-2">
        <ImageUpload
          label="Imagem Principal do Imóvel"
          currentImage={data.imovelImagemPrincipal}
          annotatedImage={data.imovelImagemPrincipalAnotada}
          onImageSelect={(url) => {
            if (typeof url === 'string') {
              updateData({ imovelImagemPrincipal: url });
            }
          }}
          onAnnotate={() => setShowMainAnnotation(true)}
          onRemove={() => updateData({
            imovelImagemPrincipal: undefined,
            imovelImagemPrincipalAnotada: undefined
          })}
        />
      </div>

      {/* Complementary Images */}
      <div className="space-y-4">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="font-semibold">Atenção:</span> Recomenda-se tirar as fotos na posição horizontal para melhor aproveitamento visual no documento final.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>
            Imagens Complementares (Máximo 30)
          </Label>
          <span className="text-sm text-muted-foreground">
            {data.imovelImagensComplementares?.length || 0}/30
          </span>
        </div>

        {isMobile && (
          <div className="mb-4">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleCameraCapture}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading || (data.imovelImagensComplementares?.length || 0) >= 30}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {isUploading ? 'Processando...' : 'Tirar Foto'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.imovelImagensComplementares?.map((image) => (
            <div key={image.id} className="relative group">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={image.annotatedUrl || image.url}
                  alt="Imagem complementar"
                  className="w-full h-48 object-cover"
                />
                {image.annotatedUrl && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Anotada
                  </div>
                )}
              </div>
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAnnotatingComplementaryId(image.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {image.annotatedUrl ? "Editar" : "Anotar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveComplementaryImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {(!data.imovelImagensComplementares || data.imovelImagensComplementares.length < 30) && (
            <ImageUpload
              label=""
              onImageSelect={handleAddComplementaryImage}
              allowMultiple={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
