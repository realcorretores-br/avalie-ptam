import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formata um número para o padrão monetário brasileiro (R$ 1.000,00)
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Remove a formatação monetária de uma string
export function parseCurrency(value: string): string {
  return value.replace(/[^\d,]/g, "").replace(",", ".");
}

// Converte uma string monetária em número
export function currencyToNumber(value: string): number {
  return parseFloat(parseCurrency(value) || "0");
}

// Aplica máscara monetária durante digitação
export function applyCurrencyMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, "");
  
  if (!numbers) return "";
  
  // Converte para número e divide por 100 para ter as casas decimais
  const amount = parseFloat(numbers) / 100;
  
  // Formata para o padrão brasileiro
  return formatCurrency(amount).replace("R$", "").trim();
}

// Aplica máscara numérica simples (apenas números e vírgula)
export function applyNumericMask(value: string): string {
  // Remove tudo exceto números e vírgula
  const cleaned = value.replace(/[^\d,]/g, "");
  // Garante apenas uma vírgula
  const parts = cleaned.split(",");
  if (parts.length > 2) {
    return parts[0] + "," + parts.slice(1).join("");
  }
  return cleaned;
}

// Converte uma string numérica com vírgula em número
export function numericToNumber(value: string): number {
  return parseFloat(value.replace(",", ".") || "0");
}

// Aplica máscara de CPF (000.000.000-00)
export function applyCPFMask(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  
  const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (!match) return value;
  
  const [, p1, p2, p3, p4] = match;
  let result = p1;
  if (p2) result += `.${p2}`;
  if (p3) result += `.${p3}`;
  if (p4) result += `-${p4}`;
  
  return result;
}

// Aplica máscara de RG (00.000.000-0)
export function applyRGMask(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  
  const match = numbers.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,1})$/);
  if (!match) return value;
  
  const [, p1, p2, p3, p4] = match;
  let result = p1;
  if (p2) result += `.${p2}`;
  if (p3) result += `.${p3}`;
  if (p4) result += `-${p4}`;
  
  return result;
}

// Aplica máscara de data DD/MM/YYYY
export function applyDateMask(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  
  const match = numbers.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (!match) return value;
  
  const [, day, month, year] = match;
  let result = day;
  if (month) result += `/${month}`;
  if (year) result += `/${year}`;
  
  return result;
}

// Converte data de YYYY-MM-DD para DD/MM/YYYY
export function formatDateToDDMMYYYY(value: string): string {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Converte data de DD/MM/YYYY para YYYY-MM-DD
export function formatDateToYYYYMMDD(value: string): string {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Valida se a data DD/MM/YYYY é válida
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const parts = dateStr.split("/");
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  return true;
}
