import { prisma } from "@/lib/prisma";

export async function cleanupDeletedAccounts() {
    const now = new Date();

    console.log(`[CRON] Iniciando limpeza de contas: ${now.toISOString()}`);

    try {
        // 1. Busca usuários que já passaram do período de 30 dias
        const usersToDelete = await prisma.user.findMany({
            where: {
                ativo: false,
                scheduledDeletion: {
                    lte: now, // menor ou igual a agora
                },
            },
            select: { id: true, email: true }
        });

        if (usersToDelete.length === 0) {
            console.log("[CRON] Nenhuma conta para exclusão definitiva hoje.");
            return;
        }

        for (const user of usersToDelete) {
            // 2. Exclusão em cascata (O Prisma cuidará se configurado no schema, 
            // caso contrário, você deleta as relações manualmente aqui)
            await prisma.user.delete({
                where: { id: user.id }
            });

            console.log(`[CRON] Conta ${user.email} excluída permanentemente.`);
        }

        console.log(`[CRON] Limpeza concluída: ${usersToDelete.length} contas removidas.`);
    } catch (error) {
        console.error("[CRON] Erro durante a limpeza de contas:", error);
    }
}