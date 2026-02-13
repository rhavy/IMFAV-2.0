"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, SearchX, Calendar, AlertTriangle, UserPlus, RotateCcw, Globe, X, Search } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EventCard from './eventCard';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

// Define interfaces based on Prisma schema
interface Igreja {
    id: string;
    name: string;
    cidade?: string;
    estado?: string;
}

interface User {
    id: string;
    name: string;
}

interface Cargo {
    id: string;
    name: string;
}

interface CategoriaEvento {
    id: string;
    name: string;
}

interface Evento {
    id: string;
    name: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    horaInicio: string;
    horaFim: string;
    origem: string;
    tema: string;
    libracao: boolean;
    idcadastrado: string;
    user_eventosdirigentes?: { id: string; name: string }[];
    convidados?: { id: string; name: string; uncao: string; cargo: { id: string }; funcao: string }[];
    categoria?: { id: string; name: string }; // Adicionando a categoria ao evento
}


export default function ClienteEventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableUsers, setAvailableUsers] = useState<User[]>([]); // For dirigentes
    const [availableCargos, setAvailableCargos] = useState<Cargo[]>([]); // For convidados' cargos
    const [availableIgrejas, setAvailableIgrejas] = useState<Igreja[]>([]); // For localização
    const [availableCategorias, setAvailableCategorias] = useState<CategoriaEvento[]>([]); // For categorias de eventos
    const { user: authUser } = useAuth(); // Get authenticated user for idcadastrado

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [currentEvento, setCurrentEvento] = useState<any>(null); // For editing
    const [formState, setFormState] = useState<any>({
        name: '',
        descricao: '',
        tema: '',
        origem: '',
        dataInicio: '',
        dataFim: '',
        horaInicio: '',
        horaFim: '',
        libracao: false,
        categoriaId: '', // Novo campo para a categoria
        dirigentesIds: [], // Garantir que seja um array vazio inicialmente
        convidadosData: [],
        idcadastrado: authUser?.id || '' // Use authenticated user ID
    });

    // Estado para armazenar URLs temporárias das imagens
    const [previewImages, setPreviewImages] = useState<{ [key: string]: string }>({});
    const [formErrors, setFormErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEventos();
        fetchUsers();
        fetchCargos();
        fetchIgrejas();
        fetchCategorias();
    }, [authUser]); // Re-fetch data if authUser changes (e.g., on login/logout)

    const fetchEventos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/eventos');
            if (res.ok) {
                const data = await res.json();
                setEventos(data);
            } else {
                toast.error("Erro ao buscar eventos.");
            }
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            toast.error("Erro ao buscar eventos.");
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

    const fetchCargos = async () => {
        try {
            const res = await fetch('/api/cargos');
            if (res.ok) {
                const data = await res.json();
                setAvailableCargos(data);
            } else {
                toast.error("Erro ao buscar cargos.");
            }
        } catch (error) {
            console.error("Erro ao buscar cargos:", error);
            toast.error("Erro ao buscar cargos.");
        }
    };

    const fetchIgrejas = async () => {
        try {
            const res = await fetch('/api/igrejas');
            if (res.ok) {
                const data = await res.json();
                console.log("Dados recebidos de /api/igrejas:", data); // Log para depuração
                // Certificar-se de que os dados são um array e têm as propriedades necessárias
                if (Array.isArray(data)) {
                    const igrejasValidas = data.filter(igreja =>
                        igreja &&
                        typeof igreja === 'object' &&
                        igreja.id &&
                        igreja.name
                    );
                    console.log("Igrejas válidas:", igrejasValidas); // Log para depuração
                    setAvailableIgrejas(igrejasValidas);
                } else {
                    console.error("Dados recebidos de /api/igrejas não são um array:", data);
                    setAvailableIgrejas([]);
                }
            } else {
                console.error("Erro na resposta de /api/igrejas:", res.status, res.statusText);
                toast.error("Erro ao buscar igrejas.");
            }
        } catch (error) {
            console.error("Erro ao buscar igrejas:", error);
            toast.error("Erro ao buscar igrejas.");
        }
    };

    const fetchCategorias = async () => {
        try {
            const res = await fetch('/api/categorias-eventos');
            if (res.ok) {
                const data = await res.json();
                setAvailableCategorias(data);
            } else {
                toast.error("Erro ao buscar categorias de eventos.");
            }
        } catch (error) {
            console.error("Erro ao buscar categorias de eventos:", error);
            toast.error("Erro ao buscar categorias de eventos.");
        }
    };

    const filteredEventos = useMemo(() => {
        if (!searchTerm) return eventos;
        const lowerTerm = searchTerm.toLowerCase();
        return eventos.filter((evento: any) =>
            evento.name?.toLowerCase().includes(lowerTerm) ||
            evento.descricao?.toLowerCase().includes(lowerTerm) ||
            evento.tema?.toLowerCase().includes(lowerTerm) ||
            evento.categoria?.name?.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, eventos]);

    const resetForm = () => {
        setFormState({
            name: '',
            descricao: '',
            tema: '',
            origem: '',
            dataInicio: '',
            dataFim: '',
            horaInicio: '',
            horaFim: '',
            libracao: false,
            categoriaId: '', // Novo campo para a categoria
            dirigentesIds: [], // Garantir que seja um array vazio
            convidadosData: [],
            idcadastrado: authUser?.id || '' // Use authenticated user ID
        });
        setCurrentEvento(null);
        setFormErrors({}); // Clear errors on form reset
        setPreviewImages({}); // Limpar previews de imagem
    };

    const validateForm = () => {
        const errors: any = {};
        if (!formState.name.trim()) errors.name = "Nome do evento é obrigatório.";
        if (!formState.descricao.trim()) errors.descricao = "Descrição é obrigatória.";
        if (!formState.dataInicio) errors.dataInicio = "Data de início é obrigatória.";
        if (!formState.dataFim) errors.dataFim = "Data de fim é obrigatória.";
        if (formState.dataInicio && formState.dataFim && new Date(formState.dataInicio) > new Date(formState.dataFim)) {
            errors.dataFim = "Data de fim não pode ser anterior à data de início.";
        }
        if (!formState.horaInicio) errors.horaInicio = "Hora de início é obrigatória.";
        if (!formState.horaFim) errors.horaFim = "Hora de fim é obrigatória.";
        if (!formState.categoriaId.trim()) errors.categoriaId = "Categoria é obrigatória.";
        if (!formState.origem || !formState.origem.trim()) errors.origem = "Localização/igreja é obrigatória.";
        if (!formState.idcadastrado) errors.idcadastrado = "ID do usuário que cadastra é obrigatório (usuário não autenticado?).";
        if (formState.dirigentesIds.length === 0) errors.dirigentesIds = "Pelo menos um dirigente é obrigatório.";

        formState.convidadosData.forEach((convidado: any, index: number) => {
            const convidadoErrors: any = {};
            if (!convidado.name.trim()) convidadoErrors.name = "Nome é obrigatório.";
            if (!convidado.uncao.trim()) convidadoErrors.uncao = "Unção é obrigatória.";
            if (!convidado.funcao.trim()) convidadoErrors.funcao = "Função é obrigatória.";
            if (convidado.name.trim() && !convidado.imagem) convidadoErrors.imagem = "Imagem é obrigatória.";
            if (Object.keys(convidadoErrors).length > 0) {
                errors[`convidado-${index}`] = convidadoErrors;
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddModal = () => {
        resetForm();
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (evento: any) => {
        setCurrentEvento(evento);
        setFormState({
            name: evento.name,
            descricao: evento.descricao,
            tema: evento.tema,
            origem: evento.origem,
            dataInicio: evento.dataInicio ? new Date(evento.dataInicio).toISOString().split('T')[0] : '',
            dataFim: evento.dataFim ? new Date(evento.dataFim).toISOString().split('T')[0] : '',
            horaInicio: evento.horaInicio,
            horaFim: evento.horaFim,
            libracao: evento.libracao,
            categoriaId: evento.categoriaId || '',
            dirigentesIds: evento.user_eventosdirigentes ? evento.user_eventosdirigentes.map((d: any) => d.id) : [],
            convidadosData: evento.convidados.map((c: any) => ({
                id: c.id,
                name: c.name,
                uncao: c.uncao,
                funcao: c.funcao,
                aprovacao: c.aprovacao !== undefined ? c.aprovacao : false,
                imagem: c.imagem || '',
            })),
            idcadastrado: evento.idcadastrado,
        });
        setIsAddEditModalOpen(true);
    };

    const onView = (evento: any) => {
        setCurrentEvento(evento);
        setIsViewModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormState((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setFormErrors((prev: any) => ({ ...prev, [name]: undefined })); // Clear error for this field
    };


    const handleConvidadoChange = (index: number, field: string, value: string) => {
        setFormState((prev: any) => {
            const newConvidados = [...prev.convidadosData];
            newConvidados[index] = { ...newConvidados[index], [field]: value };
            return { ...prev, convidadosData: newConvidados };
        });
        setFormErrors((prev: any) => { // Clear specific convidado error
            const newConvidadoErrors = { ...prev[`convidado-${index}`], [field]: undefined };
            if (Object.keys(newConvidadoErrors).every(key => !newConvidadoErrors[key])) { // If no more errors for this convidado
                const newErrors = { ...prev };
                delete newErrors[`convidado-${index}`];
                return newErrors;
            }
            return { ...prev, [`convidado-${index}`]: newConvidadoErrors };
        });
    };

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de arquivo
            if (!file.type.match('image.*')) {
                toast.error('Por favor, selecione um arquivo de imagem válido.');
                return;
            }

            // Validar tamanho do arquivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }

            // Criar URL temporária para pré-visualização
            const previewUrl = URL.createObjectURL(file);
            setPreviewImages(prev => ({
                ...prev,
                [`convidado-${index}`]: previewUrl
            }));

            // Converter arquivo para base64 para envio
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                handleConvidadoChange(index, 'imagem', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const addConvidado = () => {
        setFormState((prev: any) => ({
            ...prev,
            convidadosData: [...prev.convidadosData, {
                name: '',
                uncao: '',
                funcao: '',
                aprovacao: false,
                imagem: ''
            }],
        }));
    };

    const removeConvidado = (index: number) => {
        setFormState((prev: any) => {
            const newConvidados = prev.convidadosData.filter((_: any, i: number) => i !== index);
            return { ...prev, convidadosData: newConvidados };
        });
        setFormErrors((prev: any) => { // Clear errors for removed convidado
            const newErrors = { ...prev };
            delete newErrors[`convidado-${index}`];
            return newErrors;
        });
    };

    const handleAddEditEvento = async () => {
        if (!validateForm()) {
            toast.error("Por favor, corrija os erros no formulário.");
            return;
        }

        setSubmitting(true);
        const method = currentEvento ? 'PUT' : 'POST';
        const url = currentEvento ? `/api/eventos?id=${currentEvento.id}` : '/api/eventos';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });

            if (res.ok) {
                toast.success(currentEvento ? "Evento atualizado com sucesso!" : "Evento adicionado com sucesso!");
                setIsAddEditModalOpen(false);
                fetchEventos();
            } else {
                const errorData = await res.json();
                toast.error(currentEvento ? "Erro ao atualizar evento" : "Erro ao adicionar evento", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao salvar evento:", error);
            toast.error("Erro ao salvar evento.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvento = async () => {
        if (!currentEvento?.id) return;
        try {
            const res = await fetch(`/api/eventos?id=${currentEvento.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("Evento excluído com sucesso!");
                setIsDeleteModalOpen(false);
                fetchEventos();
            } else {
                const errorData = await res.json();
                toast.error("Erro ao excluir evento", { description: errorData.error || "Tente novamente." });
            }
        } catch (error) {
            console.error("Erro ao excluir evento:", error);
            toast.error("Erro ao excluir evento.");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
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
    const DateInput = ({ label, name, value, error, onChange }: any) => (
        <div className="space-y-2">
            <LabelInput label={label} error={error} />
            <input
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                className={inputStyle(error)}
            />
        </div>
    );
    const TimeInput = ({ label, name, value, error, onChange }: any) => (
        <div className="space-y-2">
            <LabelInput label={label} error={error} />
            <input
                type="time"
                name={name}
                value={value}
                onChange={onChange}
                className={inputStyle(error)}
            />
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
                        Gerenciar Eventos
                    </h1>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EventCard
                    title="Culto de Celebração"
                    date="15 Fev"
                    time="19:00"
                    location="Templo Principal"
                    type="Culto"
                    color="bg-blue-500"
                />
                <EventCard
                    title="Reunião de Líderes"
                    date="18 Fev"
                    time="20:00"
                    location="Sala de Conferências"
                    type="Reunião"
                    color="bg-amber-500"
                />
                <EventCard
                    title="Conferência Águas Vivas"
                    date="10 Mar"
                    time="09:00"
                    location="Auditório Central"
                    type="Conferência"
                    color="bg-purple-500"
                />
            </section>

            {/* BARRA DE PESQUISA E BOTÃO ADICIONAR */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-100">
                            <Calendar size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Eventos Cadastrados</h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar evento..."
                            className="w-full md:w-[250px] px-5 py-3.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        />
                        <Button
                            onClick={openAddModal}
                            className="h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <PlusCircle size={18} className="mr-2" /> Adicionar Evento
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Nome do Evento</th>
                                <th className="px-10 py-5">Período</th>
                                <th className="px-10 py-5">Categoria</th>
                                <th className="px-10 py-5">Status</th>
                                <th className="px-10 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <p className="font-black uppercase tracking-widest text-sm text-slate-400">Carregando eventos...</p>
                                    </td>
                                </tr>
                            ) : filteredEventos.length > 0 ? (
                                filteredEventos.map((evento: any) => (
                                    <tr key={evento.id} className="group bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl">
                                        <td className="px-10 py-6 first:rounded-l-[2.5rem]">
                                            <p className="text-base font-black text-slate-900 tracking-tight capitalize leading-tight">
                                                {evento.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{evento.tema}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formatDate(evento.dataInicio)} - {formatDate(evento.dataFim)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">{evento.horaInicio} - {evento.horaFim}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {evento.categoria?.name || 'Sem categoria'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${evento.convidados && evento.convidados.length > 0 && evento.convidados.every((c: any) => c.aprovacao)
                                                ? 'bg-green-100 text-green-800'  // Todos aprovados
                                                : evento.convidados && evento.convidados.length > 0 && evento.convidados.some((c: any) => c.aprovacao)
                                                    ? 'bg-blue-100 text-blue-800'     // Alguns aprovados
                                                    : 'bg-amber-100 text-amber-800'   // Nenhum aprovado
                                                }`}>
                                                {evento.convidados && evento.convidados.length > 0 && evento.convidados.every((c: any) => c.aprovacao)
                                                    ? 'Completo'
                                                    : evento.convidados && evento.convidados.length > 0 && evento.convidados.some((c: any) => c.aprovacao)
                                                        ? 'Parcial'
                                                        : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right last:rounded-r-[2.5rem]">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onView(evento)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Ver Detalhes"
                                                >
                                                    <Search size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(evento)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    title="Editar Evento"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentEvento(evento);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl"
                                                    title="Excluir Evento"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <SearchX size={64} />
                                            <p className="font-black uppercase tracking-widest text-sm">Nenhum evento encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL ADICIONAR/EDITAR EVENTO */}
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
                <DialogContent className="rounded-[3.5rem] border-none shadow-2xl p-0 max-w-full outline-none overflow-hidden bg-white max-h-[92vh] flex flex-col transition-all duration-500">

                    {/* HEADER COM GRADIENTE E PROFUNDIDADE */}
                    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-10 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-5 mb-4">
                                <div className="p-4 bg-blue-600 rounded-[1.5rem] text-white shadow-2xl shadow-blue-200 animate-in zoom-in-75 duration-700">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                                        {currentEvento ? 'Ajustar Evento' : 'Novo Evento Ministerial'}
                                    </DialogTitle>
                                    <DialogDescription className="font-bold text-blue-600/60 uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                        Painel de Gestão Estratégica IMFAV
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* CORPO DO FORMULÁRIO */}
                    <div className="p-10 overflow-y-auto custom-scrollbar bg-white">
                        <form className="space-y-12">

                            {/* NOTIFICAÇÃO DE ERRO REFINADA */}
                            {Object.keys(formErrors).length > 0 && (
                                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] animate-in slide-in-from-top-4">
                                    <div className="flex items-center gap-4 text-rose-800">
                                        <div className="p-2 bg-rose-500 rounded-full text-white">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase text-[10px] tracking-widest">Atenção Necessária</h4>
                                            <p className="text-xs font-bold opacity-70">Existem campos obrigatórios ou inválidos destacados abaixo.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SEÇÃO 1: IDENTIDADE */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">1. Identidade e Propósito</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-12 space-y-2">
                                        <LabelInput label="Nome Principal do Evento" error={formErrors.name} />
                                        <input
                                            type="text" name="name"
                                            value={formState.name} onChange={handleInputChange}
                                            className={inputStyle(formErrors.name)}
                                            placeholder="Ex: Conferência de Avivamento 2024"
                                        />
                                    </div>

                                    <div className="md:col-span-8 space-y-2">
                                        <LabelInput label="Categoria do Evento" error={formErrors.categoriaId} />
                                        <select
                                            name="categoriaId"
                                            value={formState.categoriaId}
                                            onChange={handleInputChange}
                                            className={inputStyle(formErrors.categoriaId)}
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {availableCategorias && availableCategorias.length > 0 ? (
                                                availableCategorias.map((categoria: any) => (
                                                    <option key={categoria.id} value={categoria.id}>
                                                        {categoria.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>Nenhuma categoria disponível</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="md:col-span-12 space-y-2">
                                        <LabelInput label="Tema do Evento" error={formErrors.tema} />
                                        <input
                                            type="text" name="tema"
                                            value={formState.tema} onChange={handleInputChange}
                                            className={inputStyle(formErrors.tema)}
                                            placeholder="Ex: Avivamento Espiritual"
                                        />
                                    </div>

                                    <div className="md:col-span-12 space-y-2">
                                        <LabelInput label="Descrição Ministerial (Breve)" error={formErrors.descricao} />
                                        <textarea
                                            name="descricao"
                                            value={formState.descricao} onChange={handleInputChange}
                                            rows={2}
                                            className={`${inputStyle(formErrors.descricao)} resize-none`}
                                            placeholder="Qual o foco espiritual deste evento?"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SEÇÃO 2: CRONOGRAMA & LOCALIZAÇÃO */}
                            <section className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-10">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                    <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">2. Agenda e Logística</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Bloco Início */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                                            <Calendar size={14} /> Início do Evento
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DateInput label="Data de Abertura" name="dataInicio" value={formState.dataInicio} error={formErrors.dataInicio} onChange={handleInputChange} />
                                            <TimeInput label="Horário" name="horaInicio" value={formState.horaInicio} error={formErrors.horaInicio} onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    {/* Bloco Fim */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                                            <RotateCcw size={14} /> Encerramento
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DateInput label="Data Final" name="dataFim" value={formState.dataFim} error={formErrors.dataFim} onChange={handleInputChange} />
                                            <TimeInput label="Horário" name="horaFim" value={formState.horaFim} error={formErrors.horaFim} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200/50">
                                    <LabelInput label="Localização Principal / Igreja" error={formErrors.origem} />
                                    <div className="relative mt-2">
                                        <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            name="origem"
                                            value={formState.origem}
                                            onChange={handleInputChange}
                                            className={`${inputStyle(formErrors.origem)} pl-14 appearance-none`}
                                        >
                                            <option value="">Selecione a igreja/local</option>
                                            {availableIgrejas && availableIgrejas.length > 0 ? (
                                                (availableIgrejas as { id: string, name: string, cidade?: string, estado?: string }[]).map((igreja) => (
                                                    <option key={igreja.id} value={igreja.name}>
                                                        {igreja.name} - {igreja.cidade || 'Cidade'}, {igreja.estado || 'Estado'}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>Nenhuma igreja cadastrada</option>
                                            )}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SEÇÃO 3: LIDERANÇA (Grid de Seleção Premium) */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <span className="h-6 w-1 bg-blue-600 rounded-full" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Equipe de Liderança Responsável</h3>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dirigentes</label>

                                    <div className="relative">
                                        <select
                                            multiple
                                            value={formState.dirigentesIds}
                                            onChange={(e) => {
                                                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                                                setFormState((prev: any) => ({ ...prev, dirigentesIds: selectedValues }));
                                                setFormErrors((prev: any) => ({ ...prev, dirigentesIds: undefined })); // Clear error
                                            }}
                                            className="w-full min-h-[200px] p-5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500/50 transition-all outline-none appearance-none"
                                        >
                                            {availableUsers && availableUsers.length > 0 ? (
                                                availableUsers.map((user: any) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>Nenhum usuário disponível</option>
                                            )}
                                        </select>

                                        {/* Indicador visual de seleção múltipla */}
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formState.dirigentesIds.length > 0 && (
                                            <>
                                                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Selecionados:</span>
                                                {formState.dirigentesIds.map((userId: string) => {
                                                    const user = availableUsers.find((u: any) => u.id === userId);
                                                    return user ? (
                                                        <span
                                                            key={userId}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-full"
                                                        >
                                                            {user.name || "Usuário " + userId}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newDirigentesIds = formState.dirigentesIds.filter((id: string) => id !== userId);
                                                                    setFormState((prev: any) => ({ ...prev, dirigentesIds: newDirigentesIds }));
                                                                    setFormErrors((prev: any) => ({ ...prev, dirigentesIds: undefined })); // Clear error
                                                                }}
                                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ) : null;
                                                })}
                                            </>
                                        )}
                                    </div>

                                    <p className="text-[9px] text-slate-500 font-medium mt-2">Segure a tecla Ctrl (Windows) ou Cmd (Mac) para selecionar múltiplos itens</p>
                                </div>

                                {/* Mensagem de erro para dirigentes */}
                                {formErrors.dirigentesIds && (
                                    <div className="mt-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                        <p className="text-rose-700 text-sm font-bold flex items-center gap-2">
                                            <span className="text-lg">⚠️</span>
                                            {formErrors.dirigentesIds}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* SEÇÃO 4: CONVIDADOS */}
                            <section className="space-y-6 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
                                        <span className="h-6 w-1 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Convidados Especiais</h3>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addConvidado}
                                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl border-none h-11 px-8 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                                    >
                                        <UserPlus size={18} className="mr-2" /> Adicionar Convidado
                                    </Button>
                                </div>

                                <div className="grid w-full grid-cols-1 gap-6">
                                    {formState.convidadosData.map((convidado: any, index: number) => {
                                        const convidadoErrors = formErrors[`convidado-${index}`] || {};
                                        return (
                                            <div key={index} className={`p-6 rounded-[2rem] animate-in slide-in-from-right-4 duration-300 ${Object.keys(convidadoErrors).length > 0
                                                ? 'border border-rose-500/50 bg-rose-50/20'
                                                : 'border border-slate-200 bg-white'
                                                }`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-slate-800 uppercase text-sm tracking-widest">Convidado #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeConvidado(index)}
                                                        className="bg-rose-600 text-white p-2 rounded-full shadow-lg hover:bg-rose-700 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</label>
                                                        <input
                                                            type="text" value={convidado.name}
                                                            onChange={(e) => handleConvidadoChange(index, 'name', e.target.value)}
                                                            className={`w-full rounded-xl text-slate-700 text-sm font-bold p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${convidadoErrors.name
                                                                ? 'bg-rose-50 border border-rose-500'
                                                                : 'bg-slate-50 border border-slate-200'
                                                                }`}
                                                            placeholder="Nome completo do convidado"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unção</label>
                                                            <select
                                                                value={convidado.uncao}
                                                                onChange={(e) => handleConvidadoChange(index, 'uncao', e.target.value)}
                                                                className={`w-full rounded-xl text-slate-700 text-sm font-bold p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${convidadoErrors.uncao
                                                                    ? 'bg-rose-50 border border-rose-500'
                                                                    : 'bg-slate-50 border border-slate-200'
                                                                    }`}
                                                            >
                                                                <option value="">Selecione a unção</option>
                                                                <option value="PASTOR">Pastor</option>
                                                                <option value="OBREIRO">Obreiro</option>
                                                                <option value="DIACONO">Diácono</option>
                                                                <option value="EVANGELISTA">Evangelista</option>
                                                                <option value="PRESBITERO">Presbítero</option>
                                                                <option value="MISSIONARIO">Missionário</option>
                                                            </select>
                                                        </div>


                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Função</label>
                                                            <input
                                                                type="text" value={convidado.funcao}
                                                                onChange={(e) => handleConvidadoChange(index, 'funcao', e.target.value)}
                                                                className={`w-full rounded-xl text-slate-700 text-sm font-bold p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${convidadoErrors.funcao
                                                                    ? 'bg-rose-50 border border-rose-500'
                                                                    : 'bg-slate-50 border border-slate-200'
                                                                    }`}
                                                                placeholder="Função exercida"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-1 w-full">
                                                            <div className="space-y-2 w-full">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imagem do Convidado</label>
                                                                <div className="flex flex-col gap-3">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleImageChange(index, e)}
                                                                        className="w-full rounded-xl text-slate-700 text-sm font-bold p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                                    />
                                                                    {convidadoErrors.imagem && (
                                                                        <p className="text-rose-600 text-xs font-bold">{convidadoErrors.imagem}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Pré-visualização da imagem */}
                                                            {(previewImages[`convidado-${index}`] || convidado.imagem) && (
                                                                <div className="mt-4">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pré-visualização</label>
                                                                    <div className="mt-2 flex justify-center">
                                                                        <img
                                                                            src={previewImages[`convidado-${index}`] || convidado.imagem}
                                                                            alt="Pré-visualização do convidado"
                                                                            className="max-h-40 rounded-lg object-contain border border-slate-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Mensagem de erro para convidados */}
                                {Object.keys(formErrors).some(key => key.startsWith('convidado-')) && (
                                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                                        <p className="text-rose-600 text-sm font-bold flex items-center gap-2">
                                            <span className="text-lg">⚠️</span>
                                            Alguns convidados têm campos obrigatórios não preenchidos.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </form>
                    </div>

                    {/* FOOTER ESTRATÉGICO */}
                    <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 gap-4 shrink-0">
                        <Button
                            type="button"
                            onClick={() => setIsAddEditModalOpen(false)}
                            variant="ghost"
                            className="rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all"
                        >
                            Descartar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddEditEvento}
                            disabled={submitting}
                            className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] px-20 h-16 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Sincronizando...' : currentEvento ? 'Confirmar Atualização' : 'Publicar Evento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL EXCLUIR EVENTO */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-md shadow-2xl outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Excluir Evento</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500 pt-2">
                            Tem certeza que deseja excluir o evento <strong>{currentEvento?.name}</strong>? Esta ação é irreversível.
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
                            onClick={handleDeleteEvento}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black px-8 shadow-lg shadow-rose-100 active:scale-95"
                        >
                            Excluir Evento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL VISUALIZAR EVENTO */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 max-w-4xl outline-none overflow-hidden bg-white max-h-[90vh] flex flex-col">
                    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-10 border-b border-slate-100 shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-5 mb-4">
                                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                                        {currentEvento?.name}
                                    </DialogTitle>
                                    <DialogDescription className="font-bold text-blue-600/60 uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                        Detalhes do Evento
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-10 overflow-y-auto">
                        {currentEvento ? (
                            <div className="space-y-10">
                                {/* SEÇÃO 1: IDENTIDADE */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                        <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Informações Básicas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome do Evento</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tema</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.tema}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.descricao}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.categoria?.name || 'Sem categoria'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SEÇÃO 2: CRONOGRAMA */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                        <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Cronograma</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Início</p>
                                            <p className="text-base font-bold text-slate-800">{formatDate(currentEvento.dataInicio)}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Fim</p>
                                            <p className="text-base font-bold text-slate-800">{formatDate(currentEvento.dataFim)}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário de Início</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.horaInicio}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário de Fim</p>
                                            <p className="text-base font-bold text-slate-800">{currentEvento.horaFim}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SEÇÃO 3: LOCALIZAÇÃO */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                        <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Localização</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local</p>
                                        <p className="text-base font-bold text-slate-800">{currentEvento.origem}</p>
                                    </div>
                                </section>

                                {/* SEÇÃO 4: DIRIGENTES */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                        <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Dirigentes</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentEvento.user_eventosdirigentes && currentEvento.user_eventosdirigentes.length > 0 ? (
                                            currentEvento.user_eventosdirigentes.map((dirigente: any) => (
                                                <div key={dirigente.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="font-bold text-slate-800">{dirigente.name}</p>
                                                    <p className="text-sm text-slate-600">{dirigente.email}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">Nenhum dirigente designado.</p>
                                        )}
                                    </div>
                                </section>

                                {/* SEÇÃO 5: CONVIDADOS */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                        <span className="h-6 w-1.5 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Convidados Especiais</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentEvento.convidados && currentEvento.convidados.length > 0 ? (
                                            currentEvento.convidados.map((convidado: any) => (
                                                <div key={convidado.id} className={`p-4 rounded-xl border ${convidado.aprovacao ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                                                    }`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-slate-800">{convidado.name}</p>
                                                            <p className="text-sm text-slate-600">{convidado.uncao} - {convidado.funcao}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${convidado.aprovacao
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {convidado.aprovacao ? 'Aprovado' : 'Pendente'}
                                                        </span>
                                                    </div>
                                                    {convidado.imagem && (
                                                        <div className="mt-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imagem</p>
                                                            <img
                                                                src={convidado.imagem}
                                                                alt={convidado.name}
                                                                className="mt-1 max-h-20 rounded-lg object-contain border border-slate-200"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">Nenhum convidado adicionado.</p>
                                        )}
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <p className="text-center text-slate-500">Carregando detalhes do evento...</p>
                        )}
                    </div>

                    <DialogFooter className="p-10 border-t border-slate-100 gap-3">
                        <Button
                            type="button"
                            onClick={() => setIsViewModalOpen(false)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black px-8 uppercase tracking-widest text-[10px]"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
