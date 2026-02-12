"use client";

import React, { useEffect, useState, useCallback } from 'react';
import ClienteMembrosGrupos from './_components/clienteMembros';

import { toast } from 'sonner';

export default function MembrosGruposPage() {
    // IMPORTANTE: Inicializar sempre como array vazio []
    const [groups, setGroups] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true); // Set loading to true before fetching
            const resGroups = await fetch("/api/groups");
            if (!resGroups.ok) console.error("Falha em /api/groups:", resGroups.status);

            const resMembers = await fetch("/api/users");
            if (!resMembers.ok) console.error("Falha em /api/users:", resMembers.status);

            if (!resGroups.ok || !resMembers.ok) {
                throw new Error(`Erro: Groups(${resGroups.status}) ou Users(${resMembers.status})`);
            }

            const dataGroups = await resGroups.json();
            const dataMembers = await resMembers.json();

            setGroups(dataGroups);
            setMembers(dataMembers);
        } catch (error: any) {
            console.error("Detalhe do Erro:", error.message);
            toast.error("Erro ao buscar dados", {
                description: "Não foi possível carregar os membros e grupos. A API pode estar indisponível."
            });
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        fetchData();
    }, [fetchData]); // `fetchData` is now a dependency

    return (
        // Passamos explicitamente os membros e grupos
        <ClienteMembrosGrupos
            groups={groups}
            members={members}
            loading={loading}
            refreshMembers={fetchData} // Pass the refresh function
        />
    );
}