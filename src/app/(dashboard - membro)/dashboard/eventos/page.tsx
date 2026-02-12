"use client";

import React from 'react';
import {
    Calendar,
    Plus,
    MapPin,
    Clock,
    Users,
    MoreVertical,
    ChevronRight,
    Filter,
    Search
} from 'lucide-react';

export default function EventosPage() {
    return (
        <div className="space-y-10">
            {/* Header da Página */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Agenda e Eventos</h1>
                    <p className="text-slate-500 font-medium mt-1">Gerencie a programação e reuniões do ministério.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={16} /> Filtrar
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <Plus size={16} /> Novo Evento
                    </button>
                </div>
            </header>

            {/* Próximos Eventos em Destaque */}
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

            {/* Lista de Eventos Completa */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <Calendar className="text-blue-600" size={20} /> Calendário Mensal
                    </h2>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    <EventListItem
                        title="Ensaio do Louvor"
                        date="12 Fev"
                        time="19:30"
                        category="Ensaio"
                        attendees={12}
                    />
                    <EventListItem
                        title="Emerge: Jovens"
                        date="13 Fev"
                        time="19:00"
                        category="Culto"
                        attendees={45}
                    />
                    <EventListItem
                        title="Treinamento de Diáconos"
                        date="14 Fev"
                        time="09:00"
                        category="Treinamento"
                        attendees={8}
                    />
                </div>

                <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                        Ver calendário completo
                    </button>
                </div>
            </section>
        </div>
    );
}

function EventCard({ title, date, time, location, type, color }: any) {
    return (
        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-lg ${color} bg-opacity-10 ${color.replace('bg-', 'text-')} text-[10px] font-black uppercase tracking-widest`}>
                    {type}
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-4">{title}</h3>
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{date} às {time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{location}</span>
                </div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +15
                    </div>
                </div>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

function EventListItem({ title, date, time, category, attendees }: any) {
    return (
        <div className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-blue-50/30 transition-colors gap-4">
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{date.split(' ')[1]}</span>
                    <span className="text-lg font-black text-slate-800 leading-none">{date.split(' ')[0]}</span>
                </div>
                <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                            <Clock size={12} /> {time}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-8 px-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participantes</span>
                    <span className="text-sm font-bold text-slate-700">{attendees} confirmados</span>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
