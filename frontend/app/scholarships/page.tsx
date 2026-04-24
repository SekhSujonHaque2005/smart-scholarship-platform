"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ScholarshipList } from "@/components/dashboard/ScholarshipList";
import { SpotlightBackground } from "@/components/ui/spotlight-background";

export default function ScholarshipsPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login?callbackUrl=/scholarships");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <SpotlightBackground gridSize={64} spotlightColor="56, 189, 248" spotlightSize={440}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </SpotlightBackground>
        );
    }

    return (
        <SpotlightBackground gridSize={64} spotlightColor="56, 189, 248" spotlightSize={440}>
            <Navbar />
            <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <ScholarshipList />
            </main>
            <Footer />
        </SpotlightBackground>
    );
}
