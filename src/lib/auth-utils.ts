import { auth } from "./auth";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Obtém a sessão do servidor e as roles do usuário diretamente do banco de dados.
 * Útil para Server Components e Layouts.
 */
export async function getServerSessionWithRoles() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return null;
    }

    // Busca as roles do usuário
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { userRoles: true }
    });

    return {
        ...session,
        user: {
            ...session.user,
            roles: user ? [user.userRoles] : []
        }
    };

}
