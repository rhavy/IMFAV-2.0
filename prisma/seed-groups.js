const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Criar Grupos
    const louvor = await prisma.group.upsert({
        where: { id: 'clov-1' },
        update: {},
        create: {
            id: 'clov-1',
            name: 'Ministério de Louvor',
            description: 'Responsável pela música nos cultos',
            color: 'blue-600'
        }
    });

    const jovens = await prisma.group.upsert({
        where: { id: 'cjov-1' },
        update: {},
        create: {
            id: 'cjov-1',
            name: 'Grupo de Jovens (Emerge)',
            description: 'Juventude da igreja',
            color: 'purple-600'
        }
    });

    const oracao = await prisma.group.upsert({
        where: { id: 'cora-1' },
        update: {},
        create: {
            id: 'cora-1',
            name: 'Círculo de Oração',
            description: 'Grupo de intercessão',
            color: 'emerald-600'
        }
    });

    // 2. Buscar o primeiro usuário (ou um específico)
    const user = await prisma.user.findFirst();

    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                groups: {
                    connect: [
                        { id: louvor.id },
                        { id: jovens.id }
                    ]
                }
            }
        });
        console.log(`Usuário ${user.name} conectado aos grupos: Louvor e Jovens.`);
    }

    console.log('Seed de grupos concluído!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
