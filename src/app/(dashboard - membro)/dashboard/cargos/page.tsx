"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, SearchX } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CargoManagementPage() {
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [currentCargo, setCurrentCargo] = useState({ id: '', name: '' });
    const [newCargoName, setNewCargoName] = useState('');

    useEffect(() => {
        fetchCargos();
    }, []);

    const fetchCargos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cargos');
            if (res.ok) {
                const data = await res.json();
                setCargos(data);
            } else {
                toast.error("Erro ao buscar cargos.");
            }
        } catch (error) {
            console.error("Erro ao buscar cargos:", error);
            toast.error("Erro ao buscar cargos.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCargos = cargos.filter((cargo: any) =>
        cargo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddCargo = async () => {
        if (!newCargoName.trim()) {
            toast.error("O nome do cargo não pode ser vazio.");
            return;
        }
        try {
            const res = await fetch('/api/cargos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCargoName })
            });
            if (res.ok) {
                toast.success("Cargo adicionado com sucesso!");
                setNewCargoName('');
                setIsAddModalOpen(false);
                fetchCargos();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao adicionar cargo", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao adicionar cargo:", error);
            toast.error("Erro ao adicionar cargo.");
        }
    };

    const handleEditCargo = async () => {
        if (!currentCargo.name.trim()) {
            toast.error("O nome do cargo não pode ser vazio.");
            return;
        }
        try {
            const res = await fetch(`/api/cargos?id=${currentCargo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: currentCargo.name })
            });
            if (res.ok) {
                toast.success("Cargo atualizado com sucesso!");
                setIsEditModalOpen(false);
                fetchCargos();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao atualizar cargo", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao atualizar cargo:", error);
            toast.error("Erro ao atualizar cargo.");
        }
    };

    const handleDeleteCargo = async () => {
        try {
            const res = await fetch(`/api/cargos?id=${currentCargo.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                toast.success("Cargo excluído com sucesso!");
                setIsDeleteModalOpen(false);
                fetchCargos();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao excluir cargo", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao excluir cargo:", error);
            toast.error("Erro ao excluir cargo.");
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
                        Gerenciar Cargos
                    </h1>
                </div>
            </header>

            {/* BARRA DE PESQUISA E BOTÃO ADICIONAR */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-100">
                            <PlusCircle size={24} /> {/* Changed icon to PlusCircle for cargo management */}
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cargos Cadastrados</h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar cargo..."
                            className="w-full md:w-[250px] px-5 py-3.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        />
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <PlusCircle size={18} className="mr-2" /> Adicionar Cargo
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Nome do Cargo</th>
                                <th className="px-10 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={2} className="py-24 text-center">
                                        <p className="font-black uppercase tracking-widest text-sm text-slate-400">Carregando cargos...</p>
                                    </td>
                                </tr>
                            ) : filteredCargos.length > 0 ? (
                                filteredCargos.map((cargo: any) => (
                                    <tr key={cargo.id} className="group bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl">
                                        <td className="px-10 py-6 first:rounded-l-[2.5rem]">
                                            <p className="text-base font-black text-slate-900 tracking-tight capitalize leading-tight">
                                                {cargo.name}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6 text-right last:rounded-r-[2.5rem]">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentCargo(cargo);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Editar Cargo"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentCargo(cargo);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl"
                                                    title="Excluir Cargo"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <SearchX size={64} />
                                            <p className="font-black uppercase tracking-widest text-sm">Nenhum cargo encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL ADICIONAR CARGO */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Adicionar Novo Cargo</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Insira o nome do novo cargo para adicioná-lo ao sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <label htmlFor="newCargoName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Cargo</label>
                        <input
                            id="newCargoName"
                            type="text"
                            value={newCargoName}
                            onChange={(e) => setNewCargoName(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                            placeholder="Ex: Pastor, Secretário, Líder de Célula"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-2xl font-bold text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddCargo}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-blue-100 active:scale-95"
                        >
                            Adicionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL EDITAR CARGO */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Editar Cargo</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Altere o nome do cargo selecionado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <label htmlFor="editCargoName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Cargo</label>
                        <input
                            id="editCargoName"
                            type="text"
                            value={currentCargo.name}
                            onChange={(e) => setCurrentCargo({ ...currentCargo, name: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none"
                            placeholder="Ex: Pastor, Secretário, Líder de Célula"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            className="rounded-2xl font-bold text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleEditCargo}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-blue-100 active:scale-95"
                        >
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL EXCLUIR CARGO */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Excluir Cargo</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Tem certeza que deseja excluir o cargo <strong>{currentCargo.name}</strong>? Esta ação é irreversível.
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
                            onClick={handleDeleteCargo}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-rose-100 active:scale-95"
                        >
                            Excluir Cargo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
