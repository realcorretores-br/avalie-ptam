import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DescriptionPopupProps {
  description: string;
}

export const DescriptionPopup = ({ description }: DescriptionPopupProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    toast({
      title: "Descritivo copiado!",
      description: "O texto foi copiado para a área de transferência.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Ver descritivo do imóvel">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Descritivo do Imóvel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="whitespace-pre-wrap text-sm">{description || "Nenhum descritivo informado ainda."}</p>
          </div>
          <Button onClick={handleCopy} className="w-full" disabled={!description}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar Descritivo
          </Button>
          <div className="space-y-2">
            <p className="text-sm font-medium">Consultar imóveis semelhantes no Google:</p>
            <Button
              variant="outline"
              asChild
              className="w-full justify-start"
            >
              <a href={`https://www.google.com/search?q=${encodeURIComponent(description)}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Pesquisar no Google
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
