import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const logs = await prisma.log.findMany({
            where: { entityId: params.userId },
            orderBy: { performedAt: 'desc' }
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
    }
}