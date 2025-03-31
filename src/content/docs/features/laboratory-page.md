# Page Analyse Laboratoires

## Introduction

La page Analyse Laboratoires d'ApoData est un outil spécialisé qui vous permet d'examiner les performances de vos laboratoires et marques en profondeur. Cette interface vous offre une vue complète sur les ventes, les stocks et les tendances par laboratoire, vous aidant à optimiser vos relations fournisseurs et à identifier les opportunités commerciales.

![Aperçu de la Page Analyse Laboratoires](/images/docs/laboratory-page/laboratory-page-apercu.png)

## Accès à la Page Analyse Laboratoires

Vous pouvez accéder à la page Analyse Laboratoires en cliquant sur "Analyse Laboratoires" dans le menu de navigation latéral ou depuis les cartes de navigation du tableau de bord principal.

## Structure de la Page

La page Analyse Laboratoires est organisée en plusieurs sections qui offrent différentes perspectives sur vos données de laboratoires.

### 1. Indicateurs Clés de Performance (KPI)

![Cartes KPI](/images/docs/laboratory-page/laboratory-page-kpi-cards.png)

En haut de la page, vous retrouvez les indicateurs clés de performance, qui reflètent soit l'ensemble de votre activité, soit uniquement les données du laboratoire sélectionné si vous avez activé un filtre :

- **CA Sell-in** : Montant total des achats (prix d'achat HT) incluant tous les produits commandés sur la période, avec précommandes prises en compte. Reflète l'approvisionnement planifié.
- **CA Sell-out** : Montant total des ventes (TTC) réalisées sur la période sélectionnée. Indicateur principal de l'activité commerciale.
- **Taux de rupture** : Pourcentage des produits commandés mais non livrés par les fournisseurs direct, calculé uniquement sur les commandes ayant eu au moins un produit réceptionné.
- **Taux de marge** : Pourcentage de marge calculé comme (Prix de vente - Prix d'achat moyen pondéré) / Prix de vente. Cet indicateur de rentabilité utilise le prix moyen pondéré fourni par le logiciel.
- **Stock €** : Valeur du stock actuel en prix d'achat HT. Représente l'investissement immobilisé.
- **Rotation** : Nombre de fois où le stock est renouvelé par an. Calculé comme (CA annualisé / Valeur du stock). Un ratio élevé indique une gestion efficace.
- **Commandes** : Nombre total de commandes passées durant la période sélectionnée.
- **Références vendues** : Nombre de références produits différentes vendues sur la période. Indicateur de diversité de l'offre.

Chaque carte affiche également le pourcentage d'évolution par rapport à la période de comparaison.

### 2. Analyse des Laboratoires et Segments

![Analyse des Laboratoires](/images/docs/laboratory-page/laboratory-page-lab-analysis.png)

Le cœur de cette page est le module d'analyse de laboratoire, qui se présente différemment selon que vous ayez ou non sélectionné un laboratoire spécifique :

#### Mode Global (aucun laboratoire sélectionné)

Dans ce mode, vous êtes invité à sélectionner un laboratoire ou un segment pour accéder à une analyse détaillée. Utilisez le filtre produit pour faire votre sélection.

#### Mode Laboratoire Spécifique

Lorsqu'un laboratoire est sélectionné, vous verrez :

- **Tableau des segments** : Répartition des ventes du laboratoire par univers, catégorie et famille
- **Parts de marché** : Positionnement du laboratoire par rapport à ses concurrents dans chaque segment
- **Top produits du laboratoire** : Liste des produits les plus performants du laboratoire sélectionné
- **Top produits concurrents** : Liste des produits concurrents les plus performants dans les mêmes segments

Cette analyse vous permet d'identifier les forces et faiblesses du laboratoire dans chaque segment de marché.

### 3. Évolution des Ventes

![Évolution des Ventes](/images/docs/laboratory-page/laboratory-page-sales-evolution.png)

Ce graphique présente l'évolution des ventes du laboratoire sélectionné sur la période choisie :

- **Ligne principale (bleue)** : Représente les ventes (Sell-out)
- **Ligne verte** : Représente la marge
- **Ligne orange en pointillés** : Représente les achats (Sell-in)
- **Axe horizontal** : Périodes (jours, semaines ou mois selon l'intervalle choisi)
- **Axe vertical** : Montant des ventes

Vous pouvez personnaliser l'affichage en :
- Sélectionnant l'intervalle (jour, semaine, mois)
- Activant/désactivant l'affichage de la marge
- Activant/désactivant l'affichage du Sell-in

### 5. Projection des Ventes

![Projection des Ventes](/images/docs/laboratory-page/laboratory-page-sales-projection.png)

Ce module utilise des algorithmes prédictifs pour estimer les ventes futures du laboratoire sélectionné :

- **Données historiques** : Représentation des ventes passées
- **Ligne de projection** : Estimation des ventes futures
- **Zone d'incertitude** : Marge d'erreur de la prédiction

Cette fonctionnalité vous permet d'anticiper les tendances et d'adapter votre stratégie d'achat en conséquence.

### 6. Liste des Produits Sélectionnés

![Liste des Produits Sélectionnés](/images/docs/laboratory-page/laboratory-page-selected-products.png)

Cette section affiche la liste complète des produits du laboratoire sélectionné avec leurs caractéristiques principales :

- **Nom du produit**
- **Code EAN**
- **Catégorie/Segment**
- **Prix de vente**
- **Prix d'achat**
- **Taux de marge**
- **Stock actuel**

Cette vue d'ensemble vous permet de consulter rapidement toutes les références du laboratoire.


## Utilisation de la Page Analyse Laboratoires

### Sélectionner un Laboratoire

1. Cliquez sur le bouton "Sélection produits" dans la barre de navigation supérieure
2. Allez dans l'onglet "Par laboratoire"
3. Recherchez et sélectionnez le laboratoire souhaité
4. Cliquez sur "Appliquer le filtre"

Une fois le filtre appliqué, toutes les sections de la page se mettront automatiquement à jour pour n'afficher que les données relatives au laboratoire sélectionné.

### Analyser les Segments

1. Dans le tableau des segments, utilisez les onglets pour naviguer entre univers, catégories et familles
2. Cliquez sur un segment spécifique pour voir son analyse détaillée
3. Consultez les parts de marché des différents laboratoires dans ce segment
4. Examinez les top produits du laboratoire et les produits concurrents dans ce segment

### Explorer l'Évolution des Performances

1. Dans le graphique d'évolution des ventes, sélectionnez l'intervalle approprié (jour, semaine, mois)
2. Activez ou désactivez les différentes séries (marge, sell-in) selon vos besoins d'analyse
3. Passez le curseur sur les points du graphique pour voir les détails précis
4. Identifiez les tendances et les éventuelles saisonnalités

### Anticiper les Tendances Futures

1. Dans le module de projection des ventes, observez la ligne de tendance future
2. Prenez en compte la zone d'incertitude pour évaluer la fiabilité de la prédiction
3. Utilisez ces informations pour planifier vos achats futurs et vos actions commerciales

## Interprétation des Données et Bonnes Pratiques

### Analyse de Performance par Segment

- **Segments à forte part de marché** : Points forts à maintenir et développer
- **Segments à faible part de marché** : Opportunités de développement ou segments à abandonner selon leur potentiel
- **Écarts significatifs entre segments** : Nécessité d'adapter la stratégie commerciale par segment

### Optimisation des Relations Fournisseurs

- **Laboratoires avec forte part de marché mais marge faible** : Opportunité de renégociation des conditions commerciales
- **Laboratoires avec stock élevé et ventes stables ou en baisse** : Nécessité de revoir les quantités commandées
- **Laboratoires avec ruptures fréquentes** : Besoin d'améliorer la communication et la planification avec le fournisseur

### Stratégies Concurrentielles

- **Analyse des top produits concurrents** : Identification des références à potentiellement ajouter à votre assortiment
- **Comparaison des performances par segment** : Repérage des forces et faiblesses par rapport aux concurrents
- **Évolution des parts de marché** : Suivi des tendances concurrentielles pour anticiper les changements du marché

## Support et assistance

Si vous avez besoin d'aide ou si vous avez des questions qui ne trouvent pas réponse dans cette documentation :

- Contactez l'équipe support du groupement
- Consultez nos webinaires et formations en ligne

---

*Cette documentation est régulièrement mise à jour pour refléter les évolutions de l'application.*