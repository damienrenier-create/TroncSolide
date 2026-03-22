"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, BarChart2, User, Award, Megaphone } from "lucide-react";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Ligue", href: "/league", icon: Trophy },
    { label: "Stats", href: "/stats", icon: BarChart2 },
    { label: "La Place", href: "/square", icon: Megaphone },
    { label: "Palmarès", href: "/badges", icon: Award },
    { label: "Compte", href: "/profile", icon: User },
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
                            <Icon size={24} />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
