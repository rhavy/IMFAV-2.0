"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/header/Navbar';
import DashboardNavbar from '@/components/header/DashboardNavbar';

export default function ConditionalNavbar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Verifica se está em qualquer rota do dashboard
    const isDashboard = pathname?.includes('/dashboard');

    // Se estiver no dashboard, renderiza a DashboardNavbar (sidebar vertical)
    if (isDashboard) {
        return <DashboardNavbar>
            {children}
        </DashboardNavbar>;
    }

    // Caso contrário, renderiza a Navbar normal (horizontal)
    return (
        <>
            <Navbar variant="home" />
            {children}
        </>
    )
}
