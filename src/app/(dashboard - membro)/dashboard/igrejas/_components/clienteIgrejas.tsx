"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, SearchX, Church, Search, UserPlus } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { ModalInfo } from './modalInfor';

export default function ClienteIgrejas() {
    const [igrejas, setIgrejas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]); // For associating members
    const { user: authUser } = useAuth(); // Get authenticated user for criadoPorId

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [currentIgreja, setCurrentIgreja] = useState<any>(null); // For editing
    const [formState, setFormState] = useState<any>({
        name: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        pais: '',
        userIds: [], // Array of User IDs to associate as members
        criadoPorId: authUser?.id || '', // User who created the church
    });
    const [formErrors, setFormErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [currentViewIgreja, setCurrentViewIgreja] = useState<any>(null);

    const onView = (igreja: any) => {
        setCurrentViewIgreja(igreja);
        setViewModalOpen(true);
    };

    useEffect(() => {
        fetchIgrejas();
        fetchUsers();
    }, [authUser]); // Re-fetch data if authUser changes

    const fetchIgrejas = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/igrejas');
            if (res.ok) {
                const data = await res.json();
                setIgrejas(data);
            } else {
                toast.error("Erro ao buscar igrejas.");
            }
        } catch (error) {
            console.error("Erro ao buscar igrejas:", error);
            toast.error("Erro ao buscar igrejas.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users'); // Assuming this endpoint returns all users
            if (res.ok) {
                const data = await res.json();
                setAvailableUsers(data);
            } else {
                toast.error("Erro ao buscar usuários.");
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast.error("Erro ao buscar usuários.");
        }
    };

    const filteredIgrejas = useMemo(() => {
        if (!searchTerm) return igrejas;
        const lowerTerm = searchTerm.toLowerCase();
        return igrejas.filter((igreja: any) =>
            igreja.name?.toLowerCase().includes(lowerTerm) ||
            igreja.cidade?.toLowerCase().includes(lowerTerm) ||
            igreja.estado?.toLowerCase().includes(lowerTerm) ||
            igreja.pais?.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, igrejas]);

    const resetForm = () => {
        setFormState({
            name: '',
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            pais: '',
            userIds: [],
            criadoPorId: authUser?.id || '',
        });
        setCurrentIgreja(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: any = {};
        if (!formState.name.trim()) errors.name = "Nome da igreja é obrigatório.";
        if (!formState.rua.trim()) errors.rua = "Rua é obrigatória.";
        if (!formState.numero.trim()) errors.numero = "Número é obrigatório.";
        if (!formState.bairro.trim()) errors.bairro = "Bairro é obrigatório.";
        if (!formState.cidade.trim()) errors.cidade = "Cidade é obrigatória.";
        if (!formState.estado.trim()) errors.estado = "Estado é obrigatório.";
        if (!formState.cep.trim()) errors.cep = "CEP é obrigatório.";
        if (!formState.pais.trim()) errors.pais = "País é obrigatório.";
        if (!formState.criadoPorId) errors.criadoPorId = "ID do criador é obrigatório (usuário não autenticado?).";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddModal = () => {
        resetForm();
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (igreja: any) => {
        setCurrentIgreja(igreja);
        setFormState({
            name: igreja.name,
            rua: igreja.rua,
            numero: igreja.numero,
            bairro: igreja.bairro,
            cidade: igreja.cidade,
            estado: igreja.estado,
            cep: igreja.cep,
            pais: igreja.pais,
            userIds: igreja.user_userigreja.map((u: any) => u.id),
            criadoPorId: igreja.criadoPorId,
        });
        setIsAddEditModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormState((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setFormErrors((prev: any) => ({ ...prev, [name]: undefined }));
    };

    const handleUserChange = (userId: string) => {
        setFormState((prev: any) => {
            const currentUsers = prev.userIds;
            if (currentUsers.includes(userId)) {
                return { ...prev, userIds: currentUsers.filter((id: string) => id !== userId) };
            } else {
                return { ...prev, userIds: [...currentUsers, userId] };
            }
        });
        setFormErrors((prev: any) => ({ ...prev, userIds: undefined }));
    };

    const handleAddEditIgreja = async () => {
        if (!validateForm()) {
            toast.error("Por favor, corrija os erros no formulário.");
            return;
        }

        setSubmitting(true);
        const method = currentIgreja ? 'PUT' : 'POST';
        const url = currentIgreja ? `/api/igrejas?id=${currentIgreja.id}` : '/api/igrejas';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });

            if (res.ok) {
                toast.success(currentIgreja ? "Igreja atualizada com sucesso!" : "Igreja adicionada com sucesso!");
                setIsAddEditModalOpen(false);
                fetchIgrejas();
            } else {
                const errorData = await res.json();
                toast.error(currentIgreja ? "Erro ao atualizar igreja" : "Erro ao adicionar igreja", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao salvar igreja:", error);
            toast.error("Erro ao salvar igreja.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteIgreja = async () => {
        if (!currentIgreja?.id) return;
        try {
            const res = await fetch(`/api/igrejas?id=${currentIgreja.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("Igreja excluída com sucesso!");
                setIsDeleteModalOpen(false);
                fetchIgrejas();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao excluir igreja", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao excluir igreja:", error);
            toast.error("Erro ao excluir igreja.");
        }
    };

    const inputStyle = (error: any) => `
        w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-700
        focus:bg-white focus:border-blue-500/50 transition-all outline-none
        ${error ? 'border-rose-500 text-rose-900' : 'border-slate-100'}
    `;

    const LabelInput = ({ label, error }: { label: string, error?: string }) => (
        <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            {error && <span className="text-[9px] font-bold text-rose-500 uppercase">{error}</span>}
        </div>
    );

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
                        Gerenciar Igrejas
                    </h1>
                </div>
            </header>

            {/* BARRA DE PESQUISA E BOTÃO ADICIONAR */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-100">
                            <Church size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Igrejas Cadastradas</h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar igreja..."
                            className="w-full md:w-[250px] px-5 py-3.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        />
                        <Button
                            onClick={openAddModal}
                            className="h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <PlusCircle size={18} className="mr-2" /> Adicionar Igreja
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Nome da Igreja</th>
                                <th className="px-10 py-5">Endereço</th>
                                <th className="px-10 py-5">Criador</th>
                                <th className="px-10 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <p className="font-black uppercase tracking-widest text-sm text-slate-400">Carregando igrejas...</p>
                                    </td>
                                </tr>
                            ) : filteredIgrejas.length > 0 ? (
                                filteredIgrejas.map((igreja: any) => (
                                    <tr key={igreja.id} className="group bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl">
                                        <td className="px-10 py-6 first:rounded-l-[2.5rem]">
                                            <p className="text-base font-black text-slate-900 tracking-tight capitalize leading-tight">
                                                {igreja.name}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-medium text-slate-700">
                                                {igreja.rua}, {igreja.numero}, {igreja.bairro}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {igreja.cidade} - {igreja.estado}, {igreja.cep}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {igreja.criadoPor?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right last:rounded-r-[2.5rem]">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onView(igreja)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Ver Detalhes">
                                                    <Search size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(igreja)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Editar Igreja"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentIgreja(igreja);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl"
                                                    title="Excluir Igreja"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <SearchX size={64} />
                                            <p className="font-black uppercase tracking-widest text-sm">Nenhuma igreja encontrada.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL ADICIONAR/EDITAR IGREJA */}
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-3xl outline-none overflow-hidden bg-white max-h-[90vh] flex flex-col">
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Church size={18} />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    {currentIgreja ? 'Editar Igreja' : 'Adicionar Nova Igreja'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-slate-500">
                                Preencha os detalhes da igreja.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        <form className="space-y-6">
                            {/* Detalhes Básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <LabelInput label="Nome da Igreja" error={formErrors.name} />
                                    <input type="text" name="name" value={formState.name} onChange={handleInputChange} className={inputStyle(formErrors.name)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="CEP" error={formErrors.cep} />
                                    <input type="text" name="cep" value={formState.cep} onChange={handleInputChange} className={inputStyle(formErrors.cep)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="Rua" error={formErrors.rua} />
                                    <input type="text" name="rua" value={formState.rua} onChange={handleInputChange} className={inputStyle(formErrors.rua)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="Número" error={formErrors.numero} />
                                    <input type="text" name="numero" value={formState.numero} onChange={handleInputChange} className={inputStyle(formErrors.numero)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="Bairro" error={formErrors.bairro} />
                                    <input type="text" name="bairro" value={formState.bairro} onChange={handleInputChange} className={inputStyle(formErrors.bairro)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="Cidade" error={formErrors.cidade} />
                                    <input type="text" name="cidade" value={formState.cidade} onChange={handleInputChange} className={inputStyle(formErrors.cidade)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="Estado" error={formErrors.estado} />
                                    <input type="text" name="estado" value={formState.estado} onChange={handleInputChange} className={inputStyle(formErrors.estado)} />
                                </div>
                                <div className="space-y-2">
                                    <LabelInput label="País" error={formErrors.pais} />
                                    <input type="text" name="pais" value={formState.pais} onChange={handleInputChange} className={inputStyle(formErrors.pais)} />
                                </div>
                            </div>

                            {/* Membros da Igreja */}
                            <div className="pt-4 border-t border-slate-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">Membros Associados</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableUsers.map((user: any) => (
                                        <div key={user.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`user-${user.id}`}
                                                checked={formState.userIds.includes(user.id)}
                                                onChange={() => handleUserChange(user.id)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={`user-${user.id}`} className="ml-2 block text-sm text-slate-700">{user.name}</label>
                                        </div>
                                    ))}
                                </div>
                                {formErrors.userIds && <p className="text-red-500 text-xs mt-1">{formErrors.userIds}</p>}
                            </div>
                        </form>
                        {formErrors.criadoPorId && <p className="text-rose-500 text-sm mt-4 text-center">{formErrors.criadoPorId}</p>}
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                        <Button type="button" onClick={() => setIsAddEditModalOpen(false)} variant="ghost" className="rounded-2xl font-bold text-slate-400">
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleAddEditIgreja} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-blue-100 active:scale-95">
                            {submitting ? 'Salvando...' : currentIgreja ? 'Salvar Alterações' : 'Adicionar Igreja'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL EXCLUIR IGREJA */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Excluir Igreja</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Tem certeza que deseja excluir a igreja <strong>{currentIgreja?.name}</strong>? Esta ação é irreversível.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="rounded-2xl font-bold text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteIgreja}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-rose-100 active:scale-95"
                        >
                            Excluir Igreja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL VISUALIZAR IGREJA */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-3xl outline-none overflow-hidden bg-white max-h-[90vh] flex flex-col">
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Church size={18} />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    Detalhes da Igreja
                                </DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-slate-500">
                                Informações detalhadas sobre a igreja selecionada.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        {currentViewIgreja ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModalInfo label="Nome da Igreja" value={currentViewIgreja.name} />
                                    <ModalInfo label="Rua" value={currentViewIgreja.rua} />
                                    <ModalInfo label="Número" value={currentViewIgreja.numero} />
                                    <ModalInfo label="Bairro" value={currentViewIgreja.bairro} />
                                    <ModalInfo label="Cidade" value={currentViewIgreja.cidade} />
                                    <ModalInfo label="Estado" value={currentViewIgreja.estado} />
                                    <ModalInfo label="CEP" value={currentViewIgreja.cep} />
                                    <ModalInfo label="País" value={currentViewIgreja.pais} />
                                    <ModalInfo label="Membros Associados" value={currentViewIgreja.user_userigreja?.length === 0 ? 'Nenhum membro associado' : currentViewIgreja.user_userigreja?.length} />
                                    <ModalInfo label="Criado Por" value={currentViewIgreja.criadoPor?.name || 'Desconhecido'} />
                                    <ModalInfo label="Criado Em" value={currentViewIgreja.createdAt} />
                                    <ModalInfo label="Atualizado Em" value={currentViewIgreja.updatedAt} />
                                </div>

                            </div>
                        ) : (
                            <p>Carregando detalhes da igreja...</p>
                        )}
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                        <Button type="button" onClick={() => setViewModalOpen(false)} className="rounded-2xl font-bold text-slate-400">
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
