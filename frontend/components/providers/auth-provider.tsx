"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/app/store/auth.store";

function AuthSync() {
    const hydrate = useAuthStore((state) => state.hydrate);
    const setAuth = useAuthStore((state) => state.setAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const { data: session } = useSession();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        const authSession = session as any;
        if (authSession?.backendToken && !isAuthenticated && isHydrated) {
            setAuth(
                {
                    id: authSession.backendId as string,
                    email: authSession.user?.email as string,
                    role: (authSession.role as 'STUDENT' | 'PROVIDER' | 'ADMIN') || 'STUDENT'
                },
                authSession.backendToken as string,
                authSession.refreshToken as string
            );
        }
    }, [session, isAuthenticated, isHydrated, setAuth]);

    return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthSync />
            {children}
        </SessionProvider>
    );
}

