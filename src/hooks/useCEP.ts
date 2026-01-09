import { useState } from "react";
import { toast } from "sonner";

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useCEP = () => {
  const [loading, setLoading] = useState(false);

  const fetchCEP = async (cep: string): Promise<CEPData | null> => {
    const cleanCEP = cep.replace(/\D/g, "");

    if (cleanCEP.length !== 8) {
      toast.error("CEP inválido. Digite 8 dígitos.");
      return null;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: CEPData = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        return null;
      }

      toast.success("Endereço encontrado!");
      return data;
    } catch (error) {
      toast.error("Erro ao buscar CEP. Tente novamente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchCEP, loading };
};
