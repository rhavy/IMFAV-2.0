"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    planId?: number | null;
    cpf?: string | null;
    userRoles?: string | null;
    sexo?: string | null;
    ativo?: boolean;
    uncao?: string | null;
    cargoId?: string | null;
    groups?: { id: string, name: string, color?: string | null }[];
}

interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession();

                if (session?.data?.user) {
                    setUser(session.data.user as User);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Erro ao verificar autenticação:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
    };
}
