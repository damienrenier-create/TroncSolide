import { getBadgeCatalogue } from "@/lib/actions/gamification";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import FAQClient from "@/components/faq/FAQClient";
import { Trophy, Target, Star, TreePine, Calendar, Zap, Shield, TrendingUp } from "lucide-react";

export const metadata = {
    title: "FAQ & Règles | Tronc Solide",
    description: "Toutes les règles, niveaux et badges de Tronc Solide",
};

export default async function FAQPage() {
    const badges = await getBadgeCatalogue();
    
    // We can still render the static part if not logged in, but BadgeCatalogue needs data
    const catalogue = badges ? BADGE_DEFINITIONS.map(def => {
        const dbBadge = badges.find(b => b.name === def.name);
        return {
            ...def,
            dbId: dbBadge?.id,
            users: dbBadge?.users || []
        };
    }) : [];

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
            q: "Le Voleur de Record 🦹‍♂️",
            a: "Les Trophées de Record (ex: Champion du Mois) te versent une rente quotidienne de 1% de leur valeur. Mais si quelqu'un bat ton record, il TE VOLE TON TROPHÉE et on te retire TOUT LE SALAIRE que tu avais accumulé !",
            icon: <Shield size={20} className="text-accent" />
        },
        {
            q: "Les Tiers de Périodicité (Or, Argent..)",
            a: "Être le tout premier de ta ligue à atteindre 5000 pompes globales te donne le badge Platine (100% du bonus final). Le 2ème aura l'Or (80%), et ainsi de suite jusqu'à l'Argile ! Il ne faut surtout pas traîner.",
            icon: <TrendingUp size={20} className="text-secondary" />
        }
    ];

    return (
        <FAQClient 
            badges={badges} 
            catalogue={catalogue} 
            groups={groups} 
            faqItems={faqItems} 
        />
    );
}
