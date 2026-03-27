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
];
