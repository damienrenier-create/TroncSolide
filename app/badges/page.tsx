import { getBadgeCatalogue } from "@/lib/actions/gamification";
import { Star, Trophy, Target, TreePine, Calendar, Zap, Shield, TrendingUp } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import BadgeCatalogueClient from "@/components/badges/BadgeCatalogueClient";

export default async function BadgesPage() {
    const badges = await getBadgeCatalogue();
    if (!badges) return <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>Veuillez vous connecter.</div>;

    const catalogue = BADGE_DEFINITIONS.map(def => {
        const dbBadge = badges.find(b => b.name === def.name);
        return {
            ...def,
            dbId: dbBadge?.id,
            users: dbBadge?.users || []
        };
    });

    const groups = [
        {
            title: "Les Records Absolus de la Ligue 🏆",
            icon: <Trophy size={18} color="white" />,
            color: "var(--primary)",
            items: catalogue.filter(b => b.id.startsWith("RECORD_"))
        },
        {
            title: "Pionniers : Milestones Cumulés (Tiers)",
            icon: <Target size={18} color="white" />,
            color: "var(--accent)",
            items: catalogue.filter(b => b.type === "FIRST_COME" && !b.id.startsWith("RECORD_"))
        },
        {
            title: "Accomplissements Personnels",
            icon: <Star size={18} color="white" />,
            color: "var(--secondary)",
            items: catalogue.filter(b => b.type === "ACHIEVEMENT" && !["Graine", "Jeune", "Arbre", "Gardien", "Anniversaire", "Marvin"].some(k => b.name.includes(k)))
        },
        {
            title: "Hiérarchie de la Nature",
            icon: <TreePine size={18} color="white" />,
            color: "#16a34a",
            items: catalogue.filter(b => ["Graine", "Jeune", "Arbre", "Gardien", "Fleur", "Bourgeon"].some(k => b.name.includes(k)) || b.id.startsWith("LEVEL_"))
        },
        {
            title: "Événements Spéciaux",
            icon: <Calendar size={18} color="white" />,
            color: "#8b5cf6",
            items: catalogue.filter(b => ["Anniversaire", "Marvin", "ST_MARVIN", "ANNIVERSARY_1"].some(k => b.id.includes(k)))
        }
    ];

    const faqItems = [
        {
            q: "Comment fonctionne l'EXP ?",
            a: "1 pompe = 1 XP. 1 seconde de gainage = 1 XP. L'entraînement paie pur et dur.",
            icon: <Zap size={20} className="text-primary" />
        },
        {
            q: "Le Voleur de Record 🦹‍♂️",
            a: "Les Trophées de Record (ex: Champion du Mois) te versent un '% Salaire de Longévité' chaque jour (1% de sa valeur). Mais attention : si quelqu'un bat ton record, il TE VOLE TON TROPHÉE et on te retire TOUT LE SALAIRE que tu avais accumulé !",
            icon: <Shield size={20} className="text-accent" />
        },
        {
            q: "Les Tiers de Milestones (Or, Argent..)",
            a: "Être le tout premier à atteindre 5000 pompes te donne le badge Platine (100% du bonus). Le 2ème aura l'Or (80%), et ainsi de suite jusqu'à l'Argile. Ne traîne pas !",
            icon: <TrendingUp size={20} className="text-secondary" />
        }
    ];

    return <BadgeCatalogueClient groups={groups} faqItems={faqItems} />;
}
