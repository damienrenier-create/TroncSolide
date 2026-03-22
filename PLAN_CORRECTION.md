# Plan de Correction Incrémental - `tronc-solide`

Ce plan fait suite à l'audit Passe 3 et vise à stabiliser l'application pour une mise en production "entre amis" sans refactor global.

---

## 🟢 Lot 0 : Cohérence & Intégrité du Jeu (Priorité Absolue)
**Objectif :** Garantir que les scores sont justes, que les tricheurs supprimés disparaissent vraiment et que les calculs de dates ne pénalisent pas injustement les joueurs.

### 1. Recalcul des Records après Suppression Admin
- **Action :** Compléter `deleteSession` pour qu'elle déclenche une re-synchronisation des records si la séance supprimée était le sommet actuel.
- **Vérification :** Créer un record, le supprimer via admin, vérifier que le Hall of Fame affiche le second meilleur score.

### 2. Standardisation des Dates & Timezones
- **Action :** Forcer l'utilisation de `startOfDay(new Date())` avec un offset fixe ou s'assurer que le client envoie l'ISO-8601 complet pour éviter le décalage UTC Vercel.
- **Risque :** Changement de comportement pour les séances passées (faible).

### 3. Protection Badge Unique "Pionnier"
- **Action :** Englober la vérification `alreadyTaken` et l'attribution du badge dans une transaction Prisma.

### 4. Cloisonnement Serveur (Rankings)
- **Action :** Dans `getLeagueRankings`, injecter systématiquement le `leagueId` de la session utilisateur.

---

## 🟡 Lot 1 : Anti-Triche & Sécurité "Gamin"
**Objectif :** Empêcher les manipulations d'identité évidentes.

### 1. Identité depuis Session (IDOR Logic)
- **Action :** Remplacer le `userId` passé en argument par `session.user.id` dans `economy.ts` et `social.ts`.

### 2. Nettoyage `createLeague`
- **Action :** Supprimer la version publique/doublon de `createLeague` dans `auth.ts`.

---

## 🔵 Lot 2 : Performance & Expérience (Polish)
**Objectif :** Fluidité et plaisir d'utilisation.

### 1. Optimisation Dashboard
- **Action :** Optimiser les boucles de calcul de streak/cagnotte.

### 2. Bonus Anniversaire (Le vrai)
- **Action :** Coder le multiplicateur d'XP promis.

---

## Stratégie de Vérification
- `npm run build` après chaque lot.
- Tests manuels sur les fonctions de modération.
