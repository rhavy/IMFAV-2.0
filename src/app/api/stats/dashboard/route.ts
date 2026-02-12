import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const totalMembros = await prisma.user.count({
            where: {
                ativo: true,
                deletedAt: null
            }
        });

        // Simulação de crescimento (opcional para o futuro)
        const trend = "+1 este mês"; // Poderíamos calcular baseado no createdAt

        return NextResponse.json({
            count: totalMembros,
            trend: trend
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
