# Carte des Effets Dérivés & Plan de Patch Lot 0

## 1. Inventaire des Effets Dérivés
Lorsqu'une séance est injectée ou supprimée, les éléments suivants sont impactés :

| Effet | Statut Création (Log) | Statut Suppression (Modéro) | Impact Cohérence |
| :--- | :--- | :--- | :--- |
| **XP Total** | ✅ Recalculé | ✅ Reverti | Correct |
| **Niveau** | ✅ Up (Dynamique) | ❌ **Oublié** | Un user supprimé peut garder un niveau trop haut. |
| **Badges Shared** | ✅ Gagné (Si check) | ❌ **Oublié** | Badge reste acquis même si les conditions ne sont plus réunies. |
| **Badges Uniques**| ✅ Gagné (Pionnier) | ❌ **Oublié** | Badge bloqué pour les autres même si le vainqueur est supprimé. |
| **Records League** | ✅ Mis à jour (Upsert)| ❌ **Oublié** | Record "fantôme" reste en Hall of Fame. |
| **Streak** | 🔄 Dynamique (Calculé)| 🔄 Dynamique | Correct (Calculé à la volée). |
| **Cagnotte/Pénal.**| 🔄 Dynamique | 🔄 Dynamique | Correct (Calculé à la volée). |
| **Social Feed** | ✅ Item créé | ❌ **Oublié** | L'annonce du record/niveau reste dans le feed. |

---

## 2. Plan de Patch Minimal (Lot 0)

### A. Suppression Chirurgicale (`moderation.ts`)
- **Action :** Modifier `deleteSession` pour supprimer également le record associé si la séance supprimée était le record de la ligue, et forcer un recalcul.
- **Action :** Supprimer les `FeedItem` liés à l'XP/Badges gagnés durant cette séance (via cascade Prisma ou delete manuel).

### B. Alignement Temporel Brussels (`exercise.ts`)
- **Problème :** `new Date()` sur Vercel = UTC. Pour un Belge à 00:30, c'est encore hier.
- **Solution :** Utiliser `toZonedTime` de `date-fns-tz` ou forcer l'offset `+1/+2` pour définir le "Jour Métier".

### C. Protection Badge Unique (`gamification.ts`)
- **Problème :** Race condition entre le check `alreadyTaken` et l'update.
- **Solution :** Utiliser une transaction Prisma avec un check de verrouillage (ou contrainte d'unicité sur `winnerId` pour les badges de type `FIRST_COME`).

### D. Synchronisation Records (`record.ts`)
- **Action :** Exposer une fonction `recalculateLeagueRecords(leagueId)` appelée après une suppression modérateur pour garantir que le Hall of Fame est propre.

---

## 3. Justification Métier
Ce plan assure que si un ami triche et qu'on supprime sa séance, le classement de la bande redevient immédiatement juste. Il évite aussi les frustrations liées aux streaks perdus à cause du décalage horaire Vercel.

---

## 4. Tests Manuels Lot 0
1. Créer une séance à 00:15 (heure locale) -> Vérifier qu'elle est datée du bon jour.
2. Créer un Record -> Supprimer via Admin -> Vérifier que le Record disparaît du classement.
3. Simuler deux arrivées Lvl 10 simultanées.
