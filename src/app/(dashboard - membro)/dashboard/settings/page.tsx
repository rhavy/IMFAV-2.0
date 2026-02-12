"use client";

import React from 'react';
import {
    Settings,
    User,
    Bell,
    Lock,
    Shield,
    LogOut,
    Camera,
    ChevronRight,
    Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-10">
            {/* Header da Página */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Configurações</h1>
                    <p className="text-slate-500 font-medium mt-1">Gerencie seu perfil e preferências do sistema.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <Save size={16} /> Salvar Alterações
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Menu Lateral de Configurações */}
                <div className="lg:col-span-1 space-y-2">
                    <SettingsTab icon={<User size={18} />} label="Perfil" active />
                    <SettingsTab icon={<Bell size={18} />} label="Notificações" />
                    <SettingsTab icon={<Lock size={18} />} label="Segurança" />
                    <SettingsTab icon={<Shield size={18} />} label="Privacidade" />
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
                            <LogOut size={18} /> Sair da Conta
                        </button>
                    </div>
                </div>

                {/* Conteúdo das Configurações */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Sessão de Perfil */}
                    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Informações do Perfil</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-4xl text-slate-400 overflow-hidden">
                                    {user?.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0) || "U"
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all border-4 border-white">
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name || ""}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email || ""}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cargo / Função</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700">
                                        <option>Administrador</option>
                                        <option>Pastor</option>
                                        <option>Líder de Coordenadoria</option>
                                        <option>Membro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sessão de Preferências */}
                    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Preferências de Sistema</h2>
                        <div className="space-y-4">
                            <ToggleButton label="Receber notificações por e-mail" defaultChecked />
                            <ToggleButton label="Relatórios semanais de crescimento" defaultChecked />
                            <ToggleButton label="Modo Escuro (Dashboard)" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function SettingsTab({ icon, label, active = false }: any) {
    return (
        <button className={`
      flex items-center justify-between w-full px-5 py-3.5 rounded-2xl transition-all duration-200
      ${active
                ? "bg-white text-blue-600 shadow-md border border-slate-100 font-black"
                : "text-slate-500 hover:bg-white hover:text-slate-800 font-bold"
            }
    `}>
            <div className="flex items-center gap-3 text-sm">
                {icon}
                <span>{label}</span>
            </div>
            {active && <ChevronRight size={14} />}
        </button>
    );
}

function ToggleButton({ label, defaultChecked = false }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
            <span className="text-sm font-bold text-slate-700">{label}</span>
            <button className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
        ${defaultChecked ? "bg-blue-600" : "bg-slate-200"}
      `}>
                <span className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${defaultChecked ? "translate-x-5" : "translate-x-0"}
        `} />
            </button>
        </div>
    );
}
