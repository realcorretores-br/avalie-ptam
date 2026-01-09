import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";

interface CUBSearchButtonProps {
  estado: string;
}

export const CUBSearchButton = ({ estado }: CUBSearchButtonProps) => {
  const handleSearch = () => {
    const searchQuery = `Sinduscon CUB ${estado}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      title="Buscar CUB no Google"
      onClick={handleSearch}
      type="button"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
};
