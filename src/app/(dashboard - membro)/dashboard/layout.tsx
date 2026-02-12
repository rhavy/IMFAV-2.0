"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React from 'react';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = useAuth();
    const router = useRouter();
    React.useEffect(() => {
        if (!session) {
            router.push("/login");
        }
    }, [session]);
    return (
        <div className="w-full h-full">
            {children}
        </div>
    );
}