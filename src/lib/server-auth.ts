import { auth } from "./auth";

// Função para obter a sessão do servidor
export async function getServerSession() {
  // Esta função tentará obter a sessão do usuário a partir do contexto do servidor
  // O Better Auth fornece métodos para obter a sessão no servidor
  try {
    // Obter o cabeçalho de autorização ou cookies da requisição
    // Esta implementação dependerá do contexto exato em que é chamada
    // Por enquanto, retornaremos uma função que pode ser usada para obter a sessão
    
    // Em uma rota do Next.js, você pode obter os headers assim:
    // import { headers } from 'next/headers'
    // const requestHeaders = headers()
    // const session = await auth.api.getSession({ headers: requestHeaders })
    
    return null; // Placeholder - a implementação real dependerá do contexto
  } catch (error) {
    console.error("Erro ao obter sessão do servidor:", error);
    return null;
  }
}

// Exportar a função de validação de sessão (aceita Request ou Headers)
export async function validateSession(requestOrHeaders?: Request | Headers | undefined) {
  try {
    // Compatível com ambas as formas: quando passada a Request (rota) ou Headers (server components)
    let hdrs: Headers | undefined;
    if (!requestOrHeaders) {
      hdrs = undefined;
    } else if ((requestOrHeaders as Request).headers && typeof (requestOrHeaders as Request).headers.get === 'function') {
      hdrs = (requestOrHeaders as Request).headers as Headers;
    } else {
      hdrs = requestOrHeaders as Headers;
    }

    const session = hdrs ? await auth.api.getSession({ headers: hdrs }) : await auth.api.getSession();
    return session;
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    return null;
  }
}