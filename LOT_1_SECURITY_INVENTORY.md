# Inventaire & Plan Lot 1 - Anti-triche & Cloisonnement

## 1. Inventaire des Actions Sensibles

| Action | Source Identité | Source Ligue | Statut | Correction |
| :--- | :--- | :--- | :--- | :--- |
| `submitMedicalCertificate` | ❌ Client (`formData`) | ❌ Client (Implicit) | **Fragile** | Forcer `session.user.id`. |
| `exitCagnotte` | ❌ Client (Param) | ❌ Client (Implicit) | **Fragile** | Forcer `session.user.id`. |
| `toggleLike` | ❌ Client (Param) | ❌ Client (Implicit) | **Fragile** | Forcer `session.user.id`. |
| `getFeedItems` | ✅ Session (`curUserId`) | ❌ Client (`leagueId`) | **Fragile** | Valider `session.user.leagueId === leagueId`. |
| `getPersonalStats` | ❌ Client (Param) | ✅ DB | **Fragile** | Forcer `session.user.id`. |
| `createLeague` (Auth) | ❌ N/A | ❌ Client | **DANGEREUX** | Supprimer le doublon public. |
| `logExercise` | ✅ Session | ✅ DB | **Sain** | Déjà sécurisé. |
| `deleteSession` | ✅ Session (Role MOD)| ✅ DB | **Sain** | Déjà sécurisé. |

---

## 2. Plan de Patch Lot 1

### A. Sécurisation `economy.ts`
- Retirer `userId` des paramètres de `exitCagnotte` et du `FormData` de `submitMedicalCertificate`.
- Utiliser `getServerSession` pour extraire l'ID réel.

### B. Sécurisation `social.ts`
- Retirer l'argument `userId` de `toggleLike`.
- Ajouter un check de session dans `getFeedItems` pour interdire la lecture d'une ligue dont on n'est pas membre.

### C. Sécurisation `stats.ts`
- S'assurer que `getPersonalStats` utilise l'ID de session si l'utilisateur n'est pas modérateur.

### D. Neutralisation Doublons
- Supprimer `createLeague` de `src/lib/actions/auth.ts`. L'action officielle se trouve désormais dans `moderation.ts` et est protégée par rôle.

---

## 3. Justification
On élimine la possibilité pour un utilisateur de liker pour un autre, d'annuler ses propres amendes en injectant un faux ID, ou d'espionner les activités sociales d'une autre ligue.
