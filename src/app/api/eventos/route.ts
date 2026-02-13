import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/image-upload";
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const evento = await prisma.eventos.findUnique({
                where: { id },
                include: {
                    user_eventosdirigentes: true,
                    convidados: {
                        include: {
                        }
                    },
                    cadastradoPor: true,
                    categoria: true, // Inclui a categoria do evento
                },
            });
            if (!evento) {
                return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
            }
            return NextResponse.json(evento);
        } else {
            const eventos = await prisma.eventos.findMany({
                include: {
                    user_eventosdirigentes: true,
                    convidados: {
                        include: {
                        }
                    },
                    cadastradoPor: true,
                    categoria: true, // Inclui a categoria do evento
                },
                orderBy: {
                    dataInicio: 'asc',
                },
            });
            return NextResponse.json(eventos);
        }
    } catch (error) {
        console.error("Erro na API GET /api/eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao buscar eventos." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            descricao,
            tema,
            origem,
            dataInicio,
            dataFim,
            horaInicio,
            horaFim,
            libracao,
            dirigentesIds = [], // Default to empty array
            convidadosData = [], // Default to empty array
            tipo,
            categoriaId, // ID da categoria do evento
            idcadastrado, // ID of the user who registered the event
        } = body;

        if (!name || !descricao || !dataInicio || !dataFim || !horaInicio || !horaFim || !categoriaId || !idcadastrado) {
            return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
        }

        // Validate idcadastrado
        const cadastradoPorUser = await prisma.user.findUnique({ where: { id: idcadastrado } });
        if (!cadastradoPorUser) {
            return NextResponse.json({ error: `Usuário com ID ${idcadastrado} (cadastrado por) não encontrado.` }, { status: 400 });
        }

        // Validate dirigentesIds
        if (dirigentesIds.length > 0) {
            const existingDirigentes = await prisma.user.findMany({
                where: { id: { in: dirigentesIds } },
                select: { id: true },
            });
            const foundDirigentesIds = new Set(existingDirigentes.map((u) => u.id));
            const missingDirigentes = dirigentesIds.filter((id: string) => !foundDirigentesIds.has(id));
            if (missingDirigentes.length > 0) {
                return NextResponse.json({ error: `Dirigente(s) com ID(s) ${missingDirigentes.join(', ')} não encontrado(s).` }, { status: 400 });
            }
        }

        // Validate convidadosData uncao
        for (const convidado of convidadosData) {
            // uncao validation is handled by Prisma enum, but we can add a check here if needed
        }

        const newEvento = await prisma.eventos.create({
            data: {
                name,
                descricao,
                tema,
                origem,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                horaInicio,
                horaFim,
                categoria: categoriaId ? { connect: { id: categoriaId } } : undefined, // Conectando a categoria
                cadastradoPor: {
                    connect: { id: idcadastrado },
                },
                user_eventosdirigentes: {
                    connect: dirigentesIds.map((id: string) => ({ id })),
                },
                convidados: {
                    create: await Promise.all(convidadosData.map(async (convidado: any) => {
                        let imagemPath = null;
                        if (convidado.imagem) {
                            // Gerar nome único para a imagem
                            const ext = convidado.imagem.split(';')[0].split('/')[1]; // Extrai extensão
                            const fileName = `${randomUUID()}.${ext}`;
                            imagemPath = await saveImage(convidado.imagem, fileName);
                        }

                        return {
                            name: convidado.name,
                            uncao: convidado.uncao,
                            funcao: convidado.funcao,
                            imagem: imagemPath,
                        };
                    })),
                },
            },
            include: {
                user_eventosdirigentes: true,
                convidados: true,
                cadastradoPor: true,
                categoria: true, // Inclui a categoria do evento
            },
        });

        return NextResponse.json(newEvento, { status: 201 });
    } catch (error: any) {
        console.error("Erro na API POST /api/eventos:", error);
        // More specific error handling based on Prisma Client errors
        if (error.code === 'P2025') { // Record not found (e.g., trying to connect a non-existent record)
            return NextResponse.json({ error: "Erro de relacionamento: uma entidade relacionada não foi encontrada. Verifique os IDs de usuários." }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro interno no servidor ao criar evento." + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id: string | null = searchParams.get('id');
        const body = await request.json();
        const {
            name,
            descricao,
            tema,
            origem,
            dataInicio,
            dataFim,
            horaInicio,
            horaFim,
            libracao,
            dirigentesIds, // Array of User IDs
            convidadosData, // Array of { id, name, uncao, funcao, imagem, aprovacao } for existing, or new for creation
            tipo,
            CategoriaId, // ID da categoria do evento
        } = body;

        if (!id) {
            return NextResponse.json({ error: "O ID do evento é obrigatório para atualização." }, { status: 400 });
        }

        const currentEvento = await prisma.eventos.findUnique({
            where: { id },
            include: { user_eventosdirigentes: true, convidados: true },
        });

        if (!currentEvento) {
            return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
        }

        // Handle Dirigentes (connect/disconnect)
        const existingDirigentesIds = currentEvento.user_eventosdirigentes.map((d) => d.id);
        const dirigeantsToConnect = dirigentesIds?.filter((dId: string) => !existingDirigentesIds.includes(dId)) || [];
        const dirigeantsToDisconnect = existingDirigentesIds.filter((dId) => !dirigentesIds?.includes(dId));

        // Handle Convidados (create/update/delete)
        const convidadosUpdates = await Promise.all(convidadosData?.map(async (convidado: any) => {
            if (convidado.id) {
                // Existing convidado: update
                let imagemPath = undefined;
                if (convidado.imagem) {
                    // Gerar nome único para a imagem
                    const ext = convidado.imagem.split(';')[0].split('/')[1]; // Extrai extensão
                    const fileName = `${randomUUID()}.${ext}`;
                    imagemPath = await saveImage(convidado.imagem, fileName);
                }

                return prisma.convidado.update({
                    where: { id: convidado.id },
                    data: {
                        name: convidado.name,
                        uncao: convidado.uncao,
                        funcao: convidado.funcao,
                        ...(imagemPath !== undefined && { imagem: imagemPath }), // Atualizar imagem apenas se fornecida
                    },
                });
            } else {
                // New convidado: create
                let imagemPath = null;
                if (convidado.imagem) {
                    // Gerar nome único para a imagem
                    const ext = convidado.imagem.split(';')[0].split('/')[1]; // Extrai extensão
                    const fileName = `${randomUUID()}.${ext}`;
                    imagemPath = await saveImage(convidado.imagem, fileName);
                }

                return prisma.convidado.create({
                    data: {
                        name: convidado.name,
                        uncao: convidado.uncao,
                        funcao: convidado.funcao,
                        imagem: imagemPath,
                        aprovacao: convidado.aprovacao || false,
                        evento: {
                            connect: { id: currentEvento.id },
                        },
                    },
                });
            }
        }) || []);

        // Delete convidados removed from the list
        const convidadosToDelete = currentEvento.convidados.filter(
            (existingConvidado) =>
                !convidadosData?.some((c: any) => c.id === existingConvidado.id)
        );

        const deleteConvidadosPromises = convidadosToDelete.map((convidado) =>
            prisma.convidado.delete({ where: { id: convidado.id } })
        );

        // Execute all convidado operations
        await prisma.$transaction([...convidadosUpdates, ...deleteConvidadosPromises]);

        const updatedEvento = await prisma.eventos.update({
            where: { id: id },
            data: {
                name: name || currentEvento.name,
                descricao: descricao || currentEvento.descricao,
                tema: tema || currentEvento.tema,
                origem: origem || currentEvento.origem,
                dataInicio: dataInicio ? new Date(dataInicio) : currentEvento.dataInicio,
                dataFim: dataFim ? new Date(dataFim) : currentEvento.dataFim,
                horaInicio: horaInicio || currentEvento.horaInicio,
                horaFim: horaFim || currentEvento.horaFim,
                libracao: libracao !== undefined ? libracao : currentEvento.libracao,
                categoria: CategoriaId !== undefined ? { connect: { id: CategoriaId } } : undefined,
                user_eventosdirigentes: {
                    connect: dirigeantsToConnect.map((id: string) => ({ id })),
                    disconnect: dirigeantsToDisconnect.map((id: string) => ({ id })),
                },
            },
            include: {
                user_eventosdirigentes: true,
                convidados: true,
                cadastradoPor: true,
                categoria: true, // Inclui a categoria do evento
            },
        });

        return NextResponse.json(updatedEvento);
    } catch (error) {
        console.error("Erro na API PUT /api/eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao atualizar evento." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id: string | null = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "O ID do evento é obrigatório para exclusão." }, { status: 400 });
        }

        // Delete associated convidados first (if cascade is not set up, or to be explicit)
        await prisma.convidado.deleteMany({
            where: { eventoId: id },
        });

        await prisma.eventos.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Evento excluído com sucesso." }, { status: 200 });
    } catch (error) {
        console.error("Erro na API DELETE /api/eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao excluir evento." }, { status: 500 });
    }
}
