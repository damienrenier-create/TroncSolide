export const NATURE_LEVELS = [
    "Graine", "Germe", "Pousse", "Tige", "Feuille", "Bourgeon", "Fleur", "Pétale", "Sève", "Racine",
    "Arbrisseau", "Buisson", "Fougère", "Mousse", "Lierre", "Bambou", "Roseau", "Genêt", "Bruyère", "Ajonc",
    "Arbuste", "Bouleau", "Saule", "Tremble", "Aulne", "Charme", "Frêne", "Érable", "Hêtre", "Mélèze",
    "Pin", "Sapin", "Cèdre", "Séquoia", "Baobab", "Olivier", "Chêne", "Orme", "Tilleul", "Noyer",
    "Forêt", "Bosquet", "Clairière", "Vallée", "Montagne", "Rivière", "Océan", "Nuage", "Soleil", "Ciel"
];

export function getLevelInfo(totalXP: number) {
    // Progression: Level 1 = 500XP, Level 2 = 1000XP, etc.
    // Formula: Sum of (i * 500) for i = 1 to level
    // Approximate inverse: level = sqrt(2 * XP / 500)

    let currentLevel = 0;
    let xpForNext = 500;
    let accumulated = 0;

    for (let i = 1; i <= 50; i++) {
        const cost = i * 500;
        if (totalXP >= (accumulated + cost)) {
            accumulated += cost;
            currentLevel = i;
        } else {
            xpForNext = accumulated + cost;
            break;
        }
    }

    return {
        level: currentLevel,
        name: NATURE_LEVELS[currentLevel] || "Élémentaire",
        nextLevelXP: xpForNext,
        progressXP: totalXP - accumulated,
        requiredXP: (currentLevel + 1) * 500
    };
}
