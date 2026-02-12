import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export const serializePrisma = (data: any) => JSON.parse(JSON.stringify(data));
// lib/utils.ts
export const deepSerialize = (data: any) => JSON.parse(JSON.stringify(data));

export const formatDocument = (value: string, docType: 'CPF' | 'CNPJ') => {
  const digits = value.replace(/\D/g, '');
  if (docType === 'CPF') {
    return digits.slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits.slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

// --- VALIDAÇÕES LÓGICAS ---
export const isValidCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(digits.charAt(10));
};

export const isValidCNPJ = (cnpj: string): boolean => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const size = digits.length - 2;
  const numbers = digits.substring(0, size);
  const lastDigits = digits.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let res = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (res !== parseInt(lastDigits.charAt(0))) return false;
  sum = 0;
  pos = size - 6;
  for (let i = size + 1; i >= 1; i--) {
    sum += parseInt(digits.charAt(size + 1 - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  res = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return res === parseInt(lastDigits.charAt(1));
};

export function getUserLevel(user: any) {
  let score = 0;

  // 1. Base por Plano
  if (user.plan === 'PRO') score += 50;
  if (user.plan === 'ENTERPRISE') score += 100;

  // 2. Verificações de Segurança (+15 pontos cada)
  if (user.emailVerified) score += 15;
  if (user.cpf) score += 15;
  if (user.telefone) score += 15;

  // 3. Status de Vendedor (+20 pontos)
  const isSeller = user.userRoles === 'VENDEDOR';
  if (isSeller) score += 20;

  // 4. Poder das Lojas
  if (user.stores && user.stores.length > 0) {
    // +10 pontos por cada loja existente
    score += user.stores.length * 10;

    // +20 pontos se pelo menos uma loja tiver CNPJ (Verificada)
    const hasCnpjStore = user.stores.some((s: any) => s.cnpj);
    if (hasCnpjStore) score += 20;
  }

  // --- DEFINIÇÃO DOS TÍTULOS BASEADO NO SCORE ---
  if (score >= 200) return { label: "Elite VIP", color: "text-amber-400", bg: "bg-amber-400/10", score };
  if (score >= 150) return { label: "Membro Ouro", color: "text-yellow-500", bg: "bg-yellow-500/10", score };
  if (score >= 100) return { label: "Membro Prime", color: "text-blue-400", bg: "bg-blue-400/10", score };
  if (score >= 50) return { label: "Membro Verificado", color: "text-emerald-400", bg: "bg-emerald-400/10", score };

  return { label: "Membro Comum", color: "text-slate-400", bg: "bg-slate-400/10", score };
}

/**
 * Converte um número ou string numérica para Moeda Brasileira (R$)
 */
export const formatCurrency = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(amount)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

/**
 * Formata uma string de números para o padrão de CNPJ
 * Ex: 12345678000199 -> 12.345.678/0001-99
 */
export const formatCNPJ = (cnpj: string | null): string => {
  if (!cnpj) return 'Não informado';

  // Remove qualquer caractere que não seja número
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) return cnpj; // Retorna o original se for inválido

  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

/**
 * Remove formatação para salvar no banco (opcional)
 * Ex: 12.345.678/0001-99 -> 12345678000199
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// src/lib/utils.ts ou formatters.ts

/**
 * Formata uma data (Date ou string ISO) para o padrão brasileiro
 * Ex: 2024-02-06 -> 06/02/2024
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "--/--/----";

  // Converte para objeto Date se for string (vindo do banco/JSON)
  const d = typeof date === 'string' ? new Date(date) : date;

  // Verifica se a data é válida
  if (isNaN(d.getTime())) return "Data inválida";

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Transforma a primeira letra em maiúscula e o restante em minúscula.
 * Ex: "ROXO" -> "Roxo", "verde" -> "Verde"
 */
export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text) return "";

  const trimmed = text.trim();
  if (trimmed.length === 0) return "";

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

// 1. Defina a interface para que o TS saiba o formato das cores
interface ColorClasses {
  bg: string;
  shadow: string;
  text: string;
}

export const getBrandColorClasses = (colorName: string | null | undefined): ColorClasses => {
  // 2. Adicione explicitamente o tipo Record<string, ColorClasses>
  const colorMap: Record<string, ColorClasses> = {
    "azul": {
      bg: "bg-blue-600",
      shadow: "shadow-blue-500/40",
      text: "text-blue-600"
    },
    "roxo": {
      bg: "bg-purple-600",
      shadow: "shadow-purple-500/40",
      text: "text-purple-600"
    },
    "verde": {
      bg: "bg-emerald-600",
      shadow: "shadow-emerald-500/40",
      text: "text-emerald-600"
    },
    // 3. OBRIGATÓRIO: Adicione a chave default aqui dentro
    "default": {
      bg: "bg-slate-900",
      shadow: "shadow-slate-500/40",
      text: "text-slate-900"
    }
  };

  // Normaliza o nome da cor
  const key = colorName?.trim().toLowerCase() || "default";

  // Agora o TS não vai reclamar, pois 'default' existe no mapeamento
  return colorMap[key] || colorMap.default;
};

