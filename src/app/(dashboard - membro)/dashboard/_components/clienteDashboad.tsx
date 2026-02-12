"use client";

import React from 'react';
import {
    Users,
    TrendingUp,
    Calendar,
    DollarSign,
    Clock,
    Activity,
    ArrowUpRight
} from 'lucide-react';
// Novo componente StatCard aplicado com estilo metálico/moderno
const StatCard = ({ title, value, trend, icon }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                {React.cloneElement(icon, { className: "text-slate-400 group-hover:text-blue-500 w-6 h-6" })}
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
                {trend}
            </span>
        </div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
    </div>
);

export default function ClienteDashboad({ session }: any) {
    const [stats, setStats] = React.useState({ count: 0, trend: "..." });
    const [loadingStats, setLoadingStats] = React.useState(true);

    const [groups, setGroups] = React.useState<any[]>([]);
    const [loadingGroups, setLoadingGroups] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats/dashboard");
                const data = await res.json();
                if (data.count !== undefined) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Erro ao carregar estatísticas:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchUserGroups = async () => {
            if (!session?.user?.id) return;
            try {
                // Aqui buscaríamos apenas os grupos do usuário
                // Por enquanto buscaremos todos os grupos e filtraremos ou apenas listaremos
                const res = await fetch("/api/groups");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGroups(data);
                } else {
                    setGroups([]);
                }
            } catch (error) {
                console.error("Erro ao carregar grupos:", error);
                setGroups([]);
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchStats();
        fetchUserGroups();
    }, [session?.user?.id]);

    const getTitulo = (sexo: string, uncao: string) => {
        if (sexo === "FEMININO") {
            switch (uncao) {
                case "DIÁCONO":
                    return uncao.slice(0, -1) + "ISA";
                case "PASTOR":
                    return uncao + "A";
                default:
                    return uncao ? uncao.slice(0, -1) + "A" : "";
            }
        } else {
            return uncao || "";
        }
    };

    const capitalize = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="space-y-10">
            {/* Header de Boas-vindas Otimizado */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                        {capitalize(getTitulo(session?.user?.sexo, session?.user?.uncao))} {capitalize(session?.user?.name)}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {loadingGroups ? (
                            <span className="text-[10px] font-black text-slate-300 uppercase animate-pulse">Carregando grupos...</span>
                        ) : groups.length > 0 ? (
                            groups.map(g => (
                                <span key={g.id} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase border border-blue-100 shadow-sm">
                                    {g.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] font-black text-slate-400 uppercase">Nenhum ministério vinculado</span>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium mt-1">
                        Bem-vindo ao centro de gestão do Ministério Fonte de Águas Vivas.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mt-1 mb-4">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                        <Clock size={20} />
                    </div>
                    <div className="text-right mt-1 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Hoje</p>
                        <p className="text-sm font-bold text-blue-900 leading-none">
                            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Grid de Estatísticas Aplicando o Novo Componente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
                <StatCard
                    title="Total de Membros"
                    value={loadingStats ? "..." : stats.count.toLocaleString('pt-BR')}
                    icon={<Users />}
                    trend={stats.trend}
                />
                <StatCard
                    title="Entradas Mensais"
                    value="R$ 15.400"
                    icon={<DollarSign />}
                    trend="+5.4% de meta"
                />
                <StatCard
                    title="Próximos Eventos"
                    value="03"
                    icon={<Calendar />}
                    trend="Esta semana"
                />
                <StatCard
                    title="Novos Visitantes"
                    value="24"
                    icon={<TrendingUp />}
                    trend="Crescente"
                />
            </div>

            {/* Seções de Conteúdo Secundário */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualização de Fluxo Metálica */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Activity className="text-blue-600" size={24} /> Fluxo de Atividade
                        </h2>
                        <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                            Ver detalhes
                        </button>
                    </div>

                    <div className="h-[220px] flex items-end justify-between gap-4 px-2">
                        {[40, 75, 45, 95, 65, 85, 100].map((height, i) => (
                            <div key={i} className="group relative w-full h-full flex flex-col justify-end">
                                <div
                                    className="w-full bg-slate-50 group-hover:bg-blue-600 transition-all duration-500 rounded-2xl shadow-inner border border-transparent group-hover:border-blue-400"
                                    style={{ height: `${height}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-slate-50">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
                    </div>
                </div>

                {/* Atividades Recentes Estilizadas */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">
                        Recentes
                    </h2>
                    <div className="space-y-8 flex-1">
                        <ActivityItem text="Ana Silva cadastrada" time="Há 2 horas" dot="bg-blue-500" />
                        <ActivityItem text="Dízimo: R$ 200,00" time="Há 5 horas" dot="bg-emerald-500" />
                        <ActivityItem text="Novo evento criado" time="Ontem às 14h" dot="bg-amber-500" />
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10">
                        Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente Interno para Atividades
const ActivityItem = ({ text, time, dot }: any) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-2.5 h-2.5 rounded-full ${dot} shadow-lg ring-4 ring-slate-50 transition-all group-hover:scale-125`} />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 leading-tight truncate uppercase tracking-tight">{text}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{time}</p>
        </div>
        <ArrowUpRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={16} />
    </div>
);

