// src/lib/updatePerfilBio.ts
// TEMPORARIAMENTE DESABILITADO - Aguardando migração dos modelos legados para o novo schema
/*
import { prisma } from "@/lib/prisma";

type Tabelas = "User" | "Carteira" | "Cartao" | "Cupom" | "Produto" | "Pedido";

type ValorPermitido = string | number | boolean;

const camposPermitidosPorTabela: Record<Tabelas, readonly string[]> = {
  User: ["name", "email", "emailVerified", "image", "telefone", "endereco", "cpfcnpj", "role", "plan"],
  Carteira: ["saldoDisponivel", "saldoMoedas", "valorMoedasEmReais"],
  Cartao: ["final", "brand", "exp", "principal"],
  Cupom: ["code", "desc", "expira", "ativo"],
  Produto: ["title", "price", "oldPrice", "image", "rating", "soldCount", "freeShipping", "sku", "estoque", "categoria"],
  Pedido: ["valor", "status"],
};

const modeloPrisma: Record<Tabelas, any> = {
  User: prisma.user,
  Carteira: prisma.carteira,
  Cartao: prisma.cartao,
  Cupom: prisma.cupom,
  Produto: prisma.produto,
  Pedido: prisma.pedido,
};

// Tipos esperados por campo
const tiposEsperadosPorCampo: Record<Tabelas, Record<string, "string" | "number" | "boolean" | "date">> = {
  User: {
    name: "string",
    email: "string",
    emailVerified: "boolean",
    image: "string",
    telefone: "string",
    endereco: "string",
    cpfcnpj: "string",
    role: "string",
    plan: "string",
  },
  Carteira: {
    saldoDisponivel: "number",
    saldoMoedas: "number",
    valorMoedasEmReais: "number",
  },
  Cartao: {
    final: "string",
    brand: "string",
    exp: "string",
    principal: "boolean",
  },
  Cupom: {
    code: "string",
    desc: "string",
    expira: "date",
    ativo: "boolean",
  },
  Produto: {
    title: "string",
    price: "number",
    oldPrice: "number",
    image: "string",
    rating: "number",
    soldCount: "number",
    freeShipping: "boolean",
    sku: "string",
    estoque: "number",
    categoria: "string",
  },
  Pedido: {
    valor: "number",
    status: "string",
  },
};

// Função para converter valor para o tipo esperado
function converterValor(valor: string, tipo: "string" | "number" | "boolean" | "date"): ValorPermitido | Date {
  switch (tipo) {
    case "number":
      const num = Number(valor);
      if (isNaN(num)) throw new Error(`Valor "${valor}" não é um número válido.`);
      return num;
    case "boolean":
      if (valor === "true") return true;
      if (valor === "false") return false;
      throw new Error(`Valor "${valor}" não é um booleano válido.`);
    case "date":
      const date = new Date(valor);
      if (isNaN(date.getTime())) throw new Error(`Valor "${valor}" não é uma data válida.`);
      return date;
    default:
      return valor;
  }
}

export async function atualizarCampoExistente(
  tabela: Tabelas,
  campo: string,
  valor: string,
  userId: string
) {
  const camposPermitidos = camposPermitidosPorTabela[tabela];
  const tipoEsperado = tiposEsperadosPorCampo[tabela]?.[campo];

  if (!camposPermitidos.includes(campo)) {
    throw new Error(`O campo "${campo}" não é permitido na tabela "${tabela}".`);
  }

  if (!tipoEsperado) {
    throw new Error(`Tipo esperado não definido para o campo "${campo}" na tabela "${tabela}".`);
  }

  const model = modeloPrisma[tabela];
  const where: Record<string, any> =
    tabela === "User"
      ? { id: userId }
      : { userId };

  try {
    const valorConvertido = converterValor(valor, tipoEsperado);

    const registroExistente = await model.findUnique({ where });

    if (!registroExistente) {
      // 🆕 Criação de novo registro
      const dadosCriacao: Record<string, any> = {
        ...where,
        [campo]: valorConvertido,
      };

      const novoRegistro = await model.create({ data: dadosCriacao });

      return {
        data: { [campo]: novoRegistro[campo] },
        error: null,
        created: true,
      };
    }

    // ✏ Atualização de campo existente
    const result = await model.update({
      where,
      data: { [campo]: valorConvertido },
    });

    return {
      data: { [campo]: result[campo] },
      error: null,
      created: false,
    };

  } catch (err: unknown) {
    console.error(`[ERRO] Falha ao atualizar/criar campo "${campo}" na tabela "${tabela}" para o usuário "${userId}":`, err);

    return {
      data: null,
      error: "Erro interno ao atualizar ou criar valor no banco de dados.",
    };
  }
}
*/

export { }
