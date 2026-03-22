export const NATURE_LEVELS = [
    "Graine", "Germe", "Pousse", "Tige", "Feuille", "Bourgeon", "Fleur", "Pétale", "Sève", "Racine",
    "Arbrisseau", "Buisson", "Fougère", "Mousse", "Lierre", "Bambou", "Roseau", "Genêt", "Bruyère", "Ajonc",
    "Arbuste", "Bouleau", "Saule", "Tremble", "Aulne", "Charme", "Frêne", "Érable", "Hêtre", "Mélèze",
    "Pin", "Sapin", "Cèdre", "Séquoia", "Baobab", "Olivier", "Chêne", "Orme", "Tilleul", "Noyer",
    "Forêt", "Bosquet", "Clairière", "Vallée", "Montagne", "Rivière", "Océan", "Nuage", "Soleil", "Ciel"
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

    return {
        level: currentLevel,
        name: NATURE_LEVELS[currentLevel] || "Élémentaire",
        nextLevelXP: xpForNext,
        progressXP: totalXP - accumulated,
        requiredXP: (currentLevel + 1) * 50 // The absolute XP cost of this specific level
    };
}
