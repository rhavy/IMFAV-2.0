"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
    variant?: "home" | "dashboard";
}

export default function Navbar({ variant = "home" }: NavbarProps) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
    };

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
                <span className="font-bold text-blue-900 hidden md:block leading-tight">
                    MINISTÉRIO<br /><span className="text-blue-500 text-sm">FONTE DE ÁGUAS VIVAS</span>
                </span>
            </Link>

            {variant === "home" && (
                <div className="hidden md:flex gap-8 font-medium text-slate-600">
                    <Link href="/" className="hover:text-blue-600 transition">Início</Link>
                    <Link href="/cultos" className="hover:text-blue-600 transition">Cultos</Link>
                    <Link href="/eventos" className="hover:text-blue-600 transition">Eventos</Link>
                    <Link href="/galeria" className="hover:text-blue-600 transition">Galeria</Link>
                </div>
            )}

            <div className="flex gap-4 items-center">
                {isLoading ? (
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
                ) : isAuthenticated && user ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 hover:opacity-80 transition"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-600 overflow-hidden flex items-center justify-center">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-blue-600 font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 bg-blue-50">
                                        <p className="font-semibold text-blue-900">{user.name}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-slate-700"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                            Dashboard
                                        </Link>

                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-slate-700"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <Settings className="w-5 h-5 text-blue-600" />
                                            Configurações
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sair
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
                    >
                        <Users className="w-5 h-5" />
                        Área do Membro
                    </Link>
                )}

                <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
                    Fale Conosco
                </button>
            </div>
        </nav>
    );
}
