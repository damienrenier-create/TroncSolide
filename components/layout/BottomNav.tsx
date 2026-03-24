"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Megaphone, HelpCircle } from "lucide-react";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Ligue", href: "/league", icon: Trophy },
    { label: "La Place", href: "/square", icon: Megaphone },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav glass">
            <div className="bottom-nav-content">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? 'active' : ''} ${item.label === 'FAQ' ? 'faq-button' : ''}`}
                            style={item.label === 'FAQ' ? { 
                                background: "var(--primary)", 
                                borderRadius: "12px", 
                                color: "white",
                                padding: "8px 12px",
                                margin: "4px",
                                minWidth: "60px",
                                boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
                            } : {}}
                        >
                            <Icon size={item.label === 'FAQ' ? 22 : 26} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="nav-label" style={item.label === 'FAQ' ? { color: "white" } : {}}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
