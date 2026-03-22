# Audit Final Exigeant - Passe 2 (Analyse Chirurgicale)

**Date :** 9 Mars 2026  
**Verdict :** 🔴 **NON PRÊT POUR LA PRODUCTION**  
**Score de Maturité :** 4.5/10 (Risques de sécurité majeurs confirmés par le code)

---

## 1. Sécurité & Permissions (IDOR confirmés)

Un IDOR (Insecure Direct Object Reference) permet à un utilisateur de manipuler les données d'autrui en changeant un ID dans la requête.

### [S1] Usurpation d'Identité pour les Likes
- **Preuve Exacte :** `src/lib/actions/social.ts:25` -> `toggleLike(feedItemId, userId)`
- **Gravité :** **CRITIQUE**
- **Symptôme :** L'action accepte le `userId` en argument. Un attaquant peut appeler cette fonction via la console ou un script en passant le `userId` de n'importe qui pour "liker" ou "unliker" à sa place.
- **Scénario :** Un utilisateur "A" fait liker massivement son activité par "B" sans son consentement.
- **Correctif :** Supprimer l'argument `userId`, utiliser `getServerSession(authOptions)` pour obtenir l'ID de l'utilisateur connecté.
- **Priorité :** Immédiate.

### [S2] Injection de Certificats Médicaux
- **Preuve Exacte :** `src/lib/actions/economy.ts:135` -> `const userId = formData.get("userId")`
- **Gravité :** **CRITIQUE**
- **Symptôme :** Aucune vérification de session n'est faite avant `prisma.medicalCertificate.create`.
- **Scénario :** Un utilisateur tricheur s'auto-attribue un certificat médical pour effacer ses pénalités de 2€ en injectant son `userId` dans le form-data.
- **Correctif :** Ignorer le `userId` du `FormData`, utiliser la session serveur.
- **Priorité :** Immédiate.

### [S3] Désinscription forcée (Cagnotte)
- **Preuve Exacte :** `src/lib/actions/economy.ts:155` -> `exitCagnotte(userId)`
- **Gravité :** **HAUTE**
- **Symptôme :** L'action utilise le `userId` fourni par le client.
- **Scénario :** Un utilisateur malveillant s'amuse à sortir ses rivaux de la cagnotte en bouclant sur leurs IDs, leur faisant perdre leur progression de 21 jours.
- **Correctif :** Utiliser la session serveur.
- **Priorité :** Haute.

---

## 2. Cloisonnement par Ligue (Prouvé Fragile)

### [L1] Visibilité Trans-Ligue (Read)
- **Preuve Exacte :** `src/lib/actions/record.ts:8` -> `getLeagueRankings(leagueId, ...)`
- **Gravité :** **HAUTE**
- **Symptôme :** La fonction prend un `leagueId` arbitraire. Rien ne vérifie que l'utilisateur appartient à cette ligue.
- **Scénario :** En changeant l'ID dans l'URL ou l'appel API, un utilisateur peut espionner les performances et les pseudos d'une autre ligue (fuite de données).
- **Correctif :** Récupérer le `leagueId` de l'utilisateur en session via une requête Prisma jointe.
- **Priorité :** Haute.

---

## 3. Intégrité des Données & Race Conditions

### [D1] Records Orphelins après Suppression
- **Preuve Exacte :** `src/lib/actions/moderation.ts:26-32`
- **Gravité :** **HAUTE**
- **Symptôme :** `deleteSession` retire l'XP mais ne touche pas à la table `Record`.
- **Scénario :** Un utilisateur fait une séance record de 999s (triche). Le modérateur supprime la séance. Le Hall of Fame de la ligue continue d'afficher l'utilisateur à 999s car l'entrée dans la table `Record` n'est jamais invalidée.
- **Correctif :** Si la séance supprimée correspond à la `date` et `value` du record actuel, déclencher un recalcul total du record pour cette période.
- **Priorité :** Haute.

### [D2] Doublon de Badge (Race Condition)
- **Preuve Exacte :** `src/lib/actions/gamification.ts:28-48`
- **Gravité :** **MOYENNE**
- **Symptôme :** `ensureBadgeExists` fait un `findFirst` puis un `create`.
- **Scénario :** Lors de l'initialisation d'une nouvelle ligue, si deux utilisateurs finissent leur première séance en même temps, le système risque de créer deux fois la définition du badge "Lève-tôt" en base de données.
- **Correctif :** Utiliser un `upsert` avec une contrainte d'unicité sur `name` et `leagueId` (si applicable).
- **Priorité :** Moyenne.

---

## 4. Race Condition sur les Badges Uniques (Piooneer)

### [R1] Double Vainqueur "First Come"
- **Preuve Exacte :** `src/lib/actions/gamification.ts:113` vs `129`
- **Gravité :** **MOYENNE**
- **Symptôme :** La vérification `alreadyTaken` est faite AVANT la transaction.
- **Scénario :** Deux utilisateurs atteignent le Niveau 10 à la même seconde. L'action s'exécute pour les deux. Ils passent tous deux le `findFirst` (ligne 113) car la base n'est pas encore mise à jour. Ils entrent dans la transaction et reçoivent tous les deux le badge unique.
- **Correctif :** Inclure la vérification `winnerId` DANS la transaction Prisma ou utiliser une contrainte SQL unique sur `winnerId` pour ce badge spécifique.
- **Priorité :** Moyenne.

---

## 5. Build, Prod & Performance

### [P1] Surcharge de calcul au chargement (Dashboard)
- **Preuve Exacte :** `src/lib/actions/dashboard.ts:38` (Streak) et `68` (Cagnotte)
- **Gravité :** **FAIBLE**
- **Symptôme :** Calculs lourds (boucles de 1000 itérations, agrégations complexes) faits à chaque `refresh` du dashboard.
- **Risque :** Latence significative quand un utilisateur aura 2 ans de données.
- **Correctif :** Stocker le `currentStreak` et l'état `cagnotteEligible` dans la table `User`, mis à jour uniquement lors de `logExercise`.
- **Priorité :** Basse (Dette technique).

### [P2] Problème de Fuseau Horaire (Timezone)
- **Preuve Exacte :** `src/lib/actions/exercise.ts:133` -> `new Date()`
- **Gravité :** **MOYENNE**
- **Symptôme :** L'application utilise l'heure du serveur (Neon/Vercel).
- **Risque :** Un utilisateur français saisissant sa séance à 1h du matin pourra voir sa séance datée de la veille car le serveur Vercel est en UTC. Cela casse l'objectif du jour.
- **Correctif :** Demander le client-timezone ou utiliser une bibliothèque comme `date-fns-tz`.
- **Priorité :** Moyenne.

---

## 6. Liste Structurée d'Audit

| Titre | Gravité | Zone | Scénario de casse |
| :--- | :--- | :--- | :--- |
| **IDOR Social** | Critique | `social.ts:25` | Likers n'importe qui. |
| **IDOR Médical** | Critique | `economy.ts:135` | Triche sur pénalités. |
| **IDOR Cagnotte** | Haute | `economy.ts:155` | Sabotage de rivaux. |
| **Fuite Ligues** | Haute | `record.ts:8` | Espionnage inter-ligue. |
| **Records Ko** | Haute | `moderation.ts:26` | Records fantômes après delete. |
| **Race Badge** | Moyenne | `gamification.ts:129` | Plusieurs pionniers L10. |

---

## Conclusion Passe 2
L'application "fonctionne" visuellement, mais les **Server Actions sont des passoires de sécurité** par excès de confiance dans les paramètres envoyés par le client. Un audit de production ne peut valider ce code sans une refonte systématique de l'accès à `getServerSession` au sein des actions mutatives.
