"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Megaphone } from "lucide-react";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Ligue", href: "/league", icon: Trophy },
    { label: "La Place", href: "/square", icon: Megaphone },
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
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
