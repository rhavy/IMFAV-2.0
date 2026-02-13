// api/igrejas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Check if a specific ID is requested

    // If a specific ID is provided in the query parameters, return that specific church
    if (id) {
        try {
            const igreja = await prisma.igreja.findUnique({
                where: { id },
                include: {
                    user_userigreja: true, // Members associated with the church
                    criadoPor: true, // User who created the church
                    _count: {
                        select: { user_userigreja: true } // Para obter contagem de membros se necessário
                    }
                },
            });
            if (!igreja) {
                return NextResponse.json({ error: "Igreja não encontrada." }, { status: 404 });
            }
            return NextResponse.json(igreja);
        } catch (error: any) {
            console.error("Erro na API GET /api/igrejas (busca específica):", error);
            return NextResponse.json({ error: "Erro interno no servidor ao buscar igreja específica." + error.message }, { status: 500 });
        }
    }

    // Otherwise, return all churches (for listing purposes)
    try {
        const igrejas = await prisma.igreja.findMany({
            include: {
                user_userigreja: true,
                criadoPor: true,
                _count: {
                    select: { user_userigreja: true } // Para obter contagem de membros se necessário
                }
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(igrejas);
    } catch (error: any) {
        console.error("Erro na API GET /api/igrejas (listagem):", error);
        return NextResponse.json({ error: "Erro interno no servidor ao buscar igrejas." + error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const criadoPorId = session?.user?.id;
    try {
        const body = await request.json();
        const {
            name,
            rua,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            pais,
            userIds = [], // Array of User IDs to associate as members
            criadoPorId, // ID of the user who created this church
        } = body;

        if (!name || !rua || !numero || !bairro || !cidade || !estado || !cep || !pais || !criadoPorId) {
            return NextResponse.json({ error: "Campos obrigatórios faltando para criar a igreja." }, { status: 400 });
        }

        // Validate criadoPorId
        const criadoPorUser = await prisma.user.findUnique({ where: { id: criadoPorId } });
        if (!criadoPorUser) {
            return NextResponse.json({ error: `Usuário com ID ${criadoPorId} (criador da igreja) não encontrado.` }, { status: 400 });
        }

        // Validate userIds (members)
        if (userIds.length > 0) {
            const existingUsers = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true },
            });
            const foundUserIds = new Set(existingUsers.map((u: any) => u.id));
            const missingUsers = userIds.filter((id: string) => !foundUserIds.has(id));
            if (missingUsers.length > 0) {
                return NextResponse.json({ error: `Usuário(s) com ID(s) ${missingUsers.join(', ')} não encontrado(s) para associar à igreja.` }, { status: 400 });
            }
        }

        const newIgreja = await prisma.igreja.create({
            data: {
                name,
                rua,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                pais,
                criadoPor: {
                    connect: { id: criadoPorId },
                },
                user_userigreja: {
                    connect: userIds.map((id: string) => ({ id })),
                },
            },
            include: {
                user_userigreja: true,
                criadoPor: true,
                _count: {
                    select: { user_userigreja: true } // Para obter contagem de membros se necessário
                }
            },
        });

        return NextResponse.json(newIgreja, { status: 201 });
    } catch (error: any) {
        console.error("Erro na API POST /api/igrejas:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Erro de relacionamento: uma entidade relacionada (usuário) não foi encontrada." }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro interno no servidor ao criar igreja." + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id: string | null = searchParams.get('id');
        const body = await request.json();
        const {
            name,
            rua,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            pais,
            userIds = [], // Array of User IDs to associate as members
        } = body;

        if (!id) {
            return NextResponse.json({ error: "O ID da igreja é obrigatório para atualização." }, { status: 400 });
        }

        const currentIgreja = await prisma.igreja.findUnique({
            where: { id },
            include: {
                user_userigreja: true,
                _count: {
                    select: { user_userigreja: true } // Para obter contagem de membros se necessário
                }
            },
        });

        if (!currentIgreja) {
            return NextResponse.json({ error: "Igreja não encontrada." }, { status: 404 });
        }

        // Handle User (members) connect/disconnect
        const existingUserIds = currentIgreja.user_userigreja.map((u: any) => u.id);
        const usersToConnect = userIds.filter((uId: string) => !existingUserIds.includes(uId));
        const usersToDisconnect = existingUserIds.filter((uId: string) => !userIds.includes(uId));

        // Validate new userIds (members)
        if (userIds.length > 0) {
            const existingUsers = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true },
            });
            const foundUserIds = new Set(existingUsers.map((u: any) => u.id));
            const missingUsers = userIds.filter((id: string) => !foundUserIds.has(id));
            if (missingUsers.length > 0) {
                return NextResponse.json({ error: `Usuário(s) com ID(s) ${missingUsers.join(', ')} não encontrado(s) para associar à igreja.` }, { status: 400 });
            }
        }

        const updatedIgreja = await prisma.igreja.update({
            where: { id: id },
            data: {
                name: name || currentIgreja.name,
                rua: rua || currentIgreja.rua,
                numero: numero || currentIgreja.numero,
                bairro: bairro || currentIgreja.bairro,
                cidade: cidade || currentIgreja.cidade,
                estado: estado || currentIgreja.estado,
                cep: cep || currentIgreja.cep,
                pais: pais || currentIgreja.pais,
                user_userigreja: {
                    connect: usersToConnect.map((id: string) => ({ id })),
                    disconnect: usersToDisconnect.map((id: string) => ({ id })),
                },
            },
            include: {
                user_userigreja: true,
                criadoPor: true,
                _count: {
                    select: { user_userigreja: true } // Para obter contagem de membros se necessário
                }
            },
        });

        return NextResponse.json(updatedIgreja);
    } catch (error: any) {
        console.error("Erro na API PUT /api/igrejas:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Erro de relacionamento: uma entidade relacionada (usuário) não foi encontrada." }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro interno no servidor ao atualizar igreja." + error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id: string | null = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "O ID da igreja é obrigatório para exclusão." }, { status: 400 });
        }

        await prisma.igreja.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Igreja excluída com sucesso." }, { status: 200 });
    } catch (error: any) {
        console.error("Erro na API DELETE /api/igrejas:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Igreja não encontrada para exclusão." }, { status: 404 });
        }
        // Handle cases where other records depend on this Igreja (e.g., foreign key constraint failure)
        if (error.code === 'P2003') { // Foreign key constraint failed
            return NextResponse.json({ error: "Não é possível excluir esta igreja pois existem usuários ou outros registros associados a ela." }, { status: 409 });
        }
        return NextResponse.json({ error: "Erro interno no servidor ao excluir igreja." + error.message }, { status: 500 });
    }
}
