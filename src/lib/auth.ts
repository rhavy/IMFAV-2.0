import { betterAuth } from "better-auth";
import { prisma } from "./prisma"
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            planId: {
                type: "number",
                required: false,
                defaultValue: 1
            },
            cpf: {
                type: "string",
                required: false,
            },
            userRoles: {
                type: "string",
                required: false,
                defaultValue: "CLIENTE"
            },
            sexo: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                defaultValue: "ATIVO",
            },
            deletedAt: {
                type: "date",
                required: false,
            },
            scheduledDeletion: {
                type: "date",
                required: false,
            },
            motivoSaida: {
                type: "string",
                required: false,
            },
            uncao: {
                type: "string",
                required: false,
            },
            cargoId: {
                type: "string",
                required: false,
            }
        }
    },

    plugins: [
        {
            id: "verify-active-user",
            hooks: {
                before: [
                    {
                        matcher: (context: any) => context.path?.includes("sign-in") ?? false,
                        handler: async (context: any) => {
                            const body = (context.body || {}) as { email?: string };
                            if (!body?.email) return;

                            // Busca o utilizador com os campos necessários para a lógica
                            const user = await prisma.user.findUnique({
                                where: { email: body.email },
                                select: {
                                    id: true,
                                    status: true,
                                    scheduledDeletion: true
                                }
                            });

                            // Se o utilizador estiver desativado (status !== "ATIVO")
                            if (user && user.status !== "ATIVO") {
                                const agora = new Date();

                                // Verifica se ainda está no Grace Period (30 dias)
                                if (user.scheduledDeletion && user.scheduledDeletion > agora) {
                                    // REATIVAÇÃO AUTOMÁTICA:
                                    // Limpamos os dados de suspensão para permitir o login
                                    await prisma.user.update({
                                        where: { id: user.id },
                                        data: {
                                            status: "ATIVO",
                                            deletedAt: null,
                                            scheduledDeletion: null,
                                            motivoSaida: null
                                        }
                                    });

                                    console.log(`[AUTH] Conta ${body.email} reativada com sucesso.`);
                                } else {
                                    // Se o prazo de 30 dias expirou
                                    throw new Error("Esta conta foi desativada permanentemente e não pode ser reativada.");
                                }
                            }
                        },
                    },
                ],
            },
        },
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
});