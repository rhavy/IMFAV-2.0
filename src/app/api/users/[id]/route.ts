import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const logs = await prisma.log.findMany({
            where: { entityId: params.id },
            orderBy: { performedAt: 'desc' }
        });

        // Buscamos os nomes de todos os administradores que aparecem nos logs
        const adminIds = [...new Set(logs.map(log => log.performedBy))];
        const admins = await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true }
        });

        const adminMap = Object.fromEntries(admins.map(a => [a.id, a.name]));

        // Mesclamos o nome do admin no objeto de log
        const logsWithNames = logs.map(log => ({
            ...log,
            performedByName: adminMap[log.performedBy] || "Sistema/Admin"
        }));

        return NextResponse.json(logsWithNames);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
    }
}