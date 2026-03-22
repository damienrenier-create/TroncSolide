"use client"

import { useSession } from "next-auth/react";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (status === "loading") {
        return <div className="loading-screen">Chargement...</div>;
    }

    if (!session && !isAuthPage) {
        // Relying on middleware or redirect logic here, but for shell simplicity:
        return <>{children}</>;
    }

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="app-shell">
            <header className="app-header glass">
                <div className="container header-content">
                    <h1 className="logo">Tronc <span>Solide 🌳</span></h1>
                    <div className="user-badge-top">
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                    </div>
                </div>
            </header>

            <main className="app-main">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
