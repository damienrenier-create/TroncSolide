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
    { name: "Soleil", emoji: "☀️" }, { name: "Ciel", emoji: "🌌" }
];

export function getLevelInfo(totalXP: number) {
    // PROGRESSION PROGRESSIVE POUR DÉBUTANTS :
    // Étant donné que le jour 1 ne demande que 1 XP, et augmente de 1 par jour.
    // Cost pour le niveau i = i * 50 XP.
    // Niveau 1 = 50 XP (atteint au Jour 10 parfait).
    // Niveau 5 = 50 + 100 + 150 + 200 + 250 = 750 XP (atteint au Jour 38 parfait).
    // Niveau 20 = 10 500 XP (atteint vers 6 mois).
    // Niveau 50 = 63 750 XP (atteint vers 1 an d'efforts continus parfaits).

    let currentLevel = 0;
    let xpForNext = 50;
    let accumulated = 0;

    for (let i = 1; i <= 50; i++) {
        const cost = i * 50;
        if (totalXP >= (accumulated + cost)) {
            accumulated += cost;
            currentLevel = i;
        } else {
            xpForNext = accumulated + cost;
            break;
        }
    }

    const levelData = NATURE_LEVELS[currentLevel] || { name: "Élémentaire", emoji: "🌱" };
    return {
        level: currentLevel,
        name: levelData.name,
        emoji: levelData.emoji,
        nextLevelXP: xpForNext,
        progressXP: totalXP - accumulated,
        requiredXP: (currentLevel + 1) * 50 // The absolute XP cost of this specific level
    };
}
