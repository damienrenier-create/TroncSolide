# Audit Final Exigeant - Projet `tronc-solide`

**Date :** 9 Mars 2026  
**Verdict Global :** 🟡 **Maturité 6.5/10** (Prêt pour bêta fermée, non prêt pour production ouverte)  

## 1. Résumé Exécutif

L'application `tronc-solide` est une implémentation robuste et esthétiquement premium d'un système de gamification sportive. La séparation des ligues est respectée dans les schémas, et les fonctionnalités "coeur" (saisie, XP, niveaux, dashboard) sont opérationnelles.  

Cependant, l'audit révèle des **failles de sécurité critiques** sur certaines mutations (Medical Certs, Exit Cagnotte) et des **brisures d'intégrité de données** suite aux interventions de modération. Des fonctionnalités promises (Bonus Anniversaire) sont présentes visuellement mais absentes de la logique serveur.

---

## 2. État d’implémentation par module

| Module | État | Commentaire |
| :--- | :--- | :--- |
| **Authentification** | OK | NextAuth avec rôles (MODERATOR/USER). |
| **Cloisonnement Ligues** | OK | Filtrage systématique par `leagueId`. |
| **Dashboard** | OK | Très complet, motivant, responsive. |
| **Saisie Quotidienne** | OK | Supporte mood et validations basiques. |
| **Saisie Rétroactive** | OK | Fenêtre de 3 jours respectée. |
| **Objectif Dynamique** | OK | Calcul `daysSinceSignup + 1` conforme. |
| **Classements / Records** | OK | Séparation Volume/Série et périodes. |
| **Cagnotte (Pot)** | OK | Éligibilité 21j et pénalités 2€ fonctionnelles. |
| **Gamification (XP/Lvl)** | OK | 50 niveaux Nature et badges implémentés. |
| **Gazette / Social** | OK | Feed temps réel avec likes. |
| **Certificats Médicaux** | **FRAGILE** | Pas de vérification de session côté serveur. |
| **Événements (Anniv)** | **PARTIEL** | Affichage OK, mais bonus XP non codé. |
| **Outils Modération** | **PARTIEL** | Suppression sessions OK, mais laisse records orphelins. |

---

## 3. Problèmes Critiques et Importants

### [C1] Vulnérabilité d'IDOR - Certificats Médicaux
- **Gravité :** **CRITIQUE** | **Type :** Security
- **Zone :** `lib/actions/economy.ts` -> `submitMedicalCertificate`
- **Symptôme :** L'action accepte un `userId` brut depuis le `FormData` sans vérifier que l'utilisateur en session est bien le propriétaire du compte ou un modérateur.
- **Risque :** Un utilisateur malveillant peut injecter des certificats pour n'importe qui et annuler ses pénalités.
- **Correctif :** Utiliser `getServerSession` pour extraire l'ID utilisateur réel.

### [C2] Absence de recalcul des records à la suppression
- **Gravité :** **HAUTE** | **Type :** Data Integrity
- **Zone :** `lib/actions/moderation.ts` -> `deleteSession`
- **Symptôme :** Supprimer une séance retire l'XP, mais ne met pas à jour la table `records`.
- **Risque :** Si un utilisateur triche (ex: 2000s de gainage) et qu'on supprime sa séance, son record reste affiché indéfiniment dans le Hall of Fame.
- **Correctif :** Déclencher un re-sync des records pour le type d'exercice et la période concernés après suppression.

### [C3] Bonus Anniversaire Fantôme
- **Gravité :** **MOYENNE** | **Type :** Product Logic
- **Zone :** `lib/actions/exercise.ts` -> `logExercise`
- **Symptôme :** L'UI promet des bonus d'XP lors des anniversaires, mais `logExercise` utilise un calcul fixe `xpGained = value`.
- **Risque :** Promesse utilisateur non tenue, sentiment de bug.
- **Correctif :** Appeler `getActiveEvents` dans `logExercise` et appliquer un multiplicateur 1.5x ou un bonus fixe si un événement est actif.

---

## 4. Faiblesses Secondaires

- **Doublon de logique de Ligue** : `auth.ts` et `moderation.ts` contiennent tous deux des fonctions de création de ligue. `auth.ts:createLeague` n'est pas protégé par rôle.
- **Typage Prisma / Enum** : Plusieurs fichiers utilisent des enums ("SHARED" au lieu de "ACHIEVEMENT") nécessitant des patchs de dernière minute. Risque de régression.
- **UX de désinscription** : `exitCagnotte` n'est pas protégé par session non plus. N'importe qui peut sortir n'importe qui du système.

---

## 5. Top 10 des Améliorations Prioritaires

1. **Sécuriser les Mutations** : Ajouter systématiquement `getServerSession` dans toutes les actions de `economy.ts` et `social.ts`.
2. **Robustesse Modération** : Compléter `deleteSession` pour supprimer/recalculer le record associé si la séance supprimée était le record actuel.
3. **Implémenter le Bonus XP** : Coder réellement le bonus de 10-20% XP lors des anniversaires de ligue.
4. **Middlewares de Rôle** : Centraliser la vérification `MODERATOR` pour éviter les oublis dans les Server Actions.
5. **Gestion des Égalités** : Dans les records, si deux personnes ont le même temps, la table `@unique` bloque. Ajouter un champ `updatedAt` ou gérer la liste.
6. **Optimisation Dash** : `checkEligibility` et `syncPenalties` sont exécutés à chaque chargement de dashboard. Cache ou Job Cron recommandé.
7. **Filtrage Social** : Vérifier que le `leagueId` passé à `getFeedItems` correspond bien à la ligue de l'utilisateur connecté.
8. **Recalcul de Streak Rapide** : Actuellement recalculé de zéro. Utiliser un champ `currentStreak` dans la table `User`.
9. **FAQ Dynamique** : Mettre à jour l'FAQ pour qu'elle affiche les valeurs d'XP réelles des badges depuis la DB.
10. **Hardening Vercel** : Ajouter des limites de taille (Rate limiting) sur la création de ligues pour éviter le spam.

---

## 6. Dette Technique

- **Complexité Records** : La table `Record` est synchronisée "à la main" dans `exercise.ts`. Une modification de logique ici demande de re-tester 4 échelles de temps.
- **Couplage Dashboard/Economy** : Le dashboard fait trop de logique métier (trigger de pénalités). Cela devrait être asynchrone.

## 7. Recommandations de travail

1. **Phase Correction (Urgente)** : Bugs de sécurité IDOR et recalcul records.
2. **Phase Polish (Courte)** : Implémenter le Bonus Anniversaire.
3. **Prêt Production**.

---
*Audit réalisé par l'instance Antigravity (Assistant Senior).*
