import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                cargo: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Erro na API GET /api/users:", error);
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

        // 2. Busca o estado atual do usuário para o histórico (Log) e para validações
        const existingUser = await prisma.user.findUnique({
            where: { id },
            include: {
                cargo: true
            }
        });

        if (!existingUser) {
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
                dataToUpdate = {};
                
                // Atribuir campos apenas se forem válidos
                if (updates.name !== undefined && updates.name !== null) {
                    dataToUpdate.name = updates.name;
                }
                if (updates.email !== undefined && updates.email !== null) {
                    // Verificar se o email já está sendo usado por outro usuário
                    if (updates.email !== existingUser.email) {
                        const existingEmail = await prisma.user.findUnique({
                            where: { email: updates.email }
                        });
                        
                        if (existingEmail) {
                            return NextResponse.json({ 
                                error: `O email ${updates.email} já está sendo usado por outro usuário.` 
                            }, { status: 400 });
                        }
                    }
                    dataToUpdate.email = updates.email;
                }
                if (updates.cpf !== undefined && updates.cpf !== null) {
                    dataToUpdate.cpf = updates.cpf;
                }
                if (updates.telefone !== undefined && updates.telefone !== null) {
                    dataToUpdate.telefone = updates.telefone;
                }
                if (updates.sexo !== undefined && updates.sexo !== null) {
                    // Validar enum de gênero
                    const validGenders = ['MASCULINO', 'FEMININO'];
                    if (validGenders.includes(updates.sexo.toUpperCase())) {
                        dataToUpdate.sexo = updates.sexo.toUpperCase();
                    } else if (updates.sexo === '' || updates.sexo === null) {
                        dataToUpdate.sexo = null;
                    }
                }
                if (updates.uncao !== undefined && updates.uncao !== null) {
                    // Validar enum de unção
                    const validUncoes = ['PASTOR', 'OBREIRO', 'DIACONO', 'EVANGELISTA', 'PRESBITERO', 'MISSIONARIO'];
                    if (validUncoes.includes(updates.uncao.toUpperCase())) {
                        dataToUpdate.uncao = updates.uncao.toUpperCase();
                    } else if (updates.uncao === '' || updates.uncao === null) {
                        dataToUpdate.uncao = null;
                    }
                }
                
                // Tratamento seguro da data de nascimento
                if (updates.nascimento) {
                    try {
                        const birthDate = new Date(updates.nascimento);
                        // Verificar se a data é válida
                        if (!isNaN(birthDate.getTime())) {
                            dataToUpdate.nascimento = birthDate;
                        } else {
                            console.warn("Data de nascimento inválida recebida:", updates.nascimento);
                        }
                    } catch (dateError) {
                        console.warn("Erro ao converter data de nascimento:", dateError);
                    }
                } else {
                    dataToUpdate.nascimento = null;
                }
                
                console.log("Campos a serem atualizados para UPDATE_PROFILE:", dataToUpdate);
                break;

            case "UPDATE_UNCAO": // Renamed from CHANGE_ROLE, now specifically for uncao
                dataToUpdate = {
                    uncao: updates.uncao === '' ? null : updates.uncao
                };
                break;

            case "ADD_USER_CARGO":
                if (!updates.cargoId) {
                    return NextResponse.json({ error: "ID do cargo é necessário para adicionar." }, { status: 400 });
                }
                dataToUpdate = {
                    cargo: {
                        connect: { id: updates.cargoId },
                    },
                };
                break;

            case "REMOVE_USER_CARGO":
                if (!updates.cargoId) {
                    return NextResponse.json({ error: "ID do cargo é necessário para remover." }, { status: 400 });
                }
                dataToUpdate = {
                    cargo: {
                        disconnect: { id: updates.cargoId },
                    },
                };
                break;

            case "VERIFY_UNCAO":
                dataToUpdate = {
                    uncaoVerified: true,
                };
                break;

            default:
                return NextResponse.json({ error: "Tipo de ação inválido." }, { status: 400 });
        }

        // 4. Executa a atualização no Banco de Dados (se dataToUpdate não estiver vazio)
        console.log("Dados para atualização:", { id, dataToUpdate, actionType });

        let finalUpdatedUser;
        if (Object.keys(dataToUpdate).length > 0) {
            try {
                finalUpdatedUser = await prisma.user.update({
                    where: { id },
                    data: dataToUpdate,
                    include: {
                        cargo: true
                    }
                });
            } catch (updateError: any) {
                console.error("Erro ao atualizar usuário:", updateError);
                console.error("Detalhes da tentativa de atualização:", { id, dataToUpdate, actionType });
                
                // Verificar se é um erro de relação (como tentar desconectar um cargo não conectado)
                if (updateError.code === 'P2025') {
                    // Registro não encontrado - pode ser tentativa de desconectar um cargo não conectado
                    return NextResponse.json({ 
                        error: `Erro de atualização: ${updateError.message}. Verifique se o registro existe e está conectado ao usuário.` 
                    }, { status: 400 });
                }
                
                // Outros erros do Prisma
                return NextResponse.json({ 
                    error: `Erro ao atualizar usuário: ${updateError.message}`,
                    errorCode: updateError.code,
                    errorMeta: updateError.meta
                }, { status: 500 });
            }
        } else {
            // If only UserCargo was modified, re-fetch the user to get updated relations
            finalUpdatedUser = await prisma.user.findUnique({
                where: { id },
                include: {
                    cargo: true
                }
            });
            if (!finalUpdatedUser) {
                return NextResponse.json({ error: "Usuário não encontrado após modificação de cargo." }, { status: 404 });
            }
        }

        // 5. Gera o Log de Auditoria
        const simplifiedOldUser = { id: existingUser.id, name: existingUser.name, email: existingUser.email, uncao: existingUser.uncao, status: existingUser.status };
        const simplifiedUpdatedUser = { id: finalUpdatedUser.id, name: finalUpdatedUser.name, email: finalUpdatedUser.email, uncao: finalUpdatedUser.uncao, status: finalUpdatedUser.status };

        await prisma.log.create({
            data: {
                action: actionType,
                entityType: "User",
                entityId: id,
                oldValue: JSON.stringify(simplifiedOldUser),
                newValue: JSON.stringify(simplifiedUpdatedUser),
                performedBy: performedByUserId || "Sistema/Admin",
                // Campos específicos de disciplina se existirem
                tempoDisciplina: actionType === "DISCIPLINE" ? updates?.tempo : null,
                motivo: actionType === "DISCIPLINE" ? updates?.motivo : null,
                observacao: updates?.obs || `Ação ${actionType} executada via painel.`
            }
        });

        return NextResponse.json(finalUpdatedUser);

    } catch (error: any) {
        console.error("Erro na API PATCH:", error);
        console.error("Detalhes do erro:", {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack
        });
        
        return NextResponse.json({ 
            error: `Erro interno no servidor ao atualizar: ${error?.message || 'Erro desconhecido'}`,
            errorCode: error?.code,
            errorMeta: error?.meta,
            details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        }, { status: 500 });
    }
}