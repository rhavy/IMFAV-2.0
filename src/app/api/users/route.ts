import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: { cargo: true }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, updates, actionType, performedByUserId } = body;

        // 1. Verificação de ID
        if (!id) {
            return NextResponse.json({ error: "ID do usuário é necessário." }, { status: 400 });
        }

        // 2. Busca o estado atual do usuário para o histórico (Log)
        const oldUser = await prisma.user.findUnique({
            where: { id },
            include: { cargo: true }
        });

        if (!oldUser) {
            return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
        }

        let dataToUpdate: any = {};

        // 3. Lógica por Tipo de Ação
        switch (actionType) {
            case "DISCIPLINE":
                dataToUpdate = {
                    status: "INATIVO", // Membro em disciplina fica inativo no sistema

                };
                break;

            case "REHABILITATE":
                dataToUpdate = {
                    status: "ATIVO",

                };
                break;

            case "RESTORE":
                dataToUpdate = {
                    status: "ATIVO",
                    scheduledDeletion: null,
                    motivoSaida: null
                };
                break;

            case "DELETE_USER":
                dataToUpdate = {
                    status: "DELETADO",
                    scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias para deleção real
                };
                break;

            case "UPDATE_PROFILE":
                // Filtramos apenas campos permitidos vindos do formulário
                dataToUpdate = {
                    name: updates.name,
                    email: updates.email,
                    cpf: updates.cpf,
                    telefone: updates.telefone,
                    sexo: updates.sexo,
                    uncao: updates.uncao,
                    cargo: updates.cargo,
                    nascimento: updates.nascimento ? new Date(updates.nascimento) : null
                };
                break;

            case "CHANGE_ROLE":
                dataToUpdate = {
                    cargo: updates.cargo
                };
                break;
            case "CHANGE_UNCAO":
                dataToUpdate = {
                    uncao: updates.uncao
                };
                break;

            default:
                return NextResponse.json({ error: "Tipo de ação inválido." }, { status: 400 });
        }

        // 4. Executa a atualização no Banco de Dados
        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: {
                cargo: true,
            }
        });

        // 5. Gera o Log de Auditoria
        const simplifiedOldUser = { id: oldUser.id, name: oldUser.name, email: oldUser.email, uncao: oldUser.uncao, status: oldUser.status };
        const simplifiedUpdatedUser = { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, uncao: updatedUser.uncao, status: updatedUser.status };

        await prisma.log.create({
            data: {
                action: actionType,
                entityType: "User",
                entityId: id,
                oldValue: simplifiedOldUser as any,
                newValue: simplifiedUpdatedUser as any,
                performedBy: performedByUserId || "Sistema/Admin",
                // Campos específicos de disciplina se existirem
                tempoDisciplina: actionType === "DISCIPLINE" ? updates?.tempo : null,
                motivo: actionType === "DISCIPLINE" ? updates?.motivo : null,
                observacao: updates?.obs || `Ação ${actionType} executada via painel.`
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("Erro na API PATCH:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao atualizar." }, { status: 500 });
    }
}