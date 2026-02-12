"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Circle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function DashboardNavbar({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/membros', label: 'Membros e Grupos', icon: Users },
        { href: '/dashboard/eventos', label: 'Agenda e Eventos', icon: Calendar },
        { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
            {/* SIDEBAR - Estilo Cinza Metálico / Navy */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out
                lg:static lg:translate-x-0 border-r border-slate-800
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header: Logo e Identidade */}
                    <div className="p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg shadow-blue-500/20">
                                <img src="/logo.png" alt="Logo" className="h-6 w-auto brightness-0 invert" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-xl tracking-tighter">IMFAV</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Links de Navegação */}
                    <nav className="flex-1 px-4 space-y-1.5">
                        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${active
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                                        : "hover:bg-slate-800/50 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={active ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                                        <span className="text-sm font-semibold">{link.label}</span>
                                    </div>
                                    {active && <ChevronRight size={14} className="opacity-50" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer: User Profile Card */}
                    <div className="p-4 border-t border-slate-800 bg-[#020617]/50">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-white font-bold">
                                {user?.name?.charAt(0) || "P"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Online</p>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                title="Sair"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ÁREA DE CONTEÚDO PRINCIPAL (Flex-1 para empurrar) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Mobile Otimizado */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
                    <img src="/logo.png" alt="Logo" className="h-8" />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 bg-slate-100 rounded-lg text-slate-600"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Conteúdo da Página */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto p-6 md:p-10 lg:p-12">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay para Mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
}