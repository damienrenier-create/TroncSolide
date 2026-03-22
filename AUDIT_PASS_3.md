# Audit Final Exigeant - Passe 3 (Inventaire & Impacts)

**Date :** 9 Mars 2026  
**Verdict :** ⛔ **SÉCURITÉ ET INTÉGRITÉ NON VALIDÉES**  

---

## 1. Inventaire Exhaustif des Mutations (Server Actions)

| Action | Fichier | Session | Rôle | Propriété | Isolation | Risque |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `registerUser` | `auth.ts` | Non | N/A | N/A | Check Code | ✅ |
| `createLeague` | `auth.ts` | **NON** | **N/A** | N/A | N/A | **CRITIQUE** (Public) |
| `logExercise` | `exercise.ts` | Oui | USER | ✅ | ✅ | **TZ** (Retroactive) |
| `submitMedicalCert`| `economy.ts` | Oui | **N/A** | **NON** | **NON** | **IDOR** |
| `exitCagnotte` | `economy.ts` | Oui | **N/A** | **NON** | **NON** | **IDOR** |
| `syncPenalties` | `economy.ts` | Oui | **N/A** | **NON** | **NON** | **RACE** (On load) |
| `toggleLike` | `social.ts` | Oui | **N/A** | **NON** | **NON** | **IDOR** |
| `deleteSession` | `moderation.ts`| Oui | MOD | ✅ | ✅ | **DATA LOST** |
| `createLeague` (2) | `moderation.ts`| Oui | MOD | ✅ | ✅ | ✅ |
| `adjustUserXP` | `moderation.ts`| Oui | MOD | ✅ | ✅ | ✅ |

---

## 2. Matrice des Effets Dérivés (Intégrité)

Que se passe-t-il lors des mutations clés ?

| Entité à recalculer | Saisie (Log) | Suppression (Mod) | Certificat Médical |
| :--- | :--- | :--- | :--- |
| **XP Total** | ✅ Recalculé | ✅ Revert | ➖ N/A |
| **Niveaux Nature** | ✅ Up (Feed) | ❌ **OUBLIÉ** (Level non réduit) | ➖ N/A |
| **Badges Shared** | ✅ Gagné (Feed) | ❌ **OUBLIÉ** (Badge reste) | ➖ N/A |
| **Badges Unique** | ✅ Gagné (Pionnier) | ❌ **OUBLIÉ** (Badge bloqué) | ➖ N/A |
| **Records League** | ✅ Mis à jour | ❌ **OUBLIÉ** (Record fantôme)| ➖ N/A |
| **Streak Perso** | ✅ Dynamique | ✅ Dynamique | ➖ N/A |
| **Cagnotte Progress** | ✅ Dynamique | ✅ Dynamique | ✅ Pris en compte |
| **Pénalités (Dettes)**| ✅ Dynamique | ✅ Dynamique | ✅ Évité pour le jour |
| **Social Feed** | ✅ Post créé | ❌ **OUBLIÉ** (Post reste) | ➖ N/A |

---

## 3. Analyse des Angles Morts (Cas Limites)

### [A1] Le "Lundi de l'Angoisse" (Timezone Race)
- **Problème :** `exercise.ts:133` et `dashboard.ts:35` utilisent `new Date()`.
- **Preuve :** Le serveur Vercel est en UTC. Un utilisateur à Paris (UTC+1) saisissant sa séance à 0h30 le 20 Mars sera considéré comme étant le 19 Mars à 23h30 par le serveur.
- **Impact :** L'objectif du jour n'est pas rempli (il est 1h trop tôt), l'utilisateur perd son streak de 21 jours injustement.

### [A2] Badge "Pionnier" et Collision SQL
- **Problème :** `gamification.ts:138` (Transaction non isolée).
- **Preuve :** Deux `await tx.badge.update` peuvent s'exécuter en parallèle si les deux requêtes de lecture (ligne 113) ont rendu "vrai" simultanément.
- **Impact :** Une ligue se retrouve avec deux "Pionniers L10". Rupture de l'aspect "Unique".

### [A3] Poids des calculs Dashboard
- **Problème :** `dashboard.ts:38` (Boucle 1-1000) et `68` (Boucle 21 jours avec agrégations SQL).
- **Impact :** Avec 10 utilisateurs et 1 an d'historique, le dashboard mettra >2s à charger. Vercel peut timeout le Server Action sur les plans gratuits.

---

## 4. Plan de Correction Priorisé

### Lot 0 : Sécurité Sombre (Urgente)
1. **Verrouillage IDOR** : `economy.ts` (Medical, Exit) et `social.ts` (Likes) doivent extraire `userId` de `session.user.id` UNIQUEMENT.
2. **Cloisonnement League** : `record.ts` (getLeagueRankings) doit valider que le `leagueId` demandé est celui de l'utilisateur connecté.
3. **Suppression Admin Publique** : Supprimer `auth.ts:createLeague` (doublon dangereux et non protégé).

### Lot 1 : Intégrité "Records Fantômes"
1. **Rollback Records** : Modifier `deleteSession` pour recalculer le record si la valeur supprimée était le sommet.
2. **Rollback Level/Badges** : (Optionnel mais recommandé) Vérifier si l'utilisateur redescend de niveau.

### Lot 2 : Stabilité Métier (Build & TZ)
1. **Garde-fou Timezone** : Normaliser toutes les dates en UTC-Midnight côté client avant envoi OU forcer la TZ Paris.
2. **Bonus Anniversaire Server-Side** : Coder le multiplicateur d'XP dans `logExercise`.

### Lot 3 : Performance & Polish
1. **Cache de Streak** : Ajouter `currentStreak` dans le modèle `User`.

---
*Audit Passe 3 - Instance Antigravity Senior.*
