"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, Search, RotateCcw, MoreVertical,
    Edit3, Mail, Phone, Trash2, ShieldPlus,
    ShieldCheck, SearchX, X, AlertTriangle,
    FileText, ShieldX, Trash2Icon, User
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from 'next/link';
import { UncaoType, Genero } from '@prisma/client'; // Import enums
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

const formatName = (sexo: any, uncao: any, name: string, uncaoVerified: boolean) => {
    const titulos: { [key: string]: string } = {
        PASTOR: sexo === 'FEMININO' ? 'Pastora' : 'Pastor',
        OBREIRO: sexo === 'FEMININO' ? 'Obreira' : 'Obreiro',
        DIACONO: sexo === 'FEMININO' ? 'Diaconisa' : 'Diácono',
        EVANGELISTA: 'Evangelista',
        PRESBITERO: 'Presbítero',
        MISSIONARIO: sexo === 'FEMININO' ? 'Missionária' : 'Missionário',
    };
    const titulo = (uncaoVerified ? titulos[uncao] : "") || "";
    return `${titulo} ${name}`.trim().toLowerCase();
};

export default function ClienteMembrosGrupos({ groups = [], members = [], loading, refreshMembers }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const { user: authUser } = useAuth(); // Get authenticated user for performedByUserId
    const [selectedReason, setSelectedReason] = useState("");
    const [observation, setObservation] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS"); // New state for filter status
    const [filterCongregacao, setFilterCongregacao] = useState("TODOS"); // New state for congregation filter

    const BLOCKING_REASONS = [
        "Comportamento Inadequado",
        "Violação das Regras",
        "Inatividade Prolongada",
        "Solicitação do Próprio Membro",
        "Outros"
    ];

    // Estado único para gerenciar todos os modais de ação
    const [modalAction, setModalAction] = useState<{
        type: 'view' | 'edit' | 'delete' | 'uncao' | 'manage_cargos' | 'discipline' | null,
        member: any
    }>({ type: null, member: null });

    const [confirmationModal, setConfirmationModal] = useState<{
        type: 'rehabilitate' | 'restore' | null,
        member: any
    }>({ type: null, member: null });

    const [availableCargos, setAvailableCargos] = useState([]); // State to store all available cargos

    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const res = await fetch('/api/cargos');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableCargos(data);
                } else {
                    toast.error("Erro ao buscar cargos disponíveis.");
                }
            } catch (error) {
                console.error("Erro ao buscar cargos:", error);
                toast.error("Erro ao buscar cargos disponíveis.");
            }
        };
        fetchCargos();
    }, []);

    const userNamesMap = useMemo(() => {
        const map = new Map<string, string>();
        members.forEach((m: any) => map.set(m.id, m.name));
        if (authUser) {
            map.set(authUser.id, authUser.name);
        }
        return map;
    }, [members, authUser]);

    const handleDisciplineSubmit = async (formData: FormData) => {
        const data = {
            id: modalAction.member.id,
            actionType: "DISCIPLINE", // Deve bater com o switch no seu route.ts
            performedByUserId: authUser?.id, // ID do administrador logado
            updates: {
                tempo: formData.get("tempo"),
                motivo: formData.get("motivo"),
                obs: formData.get("obs"),
                terminaEm: formData.get("terminaEm"),
            }
        };

        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toast.success("Membro em disciplina", { description: "O log foi gerado com sucesso." });
                closeModals();
                refreshMembers(); // Recarregue os dados aqui
            } else {
                const errorData = await res.json();
                toast.error("Erro ao aplicar disciplina", { description: errorData.error || "Não foi possível completar a ação." });
            }
        } catch (error) {
            console.error("handleDisciplineSubmit - Erro ao aplicar disciplina:", error);
            toast.error("Erro ao aplicar disciplina");
        }
    };

    const closeModals = () => {
        setModalAction({ type: null, member: null });
        setSelectedReason(""); // Clear selected reason on modal close
        setObservation(""); // Clear observation on modal close
    };

    const filteredMembers = useMemo(() => {
        let currentMembers = members;

        // Apply search term filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            currentMembers = currentMembers.filter((m: any) =>
                m.name?.toLowerCase().includes(lowerTerm) ||
                m.email?.toLowerCase().includes(lowerTerm) ||
                m.uncao?.toLowerCase().includes(lowerTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== "TODOS") {
            currentMembers = currentMembers.filter((m: any) => {
                return m.status === filterStatus;
            });
        }

        // Apply congregation filter
        if (filterCongregacao !== "TODOS") {
            currentMembers = currentMembers.filter((m: any) => {
                return m.congregacao === filterCongregacao;
            });
        }

        return currentMembers;
    }, [searchTerm, members, filterStatus, filterCongregacao]);

    const handleWhatsAppClick = (telefone: string, nome: string) => {
        if (!telefone) {
            toast.error("Contato não disponível", {
                description: `O membro ${nome} não possui telefone cadastrado.`
            });
            return;
        }
        const num = telefone.replace(/\D/g, "");
        const texto = encodeURIComponent(`Paz do Senhor, ${nome}! Gostaria de tratar um assunto do ministério IMFAV.`);
        window.open(`https://wa.me/55${num}?text=${texto}`, "_blank");
    };

    const handleUpdateMember = async (memberId: string, updates: any, actionType: string) => {
        console.log("handleUpdateMember - Arguments:", { memberId, updates, actionType }); // Debug Log
        try {
            const response = await fetch("/api/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: memberId,
                    updates,
                    actionType,
                    performedByUserId: authUser?.id || "unknown", // Use authenticated user ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao atualizar membro");
            }

            toast.success("Membro atualizado com sucesso!", {
                description: `A ação "${actionType}" foi aplicada ao membro.`
            });
            refreshMembers(); // Refresh the list of members
            closeModals();
        } catch (error: any) {
            console.error("handleUpdateMember - Erro ao atualizar membro:", error); // Debug Log
            toast.error("Erro ao atualizar membro", {
                description: error.message || "Não foi possível completar a ação."
            });
        }
    };

    const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const updates: { [key: string]: any } = {};
        formData.forEach((value, key) => {
            if (key === "nascimento" && value) {
                updates[key] = new Date(value.toString()).toISOString();
            } else if (key === "uncao" || key === "sexo") {
                updates[key] = value.toString().toUpperCase();
            } else if (key === "congregacao") { // Handle congregacao separately to avoid toUpperCase
                updates[key] = value.toString();
            } else {
                updates[key] = value;
            }
        });

        // Remove empty strings for optional fields to avoid Prisma validation issues
        Object.keys(updates).forEach(key => {
            if (updates[key] === '') {
                updates[key] = null;
            }
        });
        console.log("handleEditSubmit - Prepared updates:", updates); // Debug Log
        await handleUpdateMember(modalAction.member.id, updates, "UPDATE_PROFILE");
    };

    const handleDeleteMember = async () => {
        if (!modalAction.member?.id) return;
        await handleUpdateMember(modalAction.member.id, { status: "DELETADO" }, "DELETE_USER");
    };

    // Função para Reabilitar (Remover Disciplina)
    const onRehabilitate = async (member: any) => {
        const promise = fetch('/api/users', {
            method: 'PATCH',
            body: JSON.stringify({
                id: member.id,
                actionType: "REHABILITATE",
                performedByUserId: "ADMIN_ID" // Substitua pelo ID real do admin
            })
        });

        toast.promise(promise, {
            loading: 'Reabilitando membro...',
            success: () => {
                refreshMembers();
                return `${member.name} foi reabilitado com sucesso!`;
            },
            error: 'Erro ao reabilitar membro.',
        });
    };

    // Função para Restaurar (Ativar membro deletado/inativo)
    const onRestore = async (member: any) => {
        const promise = fetch('/api/users', {
            method: 'PATCH',
            body: JSON.stringify({
                id: member.id,
                actionType: "RESTORE",
                performedByUserId: "ADMIN_ID"
            })
        });

        toast.promise(promise, {
            loading: 'Restaurando membro...',
            success: () => {
                refreshMembers();
                return `${member.name} está ativo novamente!`;
            },
            error: 'Erro ao restaurar membro.',
        });
    };

    const actionDisplayMap: { [key: string]: string } = {
        DELETE_USER: "Membro Bloqueado/Deletado",
        UPDATE_PROFILE: "Perfil Atualizado",
        CHANGE_ROLE: "Unção/Cargo Alterado",
        DISCIPLINE: "Disciplina Aplicada",
        REHABILITATE: "Membro Reabilitado",
        RESTORE: "Membro Restaurado",
        // Adicione outros tipos de ação conforme necessário
    };

    const handleRelatorio = async (member: any) => {
        try {
            const res = await fetch(`/api/users/log/${member.id}`);
            const logs = await res.json();

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const logHtml = logs.map((log: any) => {
                const actionText = actionDisplayMap[log.action] || log.action;

                const date = new Date(log.performedAt);
                const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                const formattedDate = `Dia ${datePart} às ${timePart}`;

                // o backend precisa fornecer o nome completo do usuário que realizou a ação,
                // em vez apenas do ID (performedByUserId).
                const performedByText = userNamesMap.get(log.performedBy) || log.performedBy;

                return `
                <div class="log-entry">
                    <div class="log-header">
                        <span class="action">${actionText}</span>
                        <span class="date">${formattedDate}</span>
                    </div>
                    <div class="log-content">
                        ${log.motivo ? `<p><strong>Motivo:</strong> ${log.motivo}</p>` : ''}
                        ${log.observacao ? `<p><strong>Observação:</strong> ${log.observacao}</p>` : ''}
                        <small>Realizado por: ${performedByText}</small>
                    </div>
                </div>
            `;
            }).join('');

            printWindow.document.write(`
            <html>
                <head>
                    <title>Relatório - ${member.name}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #334155; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .header-left h1 { text-transform: uppercase; margin: 0; color: #0f172a; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2; }
                        .header-left .membro-info { color: #64748b; font-size: 14px; margin-top: 8px; }
                        .header-left .membro-info strong { font-weight: 700; color: #1e293b; }
                        .header-right { text-align: right; }
                        .header-right .logo { height: 40px; } /* Ajuste o tamanho do seu logo */
                        .log-entry { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 15px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); page-break-inside: avoid; }
                        .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
                        .action { background: #e0f2fe; color: #0284c7; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; text-transform: uppercase; }
                        .date { color: #64748b; font-size: 13px; font-weight: 500; }
                        .log-content { margin-top: 8px; font-size: 14px; line-height: 1.6; }
                        .log-content p { margin: 6px 0; }
                        .log-content strong { color: #1e293b; }
                        .log-content small { display: block; margin-top: 15px; color: #94a3b8; font-size: 12px; font-weight: 500; border-top: 1px dashed #e2e8f0; padding-top: 10px; }
                        @media print {
                            body { padding: 0; background-color: #f8fafc; }
                            .header { border-bottom: 1px solid #cbd5e1; }
                            .log-entry { box-shadow: none; border-color: #cbd5e1; }
                            @page { margin: 2cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="header-left">
                            <h1>Histórico de Membresia</h1>
                            <div class="membro-info">
                                Membro: <strong>${member.name}</strong> | CPF: ${member.cpf || '---'} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div class="header-right">
                            <!-- Substitua pelo seu logo se tiver um URL acessível ou base64 -->
                            <!-- <img src="/path/to/your/logo.png" alt="IMFAV Logo" class="logo" /> -->
                        </div>
                    </div>
                    ${logHtml || '<p style="text-align: center; color: #94a3b8; padding: 40px; border: 1px dashed #e2e8f0; border-radius: 12px;">Nenhum registro encontrado.</p>'}
                    <script>
                        window.onload = () => {
                            window.print();
                            // Não feche a janela automaticamente, permita que o usuário visualize ou salve.
                            // setTimeout(() => window.close(), 500);
                        };
                    </script>
                </body>
            </html>
        `);
            printWindow.document.close();
        } catch (error) {
            toast.error("Erro ao gerar relatório");
        }
    };
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">IMFAV Management</p>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Membros <span className="text-slate-300 font-light">&</span> Grupos
                    </h1>
                </div>
            </header>

            {/* BARRA DE PESQUISA E TABELA */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-100">
                            <Users size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lista Geral</h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-[450px] group">
                            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${searchTerm ? 'text-blue-600' : 'text-slate-400'}`} size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Procurar por nome, unção ou cargo..."
                                className="w-full pl-14 pr-12 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-[200px] h-14 px-5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todos</SelectItem>
                                <SelectItem value="ATIVO">Ativos</SelectItem>
                                <SelectItem value="INATIVO">Inativos (Disciplina)</SelectItem>
                                <SelectItem value="BLOQUEADO">Bloqueados</SelectItem>
                                <SelectItem value="DELETADO">Excluídos</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterCongregacao} onValueChange={setFilterCongregacao}>
                            <SelectTrigger className="w-full md:w-[200px] h-14 px-5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner">
                                <SelectValue placeholder="Filtrar por Congregação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todas as Congregações</SelectItem>
                                <SelectItem value="SEDE">Sede</SelectItem>
                                <SelectItem value="VILA_VELHA">Vila Velha</SelectItem>
                                <SelectItem value="VITORIA">Vitória</SelectItem>
                                {/* Add more congregations as needed */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Identificação</th>
                                <th className="px-10 py-5">Status</th>
                                <th className="px-10 py-5">Função</th>
                                <th className="px-10 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member: any) => (
                                    <MemberRow
                                        key={member.id}
                                        member={member}
                                        onView={() => setModalAction({ type: 'view', member })}
                                        onEdit={() => setModalAction({ type: 'edit', member })}
                                        onDiscipline={() => setModalAction({ type: 'discipline', member })}
                                        onRehabilitate={onRehabilitate}
                                        onRestore={onRestore}
                                        onDelete={() => setModalAction({ type: 'delete', member })}
                                        onUncao={() => setModalAction({ type: 'uncao', member })}
                                        onManageCargos={() => setModalAction({ type: 'manage_cargos', member })}
                                        onWhatsApp={() => handleWhatsAppClick(member.telefone, member.name)}
                                        setConfirmationModal={setConfirmationModal}
                                        handleUpdateMember={handleUpdateMember} // Pass handleUpdateMember
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <SearchX size={64} />
                                            <p className="font-black uppercase tracking-widest text-sm">Sem resultados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- MODAIS DE GESTÃO --- */}

            {/* 1. MODAL DE VISUALIZAÇÃO (DETALHES) */}
            <Dialog open={modalAction.type === 'view'} onOpenChange={closeModals}>
                <DialogContent className="max-w-2xl bg-white rounded-[3rem] border-none p-0 overflow-hidden outline-none shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Detalhes do Membro</DialogTitle>
                        <DialogDescription>Perfil completo do membro</DialogDescription>
                    </DialogHeader>
                    {modalAction.member && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            {/* Capa do Modal */}
                            <div className="h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 relative shrink-0">
                                {/* Avatar container centralizado na borda */}
                                <div className="absolute -bottom-12 left-10">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-2xl">
                                            <AvatarImage src={modalAction.member.image || `https://avatar.vercel.sh/${modalAction.member.name}`} />
                                            <AvatarFallback className="text-2xl font-black bg-slate-100 text-slate-400">
                                                {modalAction.member.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Indicador de Status posicionado sobre o Avatar */}
                                        {modalAction.member.ativo && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative rounded-full h-5 w-5 bg-emerald-500 border-2 border-white shadow-sm"></span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 px-10 pb-10 space-y-8">
                                {/* Títulos e Cargos */}
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                        {modalAction.member.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">
                                            {modalAction.member.uncaoVerified ? modalAction.member.uncao : 'Membro'}
                                        </p>                                        <span className="text-slate-300">|</span>
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                                            {modalAction.member.cargo?.name || 'Membro'}
                                        </p>
                                        <span className="text-slate-300">|</span>
                                        <p className="text-blue-500 font-bold uppercase text-xs tracking-widest">
                                            {modalAction.member.congregacao || 'Membro'}
                                        </p>
                                    </div>
                                </div>

                                {/* Grid de Informações */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                                    <ModalInfo label="E-mail" value={modalAction.member.email} />
                                    <ModalInfo label="Telefone" value={modalAction.member.telefone || 'Não informado'} />
                                    <ModalInfo label="CPF" value={modalAction.member.cpf || 'Não informado'} />
                                    <ModalInfo label="Gênero" value={modalAction.member.sexo || 'Não informado'} />
                                    <ModalInfo label="Data de Nascimento" value={modalAction.member.nascimento ? new Date(modalAction.member.nascimento).toLocaleDateString('pt-BR') : 'Não informado'} />
                                    <ModalInfo label="Membro desde" value={new Date(modalAction.member.createdAt).toLocaleDateString('pt-BR')}
                                    />
                                    {/* Display blocking information if the member is inactive */}

                                </div>
                                <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                                    <Button
                                        onClick={() => handleRelatorio(modalAction.member)}
                                        className="flex-1 h-14 rounded-2xl bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-95 border-none gap-2"
                                    >
                                        <FileText size={18} /> Relatório de Logs
                                    </Button>
                                    <Button
                                        onClick={closeModals}
                                        className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all border-none"
                                    >
                                        Fechar Detalhes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 2. MODAL DE EDIÇÃO */}
            <Dialog open={modalAction.type === 'edit'} onOpenChange={closeModals}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-2xl outline-none overflow-hidden bg-white max-h-[90vh] flex flex-col">
                    {/* Header Fixo */}
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Edit3 size={18} />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    Editar Perfil do Membro
                                </DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-slate-500">
                                Campos obrigatórios estão marcados com os dados atuais de <span className="text-slate-900 font-bold">{modalAction.member?.name}</span>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Formulário com Scroll Interno se necessário */}
                    <div className="p-8 overflow-y-auto">
                        <form className="space-y-6" onSubmit={handleEditSubmit}>
                            {/* Seção 1: Identificação Básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                                    <input
                                        name="name"
                                        type="text"
                                        defaultValue={modalAction.member?.name}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={modalAction.member?.email}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CPF (Máscara Automática)</label>
                                    <input
                                        name="cpf"
                                        type="text"
                                        maxLength={14}
                                        placeholder="000.000.000-00"
                                        defaultValue={modalAction.member?.cpf}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, "");
                                            if (v.length <= 11) {
                                                v = v.replace(/(\={0})(\d{1,3})(\d{0,3})(\d{0,3})(\d{0,2})/, function (match, p1, p2, p3, p4, p5) {
                                                    return p2 + (p3 ? "." + p3 : "") + (p4 ? "." + p4 : "") + (p5 ? "-" + p5 : "");
                                                });
                                                e.target.value = v;
                                            }
                                        }}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Seção 2: Contato e Pessoal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone (Celular)</label>
                                    <input
                                        name="telefone"
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                        defaultValue={modalAction.member?.telefone}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, "");
                                            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                                            v = v.replace(/(\d)(\d{4})$/, "$1-$2");
                                            e.target.value = v;
                                        }}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Data de Nascimento</label>
                                    <input
                                        name="nascimento"
                                        type="date"
                                        defaultValue={modalAction.member?.nascimento ? new Date(modalAction.member.nascimento).toISOString().split('T')[0] : ''}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gênero</label>
                                    <select
                                        name="sexo"
                                        defaultValue={modalAction.member?.sexo || ''}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">Selecione</option>
                                        {Object.values(Genero).map((sexoOption) => (
                                            <option key={sexoOption} value={sexoOption}>{sexoOption}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unção (Eclesiástico)</label>
                                    <select
                                        name="uncao"
                                        defaultValue={modalAction.member?.uncao || ''}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">Selecione</option>
                                        {Object.values(UncaoType).map((uncaoOption) => (
                                            <option key={uncaoOption} value={uncaoOption}>{uncaoOption}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Congregação</label>
                                    <input
                                        name="congregacao"
                                        type="text"
                                        defaultValue={modalAction.member?.congregacao || ''}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                                        placeholder="Ex: Sede, Vila Velha"
                                    />
                                </div>

                            </div>
                            {/* Footer de Ações Fixo */}
                            <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                                <Button
                                    type="button"
                                    onClick={closeModals}
                                    variant="ghost"
                                    className="rounded-2xl font-bold text-slate-400"
                                >
                                    Descartar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold px-10 h-12 shadow-xl transition-all active:scale-95"
                                >
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            {/* 3. MODAL DE BLOQUEIO (Antigo Exclusão) */}
            <Dialog open={modalAction.type === 'delete'} onOpenChange={closeModals}>
                <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-md shadow-2xl outline-none">
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-full animate-bounce">
                            <AlertTriangle size={32} />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase text-slate-900">Confirmar Bloqueio</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500 pt-2">
                                Você tem certeza que deseja <strong>bloquear {modalAction.member?.name}</strong>? Ele(a) ficará inativo(a) no sistema.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="blockReasonSelect" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Motivo do Bloqueio</label>
                            <select
                                id="blockReasonSelect"
                                value={selectedReason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-all outline-none"
                            >
                                <option value="">Selecione um motivo</option>
                                {BLOCKING_REASONS.map((reason, index) => (
                                    <option key={index} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="blockObservation" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observações (Opcional)</label>
                            <textarea
                                id="blockObservation"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                placeholder="Adicione detalhes ou comentários sobre o bloqueio..."
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-all outline-none min-h-[80px]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            onClick={handleDeleteMember}
                            className="bg-rose-600 hover:bg-rose-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100 active:scale-95"
                        >
                            Sim, Deletar Membro
                        </Button>
                        <Button onClick={closeModals} variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 4. MODAL DE UNÇÃO */}
            <Dialog open={modalAction.type === 'uncao'} onOpenChange={closeModals}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-sm shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-slate-900">Alterar Unção</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">Defina a nova unção ministerial.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-6">
                        {Object.values(UncaoType).map(uncaoOption => (
                            <Button
                                key={uncaoOption}
                                variant="outline"
                                className="h-14 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                onClick={() => handleUpdateMember(modalAction.member.id, { uncao: uncaoOption }, "UPDATE_UNCAO")}
                            >
                                {uncaoOption}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE GERENCIAMENTO DE CARGOS */}
            <Dialog open={modalAction.type === 'manage_cargos'} onOpenChange={closeModals}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-lg shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-slate-900">Gerenciar Cargos</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Adicione ou remova cargos para <strong>{modalAction.member?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        {/* Cargos Atuais */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Cargos Atribuídos</p>
                            <div className="flex flex-wrap gap-2">
                                {modalAction.member?.cargo?.length > 0 ? (
                                    modalAction.member.cargo.map((c: any) => (
                                        <div key={c.id} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <span>{c.name}</span>
                                            <button
                                                onClick={() => handleUpdateMember(modalAction.member.id, { cargoId: c.id }, "REMOVE_USER_CARGO")}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Remover Cargo"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">Nenhum cargo atribuído.</p>
                                )}
                            </div>
                        </div>

                        {/* Adicionar Novo Cargo */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Adicionar Novo Cargo</p>
                            <div className="flex gap-2">
                                <Select
                                    onValueChange={(selectedCargoId) => {
                                        if (selectedCargoId && modalAction.member) {
                                            handleUpdateMember(
                                                modalAction.member.id,
                                                { cargoId: selectedCargoId },
                                                "ADD_USER_CARGO"
                                            );
                                        }
                                    }}
                                    value="" // Mantemos vazio para resetar após a seleção, simulando o comportamento anterior
                                >
                                    <SelectTrigger className="flex-1 h-auto px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-0 focus:border-slate-300 transition-all outline-none">
                                        <SelectValue placeholder="Selecione um cargo" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {availableCargos
                                            .filter((cargo: any) =>
                                                !modalAction.member?.cargo?.some((c: any) => c.id === cargo.id)
                                            )
                                            .map((cargo: any) => (
                                                <SelectItem key={cargo.id} value={cargo.id}>
                                                    {cargo.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                        <Button
                            type="button"
                            onClick={closeModals}
                            variant="ghost"
                            className="rounded-2xl font-bold text-slate-400 uppercase text-xs tracking-widest"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 5. MODAL DE DISCIPLINA */}
            <Dialog open={modalAction.type === 'discipline'} onOpenChange={closeModals}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-lg outline-none overflow-hidden bg-white">
                    <div className="bg-rose-50 p-8 border-b border-rose-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-600 rounded-lg text-white">
                                    <AlertTriangle size={18} />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-rose-900">
                                    Aplicar Disciplina
                                </DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-rose-700">
                                Você está aplicando uma medida disciplinar em <strong>{modalAction.member?.name}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form action={handleDisciplineSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tempo da Disciplina */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tempo (Ex: 3 meses)</label>
                                <input name="tempo" placeholder="Ex: 90 dias" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-rose-500/50 transition-all outline-none" />
                            </div>
                            {/* Data de Término da Disciplina */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Termina em (Opcional)</label>
                                <input name="terminaEm" type="date" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-rose-500/50 transition-all outline-none" />
                            </div>
                        </div>

                        {/* Motivo - Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Motivo Principal</label>
                            <select name="motivo" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                <option value="CONDUTA">Conduta Imprópria</option>
                                <option value="AUSENCIA">Ausência Injustificada</option>
                                <option value="DOUTRINA">Divergência Doutrinária</option>
                                <option value="OUTROS">Outros motivos</option>
                            </select>
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observações Internas (Log)</label>
                            <textarea name="obs" rows={3} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-rose-500/50 transition-all outline-none resize-none" placeholder="Detalhes sobre a decisão do conselho..." />
                        </div>

                        <DialogFooter className="gap-3">
                            <Button type="button" onClick={closeModals} variant="ghost" className="rounded-2xl font-bold">Cancelar</Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold px-8 shadow-lg shadow-rose-100">Confirmar Disciplina</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL DE CONFIRMAÇÃO GENÉRICO */}
            <Dialog open={!!confirmationModal.type} onOpenChange={() => setConfirmationModal({ type: null, member: null })}>
                <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-md shadow-2xl outline-none">
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-bounce">
                            {confirmationModal.type === 'rehabilitate' ? <ShieldCheck size={32} /> : <RotateCcw size={32} />}
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase text-slate-900">
                                {confirmationModal.type === 'rehabilitate' ? 'Confirmar Reabilitação' : 'Confirmar Restauração'}
                            </DialogTitle>
                            <DialogDescription className="font-medium text-slate-500 pt-2">
                                Você tem certeza que deseja {confirmationModal.type === 'rehabilitate' ?
                                    `reabilitar ${confirmationModal.member?.name}? Isso removerá qualquer disciplina e ativará o membro.` :
                                    `restaurar ${confirmationModal.member?.name}? Isso reativará o membro no sistema.`}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            onClick={() => {
                                if (confirmationModal.type === 'rehabilitate') {
                                    onRehabilitate(confirmationModal.member);
                                } else if (confirmationModal.type === 'restore') {
                                    onRestore(confirmationModal.member);
                                }
                                setConfirmationModal({ type: null, member: null }); // Close modal
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 active:scale-95"
                        >
                            Sim, {confirmationModal.type === 'rehabilitate' ? 'Reabilitar Membro' : 'Restaurar Membro'}
                        </Button>
                        <Button onClick={() => setConfirmationModal({ type: null, member: null })} variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// COMPONENTES AUXILIARES INTERNOS
function ModalInfo({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <p className="text-sm font-bold text-slate-800">{value}</p>
        </div>
    );
}

function MemberRow({ member, onView, onEdit, onDiscipline, onRehabilitate, onRestore, onDelete, onUncao, onManageCargos, onWhatsApp, setConfirmationModal, handleUpdateMember }: any) {
    const fullName = formatName(member.sexo, member.uncao, member.name, member.uncaoVerified);

    return (
        <tr className="group bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl">
            <td className="px-10 py-6 first:rounded-l-[2.5rem]">
                <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        <Avatar className="w-14 h-14 rounded-[1.25rem] border-2 border-white shadow-sm group-hover:scale-110 transition-all duration-500">
                            <AvatarImage src={member.image || `https://avatar.vercel.sh/${member.name}`} />
                            <AvatarFallback className="font-black bg-slate-100 text-slate-400">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.status === "ATIVO" && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                            </span>
                        )}
                        {member.status === "INATIVO" && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <Link href={`/dashboard/ministerios/${member.id}`}>
                            <p className="text-base font-black text-slate-900 tracking-tight capitalize leading-tight mb-1 hover:text-blue-600 transition-colors">
                                {fullName}
                            </p>
                        </Link>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.email}</p>
                    </div>
                </div>
            </td>

            <td className="px-10 py-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${member.status === "ATIVO" ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${member.status === "ATIVO" ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {member.status.toLowerCase()}
                </span>
            </td>

            <td className="px-10 py-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500"><ShieldCheck size={18} /></div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                        {member.cargo && member.cargo.length > 0
                            ? member.cargo.map((c: any) => c.name).join(', ')
                            : 'Membro'}
                    </span>
                </div>
            </td>

            <td className="px-10 py-6 text-right last:rounded-r-[2.5rem]">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button onClick={onView} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl border border-slate-100 transition-all active:scale-90 shadow-sm" title="Ver Detalhes">
                        <Search size={18} />
                    </button>
                    <button onClick={onWhatsApp} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl border border-slate-100 transition-all active:scale-90 shadow-sm" title="WhatsApp">
                        <Phone size={18} />
                    </button>
                    <button
                        onClick={() => {
                            toast.success('E-mail enviado com sucesso!', {
                                description: `Uma notificação foi enviada para ${member.email}`
                            });
                        }}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"
                        title="Enviar E-mail"
                    >
                        <Mail size={18} />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-slate-100 transition-all active:scale-90 shadow-sm">
                                <MoreVertical size={18} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-2xl border-slate-100 outline-none">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Gestão</DropdownMenuLabel>
                            <DropdownMenuItem onClick={onEdit} className="flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs">
                                <Edit3 size={16} className="text-blue-600" /> Editar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onUncao} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs`}>
                                <ShieldPlus size={16} className="text-blue-500" /> Alterar Unção
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onManageCargos} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs`}>
                                <ShieldPlus size={16} className="text-blue-500" /> Gerenciar Cargos
                            </DropdownMenuItem>
                            {member.uncao && !member.uncaoVerified && (
                                <DropdownMenuItem onClick={() => handleUpdateMember(member.id, { uncaoVerified: true }, "VERIFY_UNCAO")} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs`}>
                                    <ShieldCheck size={16} className="text-emerald-500" /> Verificar Unção
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="my-2" />

                            {/* Exemplo dentro do MemberRow */}
                            {member.status === "INATIVO" || member.diciplinado ? (
                                <DropdownMenuItem onClick={() => setConfirmationModal({ type: 'rehabilitate', member })} className="flex gap-3 p-3 rounded-xl cursor-pointer text-emerald-600 focus:bg-emerald-50 font-bold text-xs">
                                    <ShieldCheck size={16} /> Reabilitar Membro
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onDiscipline(member)} className="flex gap-3 p-3 rounded-xl cursor-pointer text-amber-600 focus:bg-amber-50 font-bold text-xs">
                                    <ShieldX size={16} /> Aplicar Disciplina
                                </DropdownMenuItem>
                            )}

                            {/* Lógica Dinâmica para Restauração/Exclusão */}
                            {member.status === "DELETADO" || member.status === "INATIVO" ? (
                                <DropdownMenuItem onClick={() => setConfirmationModal({ type: 'restore', member })} className="flex gap-3 p-3 rounded-xl cursor-pointer text-blue-600 focus:bg-blue-50 font-bold text-xs">
                                    <RotateCcw size={16} /> Restaurar Membro
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onDelete(member)} className="flex gap-3 p-3 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 font-bold text-xs">
                                    <Trash2 size={16} /> Deletar Membro
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </td>
        </tr>
    );
}