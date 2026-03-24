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
            a: "Les Trophées de Record (ex: Champion du Mois) te versent une rente quotidienne de 1% de leur valeur. Mais si quelqu'un bat ton record, il TE VOLE TON TROPHÉE et on te retire TOUT LE SALAIRE que tu avais accumulé !",
            icon: <Shield size={20} className="text-accent" />
        },
        {
            q: "Les Tiers de Périodicité (Or, Argent..)",
            a: "Être le tout premier de ta ligue à atteindre 5000 pompes globales te donne le badge Platine (100% du bonus final). Le 2ème aura l'Or (80%), et ainsi de suite jusqu'à l'Argile ! Il ne faut surtout pas traîner.",
            icon: <TrendingUp size={20} className="text-secondary" />
        },
        {
            q: "La Vérification d'Honneur ✋",
            a: "Si tu saisis une performance qui semble hors-norme (ex: +100 pompes en une série), le système te demandera de 'jurer sur l'honneur'. C'est une sécurité pour éviter les erreurs de frappe et garder les records crédibles.",
            icon: <Shield size={20} className="text-secondary" />
        },
        {
            q: "Le Carnet d'Entraînement 📖",
            a: "Ton carnet personnel recense l'ensemble de tes activités, jour par jour. Tu peux y accéder via le Dashboard pour voir le détail de tes reps, tes durées de course ou d'étirement, ainsi que tes humeurs du jour.",
            icon: <Calendar size={20} className="text-secondary" />
        },
        {
            q: "Pour en faire plus ✨",
            a: "Cette section te permet de loguer des tractions, de la course à pied ou des étirements. Pour l'instant, ces exercices ne rapportent pas d'XP et n'ont pas de badges dédiés, ils servent uniquement à ton suivi personnel.",
            icon: <Star size={20} className="text-primary" />
        },
        {
            q: "Le Duel d'Anniversaire 🎂",
            a: "Lors de l'anniversaire d'un membre, la ligue entre en mode 'Duel'. Si la star finit la journée avec le plus de reps, elle gagne un badge royal et ses XP du jour sont multipliés par 5 ! Mais si un autre membre la bat, ce chasseur gagne un badge et voit ses XP multipliés par 3. La star, elle, garde un bonus de 1.5x.",
            icon: <Award size={20} className="text-accent" />
        },
        {
            q: "La Cagnotte & L'Objectif Quotidien 💰",
            a: "Pour maintenir l'assiduité, un objectif de répétitions (ou secondes) est fixé chaque jour (1 de plus que la veille). Tu n'entres dans la 'Cagnotte' qu'après avoir réussi une première série de 21 jours consécutifs. Une fois dedans, chaque jour manqué te coûte 2€ pour le pot commun. Tous les exercices (Pompes, Squats, Gainage) comptent pour valider ton objectif !",
            icon: <Zap size={20} className="text-primary" />
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
