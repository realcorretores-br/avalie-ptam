export const numberToWords = (value: string): string => {
  // Remove formatação e converte para número
  const cleanValue = value.replace(/[^\d,]/g, "").replace(",", ".");
  const num = parseFloat(cleanValue);

  if (isNaN(num)) return "";

  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const convertGroup = (n: number): string => {
    if (n === 0) return "";
    if (n === 100) return "cem";
    
    let result = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) result += hundreds[h];
    
    if (t === 1) {
      if (result) result += " e ";
      result += teens[u];
      return result;
    }

    if (t > 1) {
      if (result) result += " e ";
      result += tens[t];
    }

    if (u > 0) {
      if (result) result += " e ";
      result += units[u];
    }

    return result;
  };

  const intPart = Math.floor(num);
  const centPart = Math.round((num - intPart) * 100);

  if (intPart === 0 && centPart === 0) return "zero reais";

  let result = "";

  // Milhões
  const millions = Math.floor(intPart / 1000000);
  if (millions > 0) {
    const millionWord = convertGroup(millions);
    result += millionWord;
    result += millions === 1 ? " milhão" : " milhões";
  }

  // Milhares
  const thousands = Math.floor((intPart % 1000000) / 1000);
  if (thousands > 0) {
    if (result) result += " e ";
    const thousandWord = convertGroup(thousands);
    result += thousandWord + " mil";
  }

  // Centenas
  const rest = intPart % 1000;
  if (rest > 0) {
    if (result && thousands === 0 && millions > 0) result += " e ";
    else if (result) result += " e ";
    result += convertGroup(rest);
  }

  result += " reais";

  // Centavos
  if (centPart > 0) {
    result += " e ";
    result += convertGroup(centPart);
    result += centPart === 1 ? " centavo" : " centavos";
  }

  return result;
};
