# Tâches d'implémentation : Ajustements Gamification & UI

- [ ] **1. Ajustement Gamification (`gamification.ts`)**
  - [ ] Retirer la punition de perte d'XP lors du Vol de Record (l'ancien propriétaire garde la rente acquise).
  - [ ] Modifier `getBadgeCatalogue` pour inclure l'historique d'acquisition via `feedItems` (qui l'a obtenu et quand).

- [ ] **2. UI Historique & Modales (`BadgeModal.tsx`)**
  - [ ] Corriger le lien 404 (remplacer le `/faq` de la modale par l'onglet actuel).
  - [ ] Afficher la timeline chronologique d'obtention du badge pour les Trophées Record (qui l'a pris à qui).

- [ ] **3. Accordéons Navigables (`BadgeCatalogueClient.tsx`)**
  - [ ] Implémenter des menus déroulants / accordéons pour les sections de badges pour ne pas surcharger la page.
  - [ ] Implémenter des accordéons pour la FAQ au sein de l'onglet récapitulatif.
