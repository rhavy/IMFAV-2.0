"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, SearchX } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GerenciarCategoriasEventos() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategoria, setCurrentCategoria] = useState(null);
    
    const [formState, setFormState] = useState({
        name: '',
        descricao: ''
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categorias-eventos');
            if (res.ok) {
                const data = await res.json();
                setCategorias(data);
            } else {
                toast.error("Erro ao buscar categorias.");
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            toast.error("Erro ao buscar categorias.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormState({
            name: '',
            descricao: ''
        });
        setCurrentCategoria(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!formState.name.trim()) errors.name = "Nome da categoria é obrigatório.";
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddModal = () => {
        resetForm();
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (categoria) => {
        setCurrentCategoria(categoria);
        setFormState({
            name: categoria.name,
            descricao: categoria.descricao || ''
        });
        setIsAddEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleAddEditCategoria = async () => {
        if (!validateForm()) {
            toast.error("Por favor, corrija os erros no formulário.");
            return;
        }

        setSubmitting(true);
        const method = currentCategoria ? 'PUT' : 'POST';
        const url = currentCategoria ? `/api/categorias-eventos?id=${currentCategoria.id}` : '/api/categorias-eventos';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });

            if (res.ok) {
                toast.success(currentCategoria ? "Categoria atualizada com sucesso!" : "Categoria adicionada com sucesso!");
                setIsAddEditModalOpen(false);
                fetchCategorias();
            } else {
                const errorData = await res.json();
                toast.error(currentCategoria ? "Erro ao atualizar categoria" : "Erro ao adicionar categoria", { 
                    description: errorData.error || "Tente novamente." 
                });
            }
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            toast.error("Erro ao salvar categoria.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategoria = async () => {
        if (!currentCategoria?.id) return;
        try {
            const res = await fetch(`/api/categorias-eventos?id=${currentCategoria.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("Categoria excluída com sucesso!");
                setIsDeleteModalOpen(false);
                fetchCategorias();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao excluir categoria", { 
                    description: errorData.error || "Tente novamente." 
                });
            }
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            toast.error("Erro ao excluir categoria.");
        }
    };

    const inputStyle = (error) => `
        w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-700
        focus:bg-white focus:border-blue-500/50 transition-all outline-none
        ${error ? 'border-rose-500 text-rose-900' : 'border-slate-100'}
    `;

    const LabelInput = ({ label, error }) => (
        <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            {error && <span className="text-[9px] font-bold text-rose-500 uppercase">{error}</span>}
        </div>
    );

    const filteredCategorias = categorias.filter(categoria => 
        categoria.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        Gerenciar Categorias de Eventos
                    </h1>
                </div>
            </header>

            {/* BARRA DE PESQUISA E BOTÃO ADICIONAR */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-100">
                            <Edit size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Categorias Cadastradas</h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar categoria..."
                            className="w-full md:w-[250px] px-5 py-3.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        />
                        <Button
                            onClick={openAddModal}
                            className="h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <PlusCircle size={18} className="mr-2" /> Adicionar Categoria
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Nome</th>
                                <th className="px-10 py-5">Descrição</th>
                                <th className="px-10 py-5">Eventos Associados</th>
                                <th className="px-10 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <p className="font-black uppercase tracking-widest text-sm text-slate-400">Carregando categorias...</p>
                                    </td>
                                </tr>
                            ) : filteredCategorias.length > 0 ? (
                                filteredCategorias.map((categoria) => (
                                    <tr key={categoria.id} className="group bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl">
                                        <td className="px-10 py-6 first:rounded-l-[2.5rem]">
                                            <p className="text-base font-black text-slate-900 tracking-tight capitalize leading-tight">
                                                {categoria.name}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-medium text-slate-700">
                                                {categoria.descricao || '-'}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {categoria.eventos?.length || 0} eventos
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right last:rounded-r-[2.5rem]">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(categoria)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Editar Categoria"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentCategoria(categoria);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl"
                                                    title="Excluir Categoria"
                                                    disabled={categoria.eventos && categoria.eventos.length > 0}
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
                                            <p className="font-black uppercase tracking-widest text-sm">Nenhuma categoria encontrada.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL ADICIONAR/EDITAR CATEGORIA */}
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-2xl outline-none overflow-hidden bg-white max-h-[90vh] flex flex-col">
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Edit size={18} />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    {currentCategoria ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-slate-500">
                                Preencha os detalhes da categoria.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <LabelInput label="Nome da Categoria" error={formErrors.name} />
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formState.name} 
                                    onChange={handleInputChange} 
                                    className={inputStyle(formErrors.name)} 
                                    placeholder="Ex: Congresso, Culto, Conferência"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <LabelInput label="Descrição (Opcional)" error={formErrors.descricao} />
                                <textarea 
                                    name="descricao" 
                                    value={formState.descricao} 
                                    onChange={handleInputChange} 
                                    rows={3}
                                    className={`${inputStyle(formErrors.descricao)} resize-none`}
                                    placeholder="Descreva brevemente esta categoria..."
                                />
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                        <Button type="button" onClick={() => setIsAddEditModalOpen(false)} variant="ghost" className="rounded-2xl font-bold text-slate-400">
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleAddEditCategoria} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-blue-100 active:scale-95">
                            {submitting ? 'Salvando...' : currentCategoria ? 'Salvar Alterações' : 'Adicionar Categoria'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL EXCLUIR CATEGORIA */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Excluir Categoria</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Tem certeza que deseja excluir a categoria <strong>{currentCategoria?.name}</strong>? 
                            {currentCategoria?.eventos && currentCategoria.eventos.length > 0 && 
                                ` Esta categoria está associada a ${currentCategoria.eventos.length} evento(s) e não pode ser excluída.`}
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
                            onClick={handleDeleteCategoria}
                            disabled={currentCategoria?.eventos && currentCategoria.eventos.length > 0}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-rose-100 active:scale-95"
                        >
                            Excluir Categoria
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}