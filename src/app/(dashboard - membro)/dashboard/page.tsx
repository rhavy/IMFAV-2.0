"use client";

import ClienteDashboad from './_components/clienteDashboad';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardHome() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null; // Ou um loading spinner

    return (
        <ClienteDashboad session={{ user }} />
    );
};
