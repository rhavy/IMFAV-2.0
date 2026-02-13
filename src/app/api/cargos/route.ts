import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cargos = await prisma.cargo.findMany();
        return NextResponse.json(cargos);
    } catch (error) {
        console.error("Erro na API GET /api/cargos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao buscar cargos." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "O nome do cargo é obrigatório." }, { status: 400 });
        }

        const newCargo = await prisma.cargo.create({
            data: {
                name: name,
            },
        });

        return NextResponse.json(newCargo, { status: 201 });
    } catch (error) {
        console.error("Erro na API POST /api/cargos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao criar cargo." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const { name } = body;

        if (!id) {
            return NextResponse.json({ error: "O ID do cargo é obrigatório para atualização." }, { status: 400 });
        }
        if (!name) {
            return NextResponse.json({ error: "O nome do cargo é obrigatório para atualização." }, { status: 400 });
        }

        const updatedCargo = await prisma.cargo.update({
            where: { id: id },
            data: {
                name: name,
            },
        });

        return NextResponse.json(updatedCargo);
    } catch (error) {
        console.error("Erro na API PUT /api/cargos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao atualizar cargo." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "O ID do cargo é obrigatório para exclusão." }, { status: 400 });
        }

        await prisma.cargo.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Cargo excluído com sucesso." }, { status: 200 });
    } catch (error) {
        console.error("Erro na API DELETE /api/cargos:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao excluir cargo." }, { status: 500 });
    }
}
