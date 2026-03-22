# Incohérences Gamification & Plan de Patch Lot 2

## 1. Anomalies Détectées (Audit Post-Lot 1)

| Feature | Promesse UI / FAQ | Réalité Serveur | Impact |
| :--- | :--- | :--- | :--- |
| **Bonus Anniv.** | "Gagnez des bonus d'XP" | ❌ Ignoré dans `logExercise` | Frustration (Promesse non tenue). |
| **Badge Pionnier**| "Premier au niveau 10" | ✅ Implémenté | Correct. |
| **Badge Pot Master**| "50 jours consécutifs"| ❌ Logique `checkGamification` absente | Badge impossible à obtenir. |
| **Vitrines** | Affiche les badges réels | ✅ Basé sur `userBadge` | Correct. |
| **Gazette / Likes**| Flux live et likes | ✅ Sécurisé Lot 1 | Correct. |

---

## 2. Plan de Patch Lot 2

### A. Bonus Anniversaire (`exercise.ts`)
- **Action :** Modifier `logExercise` pour appeler `getActiveEvents(leagueId)`.
- **Règle :** Si un événement `ANNIVERSARY` est actif, multiplier l'XP par 1.5 (ou +50 XP bonus flat). Décider pour la version simple : multiplier par 1.5.

### B. Badge "Pot Master" (`gamification.ts`)
- **Action :** Implémenter la vérification du streak de 50 jours dans `checkGamification`.
- **Règle :** Si streak >= 50, attribuer le badge `POT_MASTER` (First Come).

### C. Alignement FAQ (`faq/page.tsx`)
- **Action :** Vérifier que la FAQ liste bien tous les badges de `BADGE_DEFINITIONS`.
- **Action :** Mentionner explicitement le bonus d'XP Anniversaire dans la FAQ pour plus de clarté.

---

## 3. Justification
On termine le "polish" du jeu. Le but est que l'utilisateur qui fait l'effort de s'entraîner pile pour l'anniversaire d'un pote soit récompensé comme promis par le petit bandeau sur le dashboard.

---

## 4. Tests Manuels Lot 2
1. Simuler un anniversaire (en changeant un birthday en DB).
2. Logger une séance -> Vérifier que l'XP enregistrée est augmentée.
3. Vérifier que la FAQ affiche les mêmes icônes que le profil.
