import { useState } from "react";
import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Search, Globe } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageAnnotation } from "@/components/ImageAnnotation";
import { useCEP } from "@/hooks/useCEP";
import { toast } from "sonner";

interface LocalizacaoProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Localizacao = ({ data, updateData }: LocalizacaoProps) => {
  const [showAnnotation, setShowAnnotation] = useState(false);
  const { fetchCEP, loading } = useCEP();

  const handleCEPSearch = async () => {
    if (!data.cep) return;
    
    const cepData = await fetchCEP(data.cep);
    if (cepData) {
      updateData({
        enderecoImovel: cepData.logradouro,
        bairro: cepData.bairro,
        cidade: cepData.localidade,
        estado: cepData.uf,
      });
    }
  };

  const handleOpenGoogleMaps = () => {
    const address = `${data.enderecoImovel || ''}, ${data.numeroImovel || ''}, ${data.bairro || ''}, ${data.cidade || ''}, ${data.estado || ''}, ${data.cep || ''}`;
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
    toast.info('Copie as coordenadas do Google Maps e cole nos campos abaixo');
  };

  return (
    <div className="space-y-4">
      {showAnnotation && data.localizacaoImagem && (
        <ImageAnnotation
          imageUrl={data.localizacaoImagem}
          onSave={(annotatedUrl) => {
            updateData({ localizacaoImagemAnotada: annotatedUrl });
            setShowAnnotation(false);
          }}
          onCancel={() => setShowAnnotation(false)}
        />
      )}
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Informações sobre a localização do imóvel. O CEP preencherá automaticamente o endereço.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cep">
            CEP <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="cep"
              value={data.cep || ""}
              onChange={(e) => updateData({ cep: e.target.value })}
              placeholder="Ex: 12345-678"
              maxLength={9}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleCEPSearch}
              disabled={loading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoImovel">
            Logradouro <span className="text-destructive">*</span>
          </Label>
          <Input
            id="enderecoImovel"
            value={data.enderecoImovel || ""}
            onChange={(e) => updateData({ enderecoImovel: e.target.value })}
            placeholder="Ex: Rua Principal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroImovel">
            Número <span className="text-destructive">*</span>
          </Label>
          <Input
            id="numeroImovel"
            value={data.numeroImovel || ""}
            onChange={(e) => updateData({ numeroImovel: e.target.value })}
            placeholder="Ex: 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={data.complemento || ""}
            onChange={(e) => updateData({ complemento: e.target.value })}
            placeholder="Ex: Apto 201, Casa 3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">
            Bairro <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bairro"
            value={data.bairro || ""}
            onChange={(e) => updateData({ bairro: e.target.value })}
            placeholder="Ex: Centro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">
            Cidade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cidade"
            value={data.cidade || ""}
            onChange={(e) => updateData({ cidade: e.target.value })}
            placeholder="Ex: Porto Alegre"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">
            Estado <span className="text-destructive">*</span>
          </Label>
          <Input
            id="estado"
            value={data.estado || ""}
            onChange={(e) => updateData({ estado: e.target.value })}
            placeholder="Ex: RS"
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenGoogleMaps}
          className="w-full"
        >
          <Globe className="mr-2 h-4 w-4" />
          Buscar Coordenadas no Google Maps
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={data.latitude || ""}
            onChange={(e) => updateData({ latitude: e.target.value })}
            placeholder="Ex: 30°30'43.44&quot;S"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={data.longitude || ""}
            onChange={(e) => updateData({ longitude: e.target.value })}
            placeholder="Ex: 53°29'2.93&quot;O"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricaoLocalizacao">
            Descrição da Localização e Infraestrutura <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="descricaoLocalizacao"
            value={data.descricaoLocalizacao || ""}
            onChange={(e) => updateData({ descricaoLocalizacao: e.target.value })}
            placeholder="Descreva as características da região, infraestrutura disponível, proximidade de comércios e serviços..."
            rows={5}
          />
          <p className="text-sm text-muted-foreground">
            Inclua informações sobre a zona residencial ou comercial, serviços públicos, transporte, etc.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <ImageUpload
            label="Mapa ou Imagem da Localização (opcional)"
            currentImage={data.localizacaoImagem}
            annotatedImage={data.localizacaoImagemAnotada}
            onImageSelect={(url) => {
              if (typeof url === 'string') {
                updateData({ localizacaoImagem: url });
              }
            }}
            onAnnotate={() => setShowAnnotation(true)}
            onRemove={() => updateData({ localizacaoImagem: undefined, localizacaoImagemAnotada: undefined })}
          />
        </div>
      </div>
    </div>
  );
};
