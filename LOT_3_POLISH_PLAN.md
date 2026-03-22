# Plan de Polish & Performance - Lot 3

## 1. Optimisations Performance (Quick Wins)

| Élément | Problème | Solution "Chirurgicale" |
| :--- | :--- | :--- |
| **Streak** | Fetch et loop sur l'historique complet. | Limiter le fetch aux 100 derniers jours (suffisant pour le streak courant). |
| **Cagnotte** | Recalcul complexe des 21 derniers jours à chaque load. | Optimiser la boucle et les filtres pour réduire la complexité O(n*m). |
| **XP / Niveaux** | Calculs répétés. | Centraliser les constantes pour éviter les imports lourds. |

## 2. Polish UX & Lisibilité (Wow Effect)

### A. Hiérarchie Visuelle (Dashboard)
- **Glow Progress** : Ajouter un effet de halo (glow) derrière la valeur de progression quand l'objectif est atteint.
- **Bouton Pulsant** : Faire pulser légèrement le bouton "Saisir une séance" si l'objectif du jour n'est pas rempli.
- **Cartes Elevées** : Utiliser des dégradés plus subtils et des bordures "glass" plus fines pour un aspect plus premium.

### B. Navigation & Fluidité
- **Transitions** : Ajouter des micro-animations CSS lors des changements d'états (formulaire ouvert/fermé).
- **Feedback** : Améliorer les boutons de chargement (spinner minimal).

### C. Lisibilité Metrics
- Agrandir légèrement la valeur du streak si > 0.
- Rendre le bandeau d'événement plus "vivant" (animation de scintillement discret).

---

## 3. Justification
Le but est de donner une impression de "produit fini" et fluide, tout en s'assurant que le dashboard reste rapide même après des mois d'utilisation.

---

## 4. Tests Manuels Lot 3
1. Vérifier que le dashboard charge instantanément même avec beaucoup de data historiques.
2. Tester le responsive sur mobile (iPhone/Pixel) pour vérifier que la grille ne "casse" pas.
3. Apprécier le rendu visuel de la barre de progression complétée.
