import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

const BRAZILIAN_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

export const StateSelector = () => {
  const [open, setOpen] = useState(false);

  const handleStateSelect = (uf: string) => {
    const searchQuery = `Sinduscon CUB ${uf}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          title="Buscar CUB por Estado"
          type="button"
        >
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecione o Estado para Buscar CUB</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BRAZILIAN_STATES.map((state) => (
            <Button
              key={state.uf}
              variant="outline"
              className="justify-start"
              onClick={() => handleStateSelect(state.uf)}
            >
              <span className="font-semibold mr-2">{state.uf}</span>
              <span className="text-muted-foreground text-sm">{state.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
