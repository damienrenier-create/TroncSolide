import { BadgeType } from "@prisma/client";

export const BADGE_DEFINITIONS = [
    // --- FAMILLE A : ACCOMPLISSEMENTS PERSONNELS ---
    { id: "EARLY_BIRD", name: "Lève-tôt", description: "S'entraîner avant 7h du matin", type: "ACHIEVEMENT" as BadgeType, icon: "🌅", xpValue: 25 },
    { id: "NIGHT_OWL", name: "Oiseau de nuit", description: "S'entraîner après 22h", type: "ACHIEVEMENT" as BadgeType, icon: "🦉", xpValue: 25 },
    { id: "SQUAT_LOVER", name: "Squat Lover", description: "Faire 5 séances de squats", type: "ACHIEVEMENT" as BadgeType, icon: "🍑", xpValue: 50 },
    { id: "MOOD_MASTER", name: "Mood Master", description: "Loguer 10 séances avec un mood", type: "ACHIEVEMENT" as BadgeType, icon: "🎭", xpValue: 100 },
    { id: "CENTURION", name: "Centurion", description: "Atteindre 100s/reps en une séance", type: "ACHIEVEMENT" as BadgeType, icon: "💯", xpValue: 500 }, // Huge goal for a beginner

    // --- FAMILLE B1 : PALIERS DE VOLUME (PIONNIERS) ---
    // Pompages
    { id: "PUMP_100", name: "100 Pompages", description: "Pionnier du palier 100 pompes", type: "FIRST_COME" as BadgeType, icon: "💪", xpValue: 50 },
    { id: "PUMP_1000", name: "1 000 Pompages", description: "Pionnier du palier 1 000 pompes", type: "FIRST_COME" as BadgeType, icon: "🔥", xpValue: 500 },
    { id: "PUMP_2000", name: "2 000 Pompages", description: "Pionnier du palier 2 000 pompes", type: "FIRST_COME" as BadgeType, icon: "💣", xpValue: 1000 },
    { id: "PUMP_5000", name: "5 000 Pompages", description: "Pionnier du palier 5 000 pompes", type: "FIRST_COME" as BadgeType, icon: "🌋", xpValue: 2500 },
    { id: "PUMP_10000", name: "10 000 Pompages", description: "Pionnier du palier 10 000 pompes", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 5000 },
    { id: "PUMP_20000", name: "20 000 Pompages", description: "Pionnier du palier 20 000 pompes", type: "FIRST_COME" as BadgeType, icon: "💎", xpValue: 10000 },
    { id: "PUMP_50000", name: "50 000 Pompages", description: "Pionnier du palier 50 000 pompes", type: "FIRST_COME" as BadgeType, icon: "✨", xpValue: 25000 },
    { id: "PUMP_100000", name: "100 000 Pompages", description: "Légende absolue du palier 100 000 pompes", type: "FIRST_COME" as BadgeType, icon: "🌌", xpValue: 50000 },

    // Squats
    { id: "SQUAT_100", name: "100 Squats", description: "Pionnier du palier 100 squats", type: "FIRST_COME" as BadgeType, icon: "🦵", xpValue: 50 },
    { id: "SQUAT_1000", name: "1 000 Squats", description: "Pionnier du palier 1 000 squats", type: "FIRST_COME" as BadgeType, icon: "⚡", xpValue: 500 },
    { id: "SQUAT_5000", name: "5 000 Squats", description: "Pionnier du palier 5 000 squats", type: "FIRST_COME" as BadgeType, icon: "🏔️", xpValue: 2500 },

    // Gainage (Ventral/Latéral)
    { id: "PLANK_1000S", name: "1 000s Gainage", description: "Pionnier du palier 1 000s de gainage", type: "FIRST_COME" as BadgeType, icon: "🛡️", xpValue: 500 },
    { id: "PLANK_10000S", name: "10 000s Gainage", description: "Pionnier du palier 10 000s de gainage", type: "FIRST_COME" as BadgeType, icon: "🏆", xpValue: 5000 },
    { id: "PLANK_100000S", name: "100 000s Gainage", description: "Pionnier du palier 100 000s de gainage", type: "FIRST_COME" as BadgeType, icon: "🌀", xpValue: 50000 },

    // --- FAMILLE B2 : PALIERS DE SÉRIE (PIONNIERS) ---
    // Gainage
    { id: "SERIE_PLANK_30S", name: "Mur d'Acier (30s)", description: "Pionnier du palier 30s en une série", type: "FIRST_COME" as BadgeType, icon: "🧱", xpValue: 50 },
    { id: "SERIE_PLANK_1M", name: "Inébranlable (1m)", description: "Pionnier du palier 1m en une série", type: "FIRST_COME" as BadgeType, icon: "🗿", xpValue: 150 },
    { id: "SERIE_PLANK_1M30", name: "Roc (1m30)", description: "Pionnier du palier 1m30 en une série", type: "FIRST_COME" as BadgeType, icon: "⛰️", xpValue: 300 },
    { id: "SERIE_PLANK_2M", name: "Légende (2m)", description: "Pionnier du palier 2m en une série", type: "FIRST_COME" as BadgeType, icon: "🗻", xpValue: 600 },
    { id: "SERIE_PLANK_3M", name: "Infatigable (3m)", description: "Pionnier du palier 3m en une série", type: "FIRST_COME" as BadgeType, icon: "🌋", xpValue: 1200 },
    { id: "SERIE_PLANK_5M", name: "Titan (5m)", description: "Pionnier du palier 5m en une série", type: "FIRST_COME" as BadgeType, icon: "🏔️", xpValue: 3000 },
    { id: "SERIE_PLANK_10M", name: "Demi-Dieu (10m)", description: "Pionnier du palier 10m en une série", type: "FIRST_COME" as BadgeType, icon: "🪐", xpValue: 10000 },

    // Pompages
    { id: "SERIE_PUMP_10", name: "Pousseur (10)", description: "Pionnier du palier 10 pompes en une série", type: "FIRST_COME" as BadgeType, icon: "⚓", xpValue: 20 },
    { id: "SERIE_PUMP_50", name: "Machine (50)", description: "Pionnier du palier 50 pompes en une série", type: "FIRST_COME" as BadgeType, icon: "⚙️", xpValue: 300 },
    { id: "SERIE_PUMP_100", name: "Hercule (100)", description: "Pionnier du palier 100 pompes en une série", type: "FIRST_COME" as BadgeType, icon: "🏛️", xpValue: 1000 },
    { id: "SERIE_PUMP_150", name: "Olympien (150)", description: "Pionnier du palier 150 pompes en une série", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 2000 },

    // --- FAMILLE C : NIVEAUX (NATURE) ---
    { id: "LEVEL_SEED", name: "Graine de Champion", description: "Atteindre le niveau 1", type: "ACHIEVEMENT" as BadgeType, icon: "🌱", xpValue: 25 },
    { id: "LEVEL_SPROUT", name: "Jeune Pousse", description: "Atteindre le niveau 5", type: "ACHIEVEMENT" as BadgeType, icon: "🌿", xpValue: 200 },
    { id: "LEVEL_TREE", name: "Arbre Majestueux", description: "Atteindre le niveau 20", type: "ACHIEVEMENT" as BadgeType, icon: "🌳", xpValue: 2000 },
    { id: "LEVEL_FOREST", name: "Gardien de la Forêt", description: "Atteindre le niveau 50", type: "ACHIEVEMENT" as BadgeType, icon: "🌲", xpValue: 10000 },

    // --- FAMILLE D : ÉVÉNEMENTS SPÉCIAUX ---
    { id: "ANNIVERSARY_1", name: "Premier Anniversaire", description: "Présent lors du 1er anniversaire", type: "ACHIEVEMENT" as BadgeType, icon: "🎂", xpValue: 1000 },
    { id: "BIRTHDAY_STAR", name: "Joyeux Anniversaire", description: "A remporté son duel d'anniversaire contre la ligue !", type: "ACHIEVEMENT" as BadgeType, icon: "👑", xpValue: 0 },
    { id: "BIRTHDAY_HUNTER", name: "Chasseur d'Anniversaire", description: "A battu la star du jour pendant son anniversaire.", type: "ACHIEVEMENT" as BadgeType, icon: "🏹", xpValue: 100 },

    // POISSONS D'AVRIL
    { id: "APRIL_FOOLS_1", name: "Friture", description: "5ème du 1er avril", type: "ACHIEVEMENT" as BadgeType, icon: "🐟", xpValue: 100 },
    { id: "APRIL_FOOLS_2", name: "Sardine Étincelante", description: "4ème du 1er avril", type: "ACHIEVEMENT" as BadgeType, icon: "🐠", xpValue: 200 },
    { id: "APRIL_FOOLS_3", name: "Bar Agile", description: "3ème du 1er avril", type: "ACHIEVEMENT" as BadgeType, icon: "🐡", xpValue: 400 },
    { id: "APRIL_FOOLS_4", name: "Requin Marteau", description: "2ème du 1er avril", type: "ACHIEVEMENT" as BadgeType, icon: "🦈", xpValue: 700 },
    { id: "APRIL_FOOLS_5", name: "Mégaleodon", description: "Champion du 1er avril", type: "ACHIEVEMENT" as BadgeType, icon: "🐳", xpValue: 1200 },

    // PÂQUES
    { id: "EASTER_1", name: "Œuf de Colibri", description: "5ème de Pâques", type: "ACHIEVEMENT" as BadgeType, icon: "🪺", xpValue: 100 },
    { id: "EASTER_2", name: "Œuf de Moineau", description: "4ème de Pâques", type: "ACHIEVEMENT" as BadgeType, icon: "🥚", xpValue: 200 },
    { id: "EASTER_3", name: "Œuf de Poule", description: "3ème de Pâques", type: "ACHIEVEMENT" as BadgeType, icon: "🐣", xpValue: 400 },
    { id: "EASTER_4", name: "Œuf d'Autruche", description: "2ème de Pâques", type: "ACHIEVEMENT" as BadgeType, icon: "🥚", xpValue: 700 },
    { id: "EASTER_5", name: "Œuf de Dinosaure", description: "Champion de Pâques", type: "ACHIEVEMENT" as BadgeType, icon: "🦖", xpValue: 1200 },

    // FÊTE DES MÈRES
    { id: "MOTHERS_DAY_GOLD", name: "Maman d'Or", description: "Top 1 XP - Fête des Mères", type: "ACHIEVEMENT" as BadgeType, icon: "💖", xpValue: 500 },
    { id: "MOTHERS_DAY_SILVER", name: "Maman d'Argent", description: "Top 2 XP - Fête des Mères", type: "ACHIEVEMENT" as BadgeType, icon: "🤍", xpValue: 300 },
    { id: "MOTHERS_DAY_BRONZE", name: "Maman de Bronze", description: "Top 3 XP - Fête des Mères", type: "ACHIEVEMENT" as BadgeType, icon: "🤎", xpValue: 150 },

    // FÊTE DES PÈRES
    { id: "FATHERS_DAY_GOLD", name: "Papa d'Or", description: "Top 1 XP - Fête des Pères", type: "ACHIEVEMENT" as BadgeType, icon: "💙", xpValue: 500 },
    { id: "FATHERS_DAY_SILVER", name: "Papa d'Argent", description: "Top 2 XP - Fête des Pères", type: "ACHIEVEMENT" as BadgeType, icon: "🤍", xpValue: 300 },
    { id: "FATHERS_DAY_BRONZE", name: "Papa de Bronze", description: "Top 3 XP - Fête des Pères", type: "ACHIEVEMENT" as BadgeType, icon: "🤎", xpValue: 150 },

    // --- FAMILLE E : LES RECORDS DE LIGUE (LE VOL) ---
    // Ces badges dynamiques n'ont pas d'xpValue fixe ici car leur valeur dépend de la taille de l'exploit !
    // Pompes
    { id: "RECORD_DAY_PUSHUP", name: "Champion du Jour (Pompes)", description: "Détenteur actuel du record absolu de Pompes sur 1 journée.", type: "FIRST_COME" as BadgeType, icon: "🥇", xpValue: 0 },
    { id: "RECORD_WEEK_PUSHUP", name: "Champion de la Sem. (Pompes)", description: "Détenteur actuel du record absolu de Pompes sur 1 semaine.", type: "FIRST_COME" as BadgeType, icon: "🏆", xpValue: 0 },
    { id: "RECORD_MONTH_PUSHUP", name: "Champion du Mois (Pompes)", description: "Détenteur actuel du record absolu de Pompes sur 1 mois entier.", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 0 },
    { id: "RECORD_SERIES_PUSHUP", name: "L'Imbattable (Série Pompes)", description: "Détenteur actuel du record ALL-TIME de la plus longue série de pompes.", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 0 },

    // Squats
    { id: "RECORD_DAY_SQUAT", name: "Champion du Jour (Squat)", description: "Détenteur actuel du record absolu de Squats sur 1 journée.", type: "FIRST_COME" as BadgeType, icon: "🥇", xpValue: 0 },
    { id: "RECORD_WEEK_SQUAT", name: "Champion de la Sem. (Squat)", description: "Détenteur actuel du record absolu de Squats sur 1 semaine.", type: "FIRST_COME" as BadgeType, icon: "🏆", xpValue: 0 },
    { id: "RECORD_MONTH_SQUAT", name: "Champion du Mois (Squat)", description: "Détenteur actuel du record absolu de Squats sur 1 mois entier.", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 0 },
    { id: "RECORD_SERIES_SQUAT", name: "L'Imbattable (Série Squat)", description: "Détenteur actuel du record ALL-TIME de la plus longue série de squats.", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 0 },

    // Gainage
    { id: "RECORD_DAY_PLANK", name: "Champion du Jour (Gainage)", description: "Détenteur actuel du record absolu de Gainage Total sur 1 journée.", type: "FIRST_COME" as BadgeType, icon: "🥇", xpValue: 0 },
    { id: "RECORD_WEEK_PLANK", name: "Champion de la Sem. (Gainage)", description: "Détenteur actuel du record absolu de Gainage Total sur 1 semaine.", type: "FIRST_COME" as BadgeType, icon: "🏆", xpValue: 0 },
    { id: "RECORD_MONTH_PLANK", name: "Champion du Mois (Gainage)", description: "Détenteur actuel du record absolu de Gainage Total sur 1 mois entier.", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 0 },
    { id: "RECORD_SERIES_PLANK", name: "L'Imbattable (Série Gainage)", description: "Détenteur actuel du record ALL-TIME de la plus longue série de gainage.", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 0 },

    // --- FAMILLE F : LA VITRINE HOLISTIQUE (FULL BODY) ---
    // En une séance (Batch) : Chaque exercice doit atteindre le palier
    { id: "HOLISTIC_LOG_1", name: "L'Équilibré (1/exo)", description: "Réaliser au moins 1 de chaque (Ventral, D, G, Pompe, Squat) en un seul log.", type: "FIRST_COME" as BadgeType, icon: "🧘", xpValue: 100 },
    { id: "HOLISTIC_LOG_5", name: "L'Harmonieux (5/exo)", description: "Réaliser au moins 5 de chaque (Ventral, D, G, Pompe, Squat) en un seul log.", type: "FIRST_COME" as BadgeType, icon: "🤸", xpValue: 250 },
    { id: "HOLISTIC_LOG_10", name: "Le Symétrique (10/exo)", description: "Réaliser au moins 10 de chaque (Ventral, D, G, Pompe, Squat) en un seul log.", type: "FIRST_COME" as BadgeType, icon: "🧬", xpValue: 500 },
    { id: "HOLISTIC_LOG_30", name: "L'Intégral (30/exo)", description: "Réaliser au moins 30 de chaque (Ventral, D, G, Pompe, Squat) en un seul log.", type: "FIRST_COME" as BadgeType, icon: "🌌", xpValue: 2000 },
    { id: "HOLISTIC_LOG_60", name: "Le Maître Holistique (60/exo)", description: "Réaliser au moins 60 de chaque (Ventral, D, G, Pompe, Squat) en un seul log.", type: "FIRST_COME" as BadgeType, icon: "👑", xpValue: 5000 },

    // Milestones (Cumulatif) : 100, 600, 6000 de chaque exo depuis le début
    { id: "HOLISTIC_MILESTONE_100", name: "Apprenti Holistique (100/exo)", description: "Avoir fait au moins 100 de chaque exercice cumulés au total.", type: "FIRST_COME" as BadgeType, icon: "💠", xpValue: 500 },
    { id: "HOLISTIC_MILESTONE_600", name: "Expert Holistique (600/exo)", description: "Avoir fait au moins 600 de chaque exercice cumulés au total.", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 3000 },
    { id: "HOLISTIC_MILESTONE_6000", name: "Légende Holistique (6000/exo)", description: "Avoir fait au moins 6 000 de chaque exercice cumulés au total.", type: "FIRST_COME" as BadgeType, icon: "💎", xpValue: 15000 },

    // --- FAMILLE G : LA VITRINE RÉGULARITÉ (STREAKS & CONSISTENCY) ---
    { id: "REGULARITY_1_EFFORT_5D", name: "Premier Pas (5j)", description: "Avoir fait au moins 1 effort sur 5 jours différents (pas forcément d'affilé).", type: "FIRST_COME" as BadgeType, icon: "🌱", xpValue: 150 },
    { id: "REGULARITY_1_PUSHUP_5D", name: "Pousseur Régulier (5j)", description: "Avoir fait au moins 1 pompe sur 5 jours différents.", type: "FIRST_COME" as BadgeType, icon: "⚓", xpValue: 200 },
    { id: "REGULARITY_1_VENTRAL_5D", name: "Gaineur Régulier (5j)", description: "Avoir fait au moins 1s de gainage ventral sur 5 jours différents.", type: "FIRST_COME" as BadgeType, icon: "🛡️", xpValue: 200 },

    { id: "REGULARITY_STREAK_1_3D", name: "Petite Série (3j)", description: "Avoir fait au moins 1 effort par jour pendant 3 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🔥", xpValue: 100 },
    { id: "REGULARITY_STREAK_3_3D", name: "Série Active (3j)", description: "Avoir fait au moins 3 efforts par jour pendant 3 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "⚡", xpValue: 200 },
    { id: "REGULARITY_STREAK_30_3D", name: "Série Intense (3j)", description: "Avoir fait au moins 30 efforts par jour pendant 3 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "💥", xpValue: 500 },

    { id: "REGULARITY_STREAK_30_7D", name: "La Semaine de Fer (7j)", description: "Avoir fait au moins 30 efforts par jour pendant 7 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "⛓️", xpValue: 1500 },
    { id: "REGULARITY_STREAK_30_21D", name: "L'Habitude de Fer (21j)", description: "Avoir fait au moins 30 efforts par jour pendant 21 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🏗️", xpValue: 5000 },

    { id: "REGULARITY_STREAK_3DIFF_7D", name: "Polyvalence Hebdo (7j)", description: "Avoir fait au moins 3 types d'efforts différents par jour pendant 7 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🌈", xpValue: 2000 },
    { id: "REGULARITY_STREAK_3DIFF_10D", name: "Maître Varié (10j)", description: "Avoir fait au moins 3 types d'efforts différents par jour pendant 10 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎭", xpValue: 3500 },
    { id: "REGULARITY_STREAK_3DIFF_21D", name: "Inébranlable & Varié (21j)", description: "Avoir fait au moins 3 types d'efforts différents par jour pendant 21 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🌌", xpValue: 8000 },

    { id: "REGULARITY_STREAK_TARGET_3D", name: "Précision (3j)", description: "Avoir atteint son objectif quotidien pendant 3 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 300 },
    { id: "REGULARITY_STREAK_TARGET_6D", name: "Précision (6j)", description: "Avoir atteint son objectif quotidien pendant 6 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 1000 },
    { id: "REGULARITY_STREAK_TARGET_12D", name: "Précision (12j)", description: "Avoir atteint son objectif quotidien pendant 12 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 2500 },
    { id: "REGULARITY_STREAK_TARGET_24D", name: "Précision (24j)", description: "Avoir atteint son objectif quotidien pendant 24 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 6000 },
    { id: "REGULARITY_STREAK_TARGET_48D", name: "Précision (48j)", description: "Avoir atteint son objectif quotidien pendant 48 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 15000 },
    { id: "REGULARITY_STREAK_TARGET_96D", name: "Précision (96j)", description: "Avoir atteint son objectif quotidien pendant 96 jours d'affilé.", type: "FIRST_COME" as BadgeType, icon: "🎯", xpValue: 40000 },
    {
        id: "HIDDEN_FOU_CLIC",
        name: "Fou du Clic",
        description: "A fait vieillir l'arbre sacré jusqu'à son propre âge. Frénétique !",
        icon: "🖱️",
        xpValue: 0,
        type: "ACHIEVEMENT" as BadgeType
    },
    {
        id: "HIDDEN_ZEN_BIRD",
        name: "L'Oiseau de la Paix",
        description: "A su rester immobile assez longtemps pour que la nature reprenne ses droits. Zen !",
        icon: "🐦",
        xpValue: 50,
        type: "ACHIEVEMENT" as BadgeType
    },
    {
        id: "HIDDEN_RETRO_GAINEUR",
        name: "Rétro-Gaineur",
        description: "A invoqué les anciens esprits du code Konami. Nostalgique !",
        icon: "🕹️",
        xpValue: 0,
        type: "ACHIEVEMENT" as BadgeType
    },
    // --- FAMILLE H : BRING SALLY UP (CHALLENGES MENSUELS) ---
    { id: "BSU_PARTICIPANT", name: "Sally's Guest", description: "A participé au challenge Bring Sally Up pour la première fois.", type: "ACHIEVEMENT" as BadgeType, icon: "🎵", xpValue: 150 },
    { id: "BSU_DOUBLE_THREAT", name: "Double Challenge", description: "A complété les variantes Pompes ET Squats du Bring Sally Up le même mois.", type: "ACHIEVEMENT" as BadgeType, icon: "⚔️", xpValue: 300 },
    { id: "BSU_STREAK_3", name: "Régularité Sally (3 mois)", description: "A participé au challenge Bring Sally Up pendant 3 mois consécutifs.", type: "ACHIEVEMENT" as BadgeType, icon: "🎖️", xpValue: 1000 },
    { id: "BSU_RECORD_PUSHUP", name: "L'Imbattable (BSU Pompes)", description: "Détenteur du record absolu du Bring Sally Up (Pompes). Volable !", type: "FIRST_COME" as BadgeType, icon: "🔱", xpValue: 0 }
];
