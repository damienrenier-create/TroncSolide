import { getBadgeCatalogue } from "@/lib/actions/gamification";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import FAQClient from "@/components/faq/FAQClient";
import { Trophy, Target, Star, TreePine, Calendar, Zap, Shield, TrendingUp, Award } from "lucide-react";

export const metadata = {
    title: "FAQ & Règles | Tronc Solide",
    description: "Toutes les règles, niveaux et badges de Tronc Solide",
};

export default async function FAQPage() {
    const badges = await getBadgeCatalogue();
    
    const catalogue = badges ? BADGE_DEFINITIONS.map(def => {
        const dbBadge = badges.find(b => b.name === def.name);
        return {
            ...def,
            dbId: dbBadge?.id,
            users: dbBadge?.users || []
        };
    }) : [];

    const agenda = [
        { date: "Flexible", name: "Anniversaire d'un Membre 🎂", bonus: "Duel: XP x5 pour la Star", award: "Badge Royal ou Chasseur" },
        { date: "01/04", name: "Poisson d'Avril 🐟", bonus: "🏆 Compétition de Reps", award: "Badges Poissons (Top 5)" },
        { date: "05/04", name: "Fête de Pâques 🥚", bonus: "🏆 Chasse aux Œufs (Reps)", award: "Badges Œufs (Top 5)" },
        { date: "01/05", name: "Fête du Travail 💪", bonus: "🚀 XP x5 sur la séance", award: "Honneur & Volume" },
        { date: "10/05", name: "Fête des Mères 💖", bonus: "🚀 XP x5 (Gainage & Squats)", award: "Top 3 Badges" },
        { date: "14/06", name: "Fête des Pères 💙", bonus: "🚀 XP x5 (Pompes)", award: "Top 3 Badges" },
    ];

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
            items: catalogue.filter(b => b.type === "ACHIEVEMENT" && !["Graine", "Jeune", "Arbre", "Gardien", "Anniversaire", "Marvin", "BIRTHDAY", "APRIL_FOOLS", "EASTER", "MOTHERS_DAY", "FATHERS_DAY"].some(k => b.id.includes(k)))
        },
        {
            title: "Hiérarchie de la Nature",
            icon: <TreePine size={18} color="white" />,
            color: "#16a34a",
            items: catalogue.filter(b => ["Graine", "Jeune", "Arbre", "Gardien", "Fleur", "Bourgeon"].some(k => b.name.includes(k)) || b.id.startsWith("LEVEL_"))
        },
        {
            title: "Événements Spéciaux & Défis 🎊",
            icon: <Calendar size={18} color="white" />,
            color: "#8b5cf6",
            items: catalogue.filter(b => ["Anniversaire", "Marvin", "ST_MARVIN", "ANNIVERSARY_1", "BIRTHDAY", "APRIL_FOOLS", "EASTER", "MOTHERS_DAY", "FATHERS_DAY"].some(k => b.id.includes(k)))
        }
    ];

    const faqItems = [
        {
            q: "Le Voleur de Record 🦹‍♂️",
            a: "Les Trophées de Record (ex : Champion du Jour) te versent une rente quotidienne de 1% de leur valeur. Mais attention : si quelqu'un bat ton record, il TE VOLE TON TROPHÉE et on te retire TOUT L'XP que tu avais accumulé avec cette rente ! Ton trône n'est jamais acquis.",
            icon: <Shield size={20} className="text-accent" />,
            id: "voleur"
        },
        {
            q: "Les Tiers de Périodicité (Or, Argent..)",
            a: "Être le tout premier de ta ligue à atteindre un JALON (ex : 100 pompes cumulées, 5000 squats ou 5min de gainage d'une traite) te donne le badge Platine (100% du bonus final). Le 2ème aura l'Or (80%), et ainsi de suite jusqu'à l'Argile ! Il ne faut surtout pas traîner.",
            icon: <TrendingUp size={20} className="text-secondary" />,
            id: "tiers"
        },
        {
            q: "Le Carnet d'Entraînement 📖",
            a: "Ton carnet personnel recense l'ensemble de tes activités, jour par jour. Tu peux y accéder via le Dashboard pour voir le détail de tes reps, tes durées de course ou d'étirement, ainsi que tes humeurs du jour.",
            icon: <Calendar size={20} className="text-secondary" />,
            id: "carnet"
        },
        {
            q: "La Cagnotte & L'Infirmerie 💰",
            a: "L'objectif quotidien augmente de 1 par jour. Pas d'excuses, tous les exercices comptent ! Si tu es blessé ou empêché, l'Infirmerie te permet de poser un certificat médical pour protéger ta série et ton portefeuille (2€ d'amende après 21j de streak).",
            icon: <Shield size={20} className="text-primary" />,
            id: "cagnotte-rules"
        }
    ];

    return (
        <FAQClient 
            badges={badges} 
            catalogue={catalogue} 
            groups={groups} 
            faqItems={faqItems} 
            agenda={agenda}
        />
    );
}
