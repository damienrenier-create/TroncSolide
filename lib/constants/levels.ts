export const NATURE_LEVELS = [
    { name: "Graine", emoji: "🌰" }, { name: "Germe", emoji: "🪴" }, { name: "Pousse", emoji: "🌱" },
    { name: "Tige", emoji: "🌿" }, { name: "Feuille", emoji: "🍃" }, { name: "Bourgeon", emoji: "🏵️" },
    { name: "Fleur", emoji: "🌸" }, { name: "Pétale", emoji: "💮" }, { name: "Sève", emoji: "🍯" },
    { name: "Racine", emoji: "🪵" }, { name: "Arbrisseau", emoji: "🌾" }, { name: "Buisson", emoji: "🪹" },
    { name: "Fougère", emoji: "🪷" }, { name: "Mousse", emoji: "🦠" }, { name: "Lierre", emoji: "🕸️" }, 
    { name: "Bambou", emoji: "🎋" }, { name: "Roseau", emoji: "🌾" }, { name: "Genêt", emoji: "🌼" }, 
    { name: "Bruyère", emoji: "🪻" }, { name: "Ajonc", emoji: "🌵" }, { name: "Arbuste", emoji: "🪴" },
    { name: "Bouleau", emoji: "🌳" }, { name: "Saule", emoji: "🌲" }, { name: "Tremble", emoji: "🍁" },
    { name: "Aulne", emoji: "🍂" }, { name: "Charme", emoji: "🌳" }, { name: "Frêne", emoji: "🌲" },
    { name: "Érable", emoji: "🍁" }, { name: "Hêtre", emoji: "🪵" }, { name: "Mélèze", emoji: "🌲" },
    { name: "Pin", emoji: "🌲" }, { name: "Sapin", emoji: "🎄" }, { name: "Cèdre", emoji: "🌲" },
    { name: "Séquoia", emoji: "🪵" }, { name: "Baobab", emoji: "🌳" }, { name: "Olivier", emoji: "🫒" },
    { name: "Chêne", emoji: "🌳" }, { name: "Orme", emoji: "🌳" }, { name: "Tilleul", emoji: "🍃" },
    { name: "Noyer", emoji: "🥜" }, { name: "Forêt", emoji: "🌲" }, { name: "Bosquet", emoji: "🌳" },
    { name: "Clairière", emoji: "🦌" }, { name: "Vallée", emoji: "⛰️" }, { name: "Montagne", emoji: "🏔️" },
    { name: "Rivière", emoji: "🏞️" }, { name: "Océan", emoji: "🌊" }, { name: "Nuage", emoji: "☁️" },
    { name: "Soleil", emoji: "☀️" }, { name: "Ciel", emoji: "🌌" },
    // 51-60 (Atmosphère)
    { name: "Brise de l'Esprit", emoji: "🌬️" }, { name: "Vent de Volonté", emoji: "💨" }, { name: "Rafale d'Acier", emoji: "⚔️" },
    { name: "Tempête de Feu", emoji: "🔥" }, { name: "Ouragan du Nord", emoji: "🌀" }, { name: "Tornade Étoilée", emoji: "🌪️" },
    { name: "Foudre de Pureté", emoji: "⚡" }, { name: "Éclair d'Énergie", emoji: "🎇" }, { name: "Tonnerre d'Abysse", emoji: "⛈️" },
    { name: "Zénith Céleste", emoji: "☀️" },
    // 61-70 (Lunaire)
    { name: "Croissant de Nuit", emoji: "🌙" }, { name: "Quartier d'Argent", emoji: "🌗" }, { name: "Gibbeuse de Glace", emoji: "🌔" },
    { name: "Pleine Lune de Sang", emoji: "🌕" }, { name: "Éclipse Totale", emoji: "🌑" }, { name: "Halo de Mystère", emoji: "💫" },
    { name: "Marée d'Éternité", emoji: "🌊" }, { name: "Nuit Sans Fin", emoji: "🌃" }, { name: "Comète de la Destinée", emoji: "☄️" },
    { name: "Astéroïde de Diamant", emoji: "💎" },
    // 71-80 (Stellaire)
    { name: "Étoile du Matin", emoji: "⭐" }, { name: "Constellation du Lion", emoji: "♌" }, { name: "Orion", emoji: "🏹" },
    { name: "Pléiades de Cristal", emoji: "✨" }, { name: "Voie Lactée", emoji: "🌌" }, { name: "Nébuleuse de l'Origine", emoji: "💨" },
    { name: "Supernova Éclatante", emoji: "💥" }, { name: "Pulsar Temporel", emoji: "⏲️" }, { name: "Quasar Perçant", emoji: "🚀" },
    { name: "Trou Noir Absolu", emoji: "🕳️" },
    // 81-90 (Galactique)
    { name: "Galaxie Primordiale", emoji: "🌀" }, { name: "Amas de Lumière", emoji: "✨" }, { name: "Superamas Stellaire", emoji: "🌟" },
    { name: "Horizon des Événements", emoji: "🌒" }, { name: "Singularité de l'Être", emoji: "⚛️" }, { name: "Mur de Planck", emoji: "🧱" },
    { name: "Big Bang Créateur", emoji: "🎆" }, { name: "Maître du Temps", emoji: "⏳" }, { name: "Souverain de l'Espace", emoji: "🛰️" },
    { name: "Éther Pur", emoji: "🌌" },
    // 91-100 (Divin/Infini)
    { name: "Cosmos de l'Esprit", emoji: "🧠" }, { name: "Univers de Matière", emoji: "🪐" }, { name: "Multivers Parallèle", emoji: "🌐" },
    { name: "Dimension Supérieure", emoji: "📐" }, { name: "Réalité Déchirée", emoji: "⚡" }, { name: "Éternité Rayonnante", emoji: "♾️" },
    { name: "Infini de Force", emoji: "♾️" }, { name: "Essence du Tronc", emoji: "🪵" }, { name: "Origine du Monde", emoji: "🌍" },
    { name: "Tronc Absolu", emoji: "👑" }
];

export function getLevelInfo(totalXP: number) {
    // FORMULE UTILISATEUR :
    // NV 1 : 0 XP
    // NV 2 : 50 XP (coût +50)
    // NV 3 : 150 XP (coût +100)
    // NV 4 : 300 XP (coût +150)
    // ACCÉLÉRATION : Après le niveau 50, le coût augmente de manière quadratique.

    let currentLevel = 1;
    let accumulated = 0;

    for (let i = 2; i <= 100; i++) {
        const linearCost = (i - 1) * 50;
        const acceleration = i > 50 ? Math.pow(i - 50, 2) * 10 : 0;
        const cost = linearCost + acceleration;
        
        if (totalXP >= (accumulated + cost)) {
            accumulated += cost;
            currentLevel = i;
        } else {
            break;
        }
    }

    const nextLevelIndex = currentLevel + 1;
    const nextLinear = (nextLevelIndex - 1) * 50;
    const nextAcceleration = nextLevelIndex > 50 ? Math.pow(nextLevelIndex - 50, 2) * 10 : 0;
    const nextLevelCost = nextLinear + nextAcceleration;
    const nextLevelXP = accumulated + nextLevelCost;

    const levelData = NATURE_LEVELS[currentLevel - 1] || NATURE_LEVELS[NATURE_LEVELS.length - 1];

    return {
        level: currentLevel,
        name: levelData.name,
        emoji: levelData.emoji,
        nextLevelXP: nextLevelXP,
        progressXP: totalXP - accumulated,
        requiredXP: nextLevelCost
    };
}
