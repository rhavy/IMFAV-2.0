"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error: authError } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard"
            });

            if (authError) {
                setError(authError.message || "Erro ao realizar login. Verifique suas credenciais.");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError("");

        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            });
        } catch (err) {
            setError("Erro ao conectar com o Google.");
            setGoogleLoading(false);
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: Visual/Branding */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" as const }}
                className="hidden md:flex md:w-1/2 bg-blue-900 relative items-center justify-center p-12 overflow-hidden"
            >
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1.05, opacity: 0.4 }}
                    transition={{ duration: 2, ease: "easeOut" as const }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80"
                        className="w-full h-full object-cover"
                        alt="Igreja"
                    />
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="relative z-10 text-white max-w-md"
                >
                    <motion.div variants={fadeInUp} className="mb-8">
                        <img src="/logo.png" alt="Logo" className="h-16 w-auto brightness-0 invert" />
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl font-bold mb-6">Bem-vindo à Sua Casa Espiritual</motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-blue-100 leading-relaxed">
                        Acesse sua conta para gerenciar seus ministérios, acompanhar eventos exclusivos e fortalecer sua caminhada com a comunidade.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="mt-12 flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex-1">
                            <span className="block text-2xl font-bold">1.2k+</span>
                            <span className="text-sm text-blue-200 uppercase tracking-wider">Membros Ativos</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex-1">
                            <span className="block text-2xl font-bold">15+</span>
                            <span className="text-sm text-blue-200 uppercase tracking-wider">Ministérios</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" as const }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
                ></motion.div>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" as const }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"
                ></motion.div>
            </motion.div>

            {/* Right Side: Login Form */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" as const }}
                className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white"
            >
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-md"
                >
                    <motion.div variants={fadeInUp}>
                        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition group font-medium">
                            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition" />
                            Voltar para o site
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Login de Membros</h2>
                        <p className="text-slate-500">Insira suas credenciais para entrar no portal.</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.form variants={fadeInUp} className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-slate-700">Senha</label>
                                <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Esqueceu a senha?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center mb-6">
                            <input type="checkbox" id="remember" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                            <label htmlFor="remember" className="ml-2 text-sm text-slate-600">Lembrar de mim</label>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition transform active:scale-[0.98] flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Acessar Portal <ArrowRight className="ml-2 w-5 h-5" /></>
                            )}
                        </button>
                    </motion.form>

                    <motion.div variants={fadeInUp} className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500 font-medium">ou entre com</span>
                        </div>
                    </motion.div>

                    <motion.button
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="mt-6 w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-4 rounded-xl shadow-sm transition flex items-center justify-center gap-3"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Entrar com Google
                            </>
                        )}
                    </motion.button>

                    <motion.p variants={fadeInUp} className="mt-8 text-center text-slate-500 text-sm">
                        Não tem acesso? <Link href="/register" className="font-bold text-blue-600 hover:underline">Solicite seu cadastro</Link>
                    </motion.p>
                </motion.div>

                {/* Footer info for mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center md:hidden"
                >
                    <img src="/logo.png" alt="Logo" className="h-8 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400 text-xs">© 2025 IMFAV - Ministério Fonte de Águas Vivas</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
