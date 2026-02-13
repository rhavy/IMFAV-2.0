import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const logs = await prisma.log.findMany({
            where: { entityId: params.userId },
            orderBy: { performedAt: 'desc' }
        });
        
        // Desserializar os campos oldValue e newValue se eles forem strings JSON
        const processedLogs = logs.map(log => {
            let parsedOldValue = log.oldValue;
            let parsedNewValue = log.newValue;
            
            try {
                if (typeof log.oldValue === 'string') {
                    parsedOldValue = JSON.parse(log.oldValue);
                }
            } catch (e) {
                console.warn('Falha ao desserializar oldValue:', e);
            }
            
            try {
                if (typeof log.newValue === 'string') {
                    parsedNewValue = JSON.parse(log.newValue);
                }
            } catch (e) {
                console.warn('Falha ao desserializar newValue:', e);
            }
            
            return {
                ...log,
                oldValue: parsedOldValue,
                newValue: parsedNewValue
            };
        });
        
        return NextResponse.json(processedLogs);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
    }
}