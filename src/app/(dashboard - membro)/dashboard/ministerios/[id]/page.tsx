"use client";

import React, { useEffect, useState } from 'react';
import {
    ChevronLeft, Mail, Phone, MapPin,
    Calendar, ShieldCheck, User,
    Briefcase, Users, Edit3, Trash2,
    CheckCircle2, Hash, Clock, CalendarCheck, Heart, CircleDollarSign, Zap
} from 'lucide-react';
import Link from 'next/link';

export default function DetalhesMembro({ params }: { params: { id: string } }) {
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(`/api/users/${params.id}`);
                const data = await res.json();
                setMember(data);
            } catch (error) {
                console.error("Erro ao buscar membro:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [params.id]);

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">CARREGANDO PERFIL...</div>;
    if (!member) return <div className="p-20 text-center font-black text-slate-400 uppercase">Membro não encontrado.</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER DE NAVEGAÇÃO --- */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/ministerios"
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para a lista
                </Link>
                <div className="flex gap-3">
                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <Edit3 size={18} />
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- COLUNA ESQUERDA: CARTÃO DE IDENTIDADE --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-10 text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-blue-800 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white">
                                {member.name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-white text-white shadow-lg">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
                            {member.name}
                        </h1>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">
                            {member.uncao || 'Membro Comum'}
                        </p>

                        <div className="flex justify-center gap-2 mb-8">
                            <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400">
                                ID: #{member.id?.slice(-5)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl hover:bg-blue-50 transition-colors group">
                                <Mail size={20} className="text-slate-300 group-hover:text-blue-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-600">E-mail</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl hover:bg-emerald-50 transition-colors group">
                                <Phone size={20} className="text-slate-300 group-hover:text-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-emerald-600">Ligar</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Engajamento</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-400">Frequência</span>
                                <span className="text-sm font-black">92%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[92%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COLUNA DIREITA: INFORMAÇÕES DETALHADAS --- */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Seção 1: Dados Eclesiásticos */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Vida Espiritual</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InfoField label="Cargo / Função" value={member.cargo?.name || 'Não atribuído'} icon={<Briefcase size={16} />} />
                            <InfoField label="Data de Consagração" value={member.uncaoAt || 'Pendente'} icon={<Calendar size={16} />} />
                            <InfoField label="Ministério" value="Louvor e Adoração" icon={<Users size={16} />} />
                            <InfoField label="Status de Membresia" value={member.ativo ? "Ativo / Regular" : "Inativo"} icon={<CheckCircle2 size={16} />} />
                        </div>
                    </div>

                    {/* Seção 2: Contato e Localização */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white">
                                <Globe size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Contato e Localização</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InfoField label="Endereço de E-mail" value={member.email} icon={<Mail size={16} />} />
                            <InfoField label="Telefone / WhatsApp" value="(27) 99999-0000" icon={<Phone size={16} />} />
                            <InfoField label="Endereço Residencial" value="Vila Velha, ES" icon={<MapPin size={16} />} />
                            <InfoField label="Gênero" value={member.sexo} icon={<User size={16} />} />
                        </div>
                    </div>
                </div>

                {/* --- ABAIXO DAS OUTRAS SEÇÕES NA COLUNA DA DIREITA --- */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-2xl text-slate-900">
                                <Clock size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Linha do Tempo</h2>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                            Ver Histórico Completo
                        </button>
                    </div>

                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-100 before:to-transparent">

                        {/* Item: Financeiro */}
                        <TimelineItem
                            title="Contribuição de Dízimo"
                            description="Referente ao mês de Janeiro/2024"
                            date="Hoje, 14:20"
                            icon={<CircleDollarSign size={18} />}
                            color="bg-emerald-500"
                        />

                        {/* Item: Presença */}
                        <TimelineItem
                            title="Presença Confirmada"
                            description="Compareceu ao Culto de Celebração - Domingo"
                            date="08 de Fev, 2024"
                            icon={<CalendarCheck size={18} />}
                            color="bg-blue-500"
                        />

                        {/* Item: Ministerial */}
                        <TimelineItem
                            title="Escala de Louvor"
                            description="Atuou como Backing Vocal no evento 'Noite de Adoração'"
                            date="05 de Fev, 2024"
                            icon={<Zap size={18} />}
                            color="bg-amber-500"
                        />

                        {/* Item: Cadastro */}
                        <TimelineItem
                            title="Membresia Atualizada"
                            description="Dados de contato e endereço foram atualizados pelo administrador"
                            date="01 de Fev, 2024"
                            icon={<Heart size={18} />}
                            color="bg-rose-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ title, description, date, icon, color }: any) {
    return (
        <div className="relative flex items-start gap-8 group">
            {/* Círculo com Ícone */}
            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl ${color} text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h4>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-md">
                        {date}
                    </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                    {description}
                </p>
            </div>
        </div>
    );
}


// Subcomponente de Campo de Informação
function InfoField({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="space-y-2 group">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                {icon}
                {label}
            </div>
            <p className="text-base font-bold text-slate-800">{value}</p>
        </div>
    );
}

function Globe({ size }: { size: number }) {
    return <MapPin size={size} />; // Placeholder
}