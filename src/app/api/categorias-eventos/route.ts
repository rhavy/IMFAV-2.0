import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categorias = await prisma.categoriaEvento.findMany({
            include: {
                eventos: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return NextResponse.json(categorias);
    } catch (error) {
        console.error("Erro na API GET /api/categorias-eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao buscar categorias." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, descricao } = body;

        if (!name) {
            return NextResponse.json({ error: "O nome da categoria é obrigatório." }, { status: 400 });
        }

        // Verificar se já existe uma categoria com o mesmo nome
        const existingCategoria = await prisma.categoriaEvento.findUnique({
            where: { name: name }
        });

        if (existingCategoria) {
            return NextResponse.json({ error: "Já existe uma categoria com este nome." }, { status: 400 });
        }

        const novaCategoria = await prisma.categoriaEvento.create({
            data: {
                name,
                descricao: descricao || null
            }
        });

        return NextResponse.json(novaCategoria, { status: 201 });
    } catch (error) {
        console.error("Erro na API POST /api/categorias-eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao criar categoria." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "O ID da categoria é obrigatório." }, { status: 400 });
        }

        const body = await request.json();
        const { name, descricao } = body;

        if (!name) {
            return NextResponse.json({ error: "O nome da categoria é obrigatório." }, { status: 400 });
        }

        // Verificar se já existe outra categoria com o mesmo nome
        const existingCategoria = await prisma.categoriaEvento.findFirst({
            where: {
                name: name,
                id: { not: id } // Não contar a própria categoria
            }
        });

        if (existingCategoria) {
            return NextResponse.json({ error: "Já existe uma categoria com este nome." }, { status: 400 });
        }

        const categoriaAtualizada = await prisma.categoriaEvento.update({
            where: { id },
            data: {
                name,
                descricao: descricao || null
            }
        });

        return NextResponse.json(categoriaAtualizada);
    } catch (error) {
        console.error("Erro na API PUT /api/categorias-eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao atualizar categoria." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "O ID da categoria é obrigatório." }, { status: 400 });
        }

        // Verificar se a categoria está sendo usada em algum evento
        const eventosComCategoria = await prisma.eventos.count({
            where: { categoriaId: id }
        });

        if (eventosComCategoria > 0) {
            return NextResponse.json({ 
                error: "Não é possível excluir esta categoria pois está sendo usada em eventos." 
            }, { status: 409 });
        }

        await prisma.categoriaEvento.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Categoria excluída com sucesso." }, { status: 200 });
    } catch (error) {
        console.error("Erro na API DELETE /api/categorias-eventos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao excluir categoria." }, { status: 500 });
    }
}