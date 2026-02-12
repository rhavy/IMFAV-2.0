import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/groups/members - Adicionar usuário a um grupo
export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, groupId } = body;

        if (!userId || !groupId) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                users: {
                    connect: { id: userId }
                }
            }
        });

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error("Erro ao adicionar membro ao grupo:", error);
        return NextResponse.json({ error: "Erro ao adicionar membro" }, { status: 500 });
    }
}

// DELETE /api/groups/members - Remover usuário de um grupo
export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const groupId = searchParams.get("groupId");

        if (!userId || !groupId) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            }
        });

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error("Erro ao remover membro do grupo:", error);
        return NextResponse.json({ error: "Erro ao remover membro" }, { status: 500 });
    }
}
