import { BadgeType } from "@prisma/client";

export const BADGE_DEFINITIONS = [
    // --- FAMILLE A : ACCOMPLISSEMENTS PERSONNELS ---
    { id: "EARLY_BIRD", name: "Lève-tôt", description: "S'entraîner avant 7h du matin", type: "ACHIEVEMENT" as BadgeType, icon: "🌅", xpValue: 25 },
    { id: "NIGHT_OWL", name: "Oiseau de nuit", description: "S'entraîner après 22h", type: "ACHIEVEMENT" as BadgeType, icon: "🦉", xpValue: 25 },
    { id: "SQUAT_LOVER", name: "Squat Lover", description: "Faire 5 séances de squats", type: "ACHIEVEMENT" as BadgeType, icon: "🍑", xpValue: 50 },
    { id: "MOOD_MASTER", name: "Mood Master", description: "Loguer 10 séances avec un mood", type: "ACHIEVEMENT" as BadgeType, icon: "🎭", xpValue: 100 },
    { id: "CENTURION", name: "Centurion", description: "Atteindre 100s/reps en une séance", type: "ACHIEVEMENT" as BadgeType, icon: "💯", xpValue: 500 }, // Huge goal for a beginner

    // --- FAMILLE B1 : MILESTONES CUMULÉS (PIONNIERS) ---
    // Pompages
    { id: "PUMP_100", name: "100 Pompages", description: "Premier à atteindre 100 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "💪", xpValue: 50 },
    { id: "PUMP_1000", name: "1 000 Pompages", description: "Premier à atteindre 1 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "🔥", xpValue: 500 },
    { id: "PUMP_2000", name: "2 000 Pompages", description: "Premier à atteindre 2 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "💣", xpValue: 1000 },
    { id: "PUMP_5000", name: "5 000 Pompages", description: "Premier à atteindre 5 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "🌋", xpValue: 2500 },
    { id: "PUMP_10000", name: "10 000 Pompages", description: "Premier à atteindre 10 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 5000 },
    { id: "PUMP_20000", name: "20 000 Pompages", description: "Premier à atteindre 20 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "💎", xpValue: 10000 },
    { id: "PUMP_50000", name: "50 000 Pompages", description: "Premier à atteindre 50 000 pompes cumulées", type: "FIRST_COME" as BadgeType, icon: "✨", xpValue: 25000 },
    { id: "PUMP_100000", name: "100 000 Pompages", description: "Légende absolue des 100 000 pompes", type: "FIRST_COME" as BadgeType, icon: "🌌", xpValue: 50000 },

    // Squats
    { id: "SQUAT_100", name: "100 Squats", description: "Premier à atteindre 100 squats cumulés", type: "FIRST_COME" as BadgeType, icon: "🦵", xpValue: 50 },
    { id: "SQUAT_1000", name: "1 000 Squats", description: "Premier à atteindre 1 000 squats cumulés", type: "FIRST_COME" as BadgeType, icon: "⚡", xpValue: 500 },
    { id: "SQUAT_5000", name: "5 000 Squats", description: "Premier à atteindre 5 000 squats cumulés", type: "FIRST_COME" as BadgeType, icon: "🏔️", xpValue: 2500 },

    // Gainage (Ventral/Latéral)
    { id: "PLANK_1000S", name: "1 000s Gainage", description: "Premier à atteindre 1 000s de gainage cumulées", type: "FIRST_COME" as BadgeType, icon: "🛡️", xpValue: 500 },
    { id: "PLANK_10000S", name: "10 000s Gainage", description: "Premier à atteindre 10 000s de gainage cumulées", type: "FIRST_COME" as BadgeType, icon: "🏆", xpValue: 5000 },
    { id: "PLANK_100000S", name: "100 000s Gainage", description: "Premier à atteindre 100 000s de gainage cumulées", type: "FIRST_COME" as BadgeType, icon: "🌀", xpValue: 50000 },

    // --- FAMILLE B2 : MEILLEURE SÉRIE (PIONNIERS) ---
    // Gainage
    { id: "SERIE_PLANK_30S", name: "Mur d'Acier (30s)", description: "Premier à tenir 30s d'un coup", type: "FIRST_COME" as BadgeType, icon: "🧱", xpValue: 50 },
    { id: "SERIE_PLANK_1M", name: "Inébranlable (1m)", description: "Premier à tenir 1m d'un coup", type: "FIRST_COME" as BadgeType, icon: "🗿", xpValue: 150 },
    { id: "SERIE_PLANK_1M30", name: "Roc (1m30)", description: "Premier à tenir 1m30 d'un coup", type: "FIRST_COME" as BadgeType, icon: "⛰️", xpValue: 300 },
    { id: "SERIE_PLANK_2M", name: "Légende (2m)", description: "Premier à tenir 2m d'un coup", type: "FIRST_COME" as BadgeType, icon: "🗻", xpValue: 600 },
    { id: "SERIE_PLANK_3M", name: "Infatigable (3m)", description: "Premier à tenir 3m d'un coup", type: "FIRST_COME" as BadgeType, icon: "🌋", xpValue: 1200 },
    { id: "SERIE_PLANK_5M", name: "Titan (5m)", description: "Premier à tenir 5m d'un coup", type: "FIRST_COME" as BadgeType, icon: "🏔️", xpValue: 3000 },
    { id: "SERIE_PLANK_10M", name: "Demi-Dieu (10m)", description: "Premier à tenir 10m d'un coup", type: "FIRST_COME" as BadgeType, icon: "🪐", xpValue: 10000 },

    // Pompages
    { id: "SERIE_PUMP_10", name: "Pousseur (10)", description: "Premier à faire 10 pompes d'un coup", type: "FIRST_COME" as BadgeType, icon: "⚓", xpValue: 20 },
    { id: "SERIE_PUMP_50", name: "Machine (50)", description: "Premier à faire 50 pompes d'un coup", type: "FIRST_COME" as BadgeType, icon: "⚙️", xpValue: 300 },
    { id: "SERIE_PUMP_100", name: "Hercule (100)", description: "Premier à faire 100 pompes d'un coup", type: "FIRST_COME" as BadgeType, icon: "🏛️", xpValue: 1000 },
    { id: "SERIE_PUMP_150", name: "Olympien (150)", description: "Premier à faire 150 pompes d'un coup", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 2000 },

    // --- FAMILLE C : NIVEAUX (NATURE) ---
    { id: "LEVEL_SEED", name: "Graine de Champion", description: "Atteindre le niveau 1", type: "ACHIEVEMENT" as BadgeType, icon: "🌱", xpValue: 25 },
    { id: "LEVEL_SPROUT", name: "Jeune Pousse", description: "Atteindre le niveau 5", type: "ACHIEVEMENT" as BadgeType, icon: "🌿", xpValue: 200 },
    { id: "LEVEL_TREE", name: "Arbre Majestueux", description: "Atteindre le niveau 20", type: "ACHIEVEMENT" as BadgeType, icon: "🌳", xpValue: 2000 },
    { id: "LEVEL_FOREST", name: "Gardien de la Forêt", description: "Atteindre le niveau 50", type: "ACHIEVEMENT" as BadgeType, icon: "🌲", xpValue: 10000 },

    // --- FAMILLE D : ÉVÉNEMENTS SPÉCIAUX ---
    { id: "ANNIVERSARY_1", name: "Premier Anniversaire", description: "Présent lors du 1er anniversaire", type: "ACHIEVEMENT" as BadgeType, icon: "🎂", xpValue: 1000 },
    { id: "ST_MARVIN", name: "Saint Marvin", description: "Participé à l'événement St Marvin", type: "ACHIEVEMENT" as BadgeType, icon: "✨", xpValue: 500 },
];
