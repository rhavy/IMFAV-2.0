import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            include: {
                _count: {
                    select: { users: true } // Isso preenche o campo group._count.users
                }
            }
        });
        return NextResponse.json(groups);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar grupos" }, { status: 500 });
    }
}