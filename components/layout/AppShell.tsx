"use client"

import { useSession } from "next-auth/react";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, User } from "lucide-react";
import SeasonalTree from "./SeasonalTree";
import { useEffect, useState } from "react";
import { claimRetroBadge } from "@/lib/actions/gamification";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isRetro, setIsRetro] = useState(false);

    // Konami Code Logic
    useEffect(() => {
        let keys: string[] = [];
        const konami = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";

        const handleKeyDown = async (e: KeyboardEvent) => {
            keys.push(e.key);
            keys = keys.slice(-10);
            if (keys.join(',') === konami) {
                setIsRetro(true);
                document.body.classList.add('retro-mode');
                await claimRetroBadge();
                alert("🕹️ MODE RÉTRO ACTIVÉ ! Vous avez débloqué le badge 'Rétro-Gaineur'.");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                    <Link href="/" className="logo">Tronc <span>Solide <SeasonalTree /></span></Link>
                    
                    <div className="header-actions">
                        <Link href="/faq" className="header-user-btn">
                            <HelpCircle size={18} />
                            <span className="header-user-name">FAQ</span>
                        </Link>
                        <Link href="/profile" className="header-user-btn">
                            <User size={18} />
                            <span className="header-user-name">
                                {session?.user?.name || session?.user?.email?.split('@')[0]}
                            </span>
                        </Link>
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
