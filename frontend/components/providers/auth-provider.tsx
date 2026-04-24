"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/app/store/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const hydrate = useAuthStore((state) => state.hydrate);
    
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return <SessionProvider>{children}</SessionProvider>;
}
