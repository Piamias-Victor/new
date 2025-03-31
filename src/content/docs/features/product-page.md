# Page Analyse Produits

## Introduction

La page Analyse Produits d'ApoData est un outil puissant qui vous permet d'explorer et d'analyser en profondeur les performances de vos produits. Cette interface vous offre une vision complète des aspects critiques de votre gestion produits : stocks, marges, évolution des ventes et positionnement tarifaire.

![Aperçu de la Page Analyse Produits](/images/docs/product-page/product-page-apercu.png)

## Accès à la Page Analyse Produits

Vous pouvez accéder à la page Analyse Produits en cliquant sur "Analyse Produits" dans le menu de navigation latéral ou depuis les cartes de navigation du tableau de bord principal.

## Structure de la Page

La page Analyse Produits est organisée en plusieurs sections, chacune offrant une perspective différente sur vos données produits.

### 1. Indicateurs Clés de Performance (KPI)

![Cartes KPI](/images/docs/product-page/product-page-kpi-cards.png)

En haut de la page, vous retrouvez les mêmes indicateurs clés que sur le tableau de bord principal :

- **CA Sell-in** : Montant total des achats (prix d'achat HT) incluant tous les produits commandés sur la période, avec précommandes prises en compte. Reflète l'approvisionnement planifié.
- **CA Sell-out** : Montant total des ventes (TTC) réalisées sur la période sélectionnée. Indicateur principal de l'activité commerciale.
- **Taux de rupture** : Pourcentage des produits commandés mais non livrés par les fournisseurs direct, calculé uniquement sur les commandes ayant eu au moins un produit réceptionné.
- **Taux de marge** : Pourcentage de marge calculé comme (Prix de vente - Prix d'achat moyen pondéré) / Prix de vente. Cet indicateur de rentabilité utilise le prix moyen pondéré fourni par le logiciel.
- **Stock €** : Valeur du stock actuel en prix d'achat HT. Représente l'investissement immobilisé.
- **Rotation** : Nombre de fois où le stock est renouvelé par an. Calculé comme (CA annualisé / Valeur du stock). Un ratio élevé indique une gestion efficace.
- **Commandes** : Nombre total de commandes passées durant la période sélectionnée.
- **Références vendues** : Nombre de références produits différentes vendues sur la période. Indicateur de diversité de l'offre.

Chaque carte affiche également le pourcentage d'évolution par rapport à la période de comparaison.

### 2. Analyse des Stocks

![Analyse des Stocks](/images/docs/product-page/product-page-stock-analysis.png)

Le module d'analyse des stocks présente une vue complète de la santé de vos stocks par catégorie :

- **Sous-stock critique** : Produits avec moins d'1 mois de stock
- **Stocks à surveiller** : Produits avec 1 à 2 mois de stock
- **Stocks optimaux** : Produits avec 3 à 6 mois de stock
- **Surstock modéré** : Produits avec 6 à 12 mois de stock
- **Surstock critique** : Produits avec plus de 12 mois de stock

Chaque catégorie affiche le nombre de produits concernés. En cliquant sur une catégorie, une fenêtre modale s'ouvre avec la liste détaillée des produits, permettant d'identifier précisément les actions à entreprendre.

### 3. Analyse des Marges

![Analyse des Marges](/images/docs/product-page/product-page-margin-analysis.png)

Ce module permet d'analyser la rentabilité de vos produits selon différentes tranches de marge :

- **Marge négative** : Produits vendus à perte
- **Marge faible** : Produits avec marge inférieure à 25%
- **Marge moyenne** : Produits avec marge entre 25% et 30%
- **Bonne marge** : Produits avec marge entre 30% et 35%
- **Marge excellente** : Produits avec marge supérieure à 35%

Comme pour l'analyse des stocks, vous pouvez cliquer sur chaque catégorie pour voir les produits spécifiques et leurs détails de marge.

### 4. Évolution des Ventes

![Évolution des Ventes](/images/docs/product-page/product-page-sales-evolution.png)

Le module d'évolution des ventes analyse la progression des ventes de vos produits par rapport à la période de comparaison :

- **Forte baisse** : Produits avec une baisse de plus de 15%
- **Légère baisse** : Produits avec une baisse entre 5% et 15%
- **Stable** : Produits avec une variation entre -5% et +5%
- **Légère hausse** : Produits avec une hausse entre 5% et 15%
- **Forte hausse** : Produits avec une hausse de plus de 15%

Cette visualisation vous permet d'identifier rapidement les produits en croissance ou en déclin, et d'ajuster votre stratégie commerciale en conséquence.

### 5. Analyse Comparative des Prix

![Analyse des Prix](/images/docs/product-page/product-page-price-comparison.png)

Ce module compare vos prix de vente avec la moyenne du groupement Apothical :

- **Prix très bas** : Plus de 15% sous la moyenne
- **Prix bas** : Entre 5% et 15% sous la moyenne
- **Prix moyen** : Variation entre -5% et +5%
- **Prix élevé** : Entre 5% et 15% au-dessus de la moyenne
- **Prix très élevé** : Plus de 15% au-dessus de la moyenne

Cette analyse vous aide à positionner correctement vos prix par rapport au marché et à identifier les opportunités d'ajustement pour optimiser votre rentabilité.

### 6. Liste des Produits Sélectionnés

![Liste des Produits Sélectionnés](/images/docs/product-page/product-page-selected-products.png)

Si vous avez activé un filtre produit, cette section affiche la liste complète des produits sélectionnés avec leurs caractéristiques principales :

- **Nom du produit**
- **Code EAN**
- **Laboratoire**
- **Catégorie/Segment**
- **Prix de vente**
- **Prix d'achat**
- **Taux de marge**
- **Stock actuel**

Cette vue d'ensemble vous permet de consulter rapidement les informations essentielles de tous vos produits filtrés.

## Utilisation de la Page Analyse Produits

### Filtrer les Produits

Pour une analyse ciblée :

1. Cliquez sur le bouton "Sélection produits" dans la barre de navigation supérieure
2. Utilisez les onglets pour rechercher par produit, laboratoire ou segment
3. Sélectionnez les éléments souhaités
4. Choisissez le mode de filtrage (ET/OU) si vous avez plusieurs sélections
5. Cliquez sur "Appliquer le filtre"

Une fois le filtre appliqué, toutes les sections de la page se mettront automatiquement à jour pour n'afficher que les données relatives aux produits sélectionnés.

### Explorer les Détails des Catégories

Pour chaque module d'analyse (stocks, marges, évolution, prix) :

1. Identifiez les catégories présentant un intérêt particulier ou nécessitant une attention
2. Cliquez sur la catégorie pour ouvrir la fenêtre modale avec les détails
3. Utilisez la barre de recherche dans la modale pour trouver rapidement un produit spécifique
4. Consultez les informations détaillées pour chaque produit
5. Triez les données en cliquant sur les en-têtes de colonnes

### Analyser les Performances Croisées

La page Analyse Produits permet de croiser différentes dimensions d'analyse :

1. Identifiez les produits à marge négative dans le module d'analyse des marges
2. Vérifiez leur positionnement prix dans le module d'analyse comparative des prix
3. Consultez leur évolution des ventes pour comprendre leur dynamique commerciale
4. Examinez leur niveau de stock pour évaluer l'impact financier

Cette approche multidimensionnelle vous permet d'identifier précisément les actions correctives les plus pertinentes.

## Interprétation des Données et Bonnes Pratiques

### Optimisation des Stocks

- **Sous-stock critique** : Anticipez les commandes pour éviter les ruptures
- **Surstock critique** : Envisagez des actions commerciales pour écouler les excédents
- **Stock optimal vs Ventes en hausse** : Planifiez un réapprovisionnement anticipé

### Gestion des Marges

- **Marges négatives** : Réévaluez votre politique de prix ou vos sources d'approvisionnement
- **Marges excellentes + Prix bas** : Opportunité d'ajuster légèrement les prix à la hausse
- **Marges faibles + Prix élevés** : Nécessité de revoir les conditions d'achat

### Anticipation des Tendances

- **Produits en forte hausse** : Assurez un stock suffisant et mettez en avant ces produits
- **Produits en forte baisse** : Évitez de reconstituer les stocks et analysez les causes du déclin
- **Produits stables + Bonne marge** : Piliers fiables de votre activité à préserver

## Support et assistance

Si vous avez besoin d'aide ou si vous avez des questions qui ne trouvent pas réponse dans cette documentation :

- Contactez l'équipe support du groupement
- Consultez nos webinaires et formations en ligne

---

*Cette documentation est régulièrement mise à jour pour refléter les évolutions de l'application.*