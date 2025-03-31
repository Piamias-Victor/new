# Tableau de Bord Principal

## Introduction

Le tableau de bord principal d'ApoData est votre centre de commandement pour analyser les performances de votre pharmacie. Cette interface intuitive vous permet de visualiser rapidement les indicateurs clés de performance, d'identifier les tendances et de prendre des décisions éclairées basées sur des données précises.

## Accès au Tableau de Bord

Une fois connecté à ApoData, vous accédez automatiquement au tableau de bord principal. Vous pouvez également y revenir à tout moment en cliquant sur l'onglet "Tableau de bord" dans la navigation.

## Structure du Tableau de Bord

Le tableau de bord est organisé en plusieurs sections distinctes, chacune fournissant des informations spécifiques sur différents aspects de votre activité.

### 1. Barre de Navigation Supérieure

![Barre de Navigation](/images/docs/dashboard/dashboard-barre-navigation.png)

La barre de navigation supérieure contient plusieurs éléments essentiels :

- **Sélecteur de période** : Permet de choisir l'intervalle d'analyse (ce mois-ci, mois dernier, 3 derniers mois, etc.)
- **Comparaison temporelle** : Permet de comparer les données actuelles avec une période antérieure (année précédente, période précédente)
- **Filtre de produits** : Permet d'affiner l'analyse par produit, laboratoire ou segment

### 2. Cartes KPI

![Cartes KPI](/images/docs/dashboard/dashboard-kpi-cards.png)

Les cartes KPI (Key Performance Indicators) affichent les indicateurs clés de performance de votre pharmacie :

- **CA Sell-in** : Montant total des achats (prix d'achat HT) incluant tous les produits commandés sur la période, avec précommandes prises en compte. Reflète l'approvisionnement planifié.
- **CA Sell-out** : Montant total des ventes (TTC) réalisées sur la période sélectionnée. Indicateur principal de l'activité commerciale.
- **Taux de rupture** : Pourcentage des produits commandés mais non livrés par les fournisseurs direct, calculé uniquement sur les commandes ayant eu au moins un produit réceptionné.
- **Taux de marge** : Pourcentage de marge calculé comme (Prix de vente - Prix d'achat moyen pondéré) / Prix de vente. Cet indicateur de rentabilité utilise le prix moyen pondéré fourni par le logiciel.
- **Stock €** : Valeur du stock actuel en prix d'achat HT. Représente l'investissement immobilisé.
- **Rotation** : Nombre de fois où le stock est renouvelé par an. Calculé comme (CA annualisé / Valeur du stock). Un ratio élevé indique une gestion efficace.
- **Commandes** : Nombre total de commandes passées durant la période sélectionnée.
- **Références vendues** : Nombre de références produits différentes vendues sur la période. Indicateur de diversité de l'offre.

Chaque carte affiche également le pourcentage d'évolution par rapport à la période de comparaison.

### 3. Évolution des Ventes

![Évolution des Ventes](/images/docs/dashboard/dashboard-sales-evolution.png)

Ce graphique présente l'évolution de vos ventes sur la période sélectionnée :

- **Ligne principale (bleue)** : Représente les ventes (Sell-out)
- **Ligne verte** : Représente la marge
- **Ligne orange en pointillés** : Représente les achats (Sell-in)
- **Axe horizontal** : Périodes (jours, semaines ou mois selon l'intervalle choisi)
- **Axe vertical** : Montant des ventes

Vous pouvez personnaliser l'affichage en :
- Sélectionnant l'intervalle (jour, semaine, mois)
- Activant/désactivant l'affichage de la marge
- Activant/désactivant l'affichage du Sell-in

Le pourcentage d'évolution générale est également affiché en haut du graphique.

### 4. Top Produits

![Top Produits](/images/docs/dashboard/dashboard-top-produits.png)

Cette section présente vos produits les plus performants selon trois critères au choix :
- **CA** : Classement par chiffre d'affaires
- **Quantité** : Classement par nombre d'unités vendues
- **Marge** : Classement par montant de marge générée

Pour chaque produit, vous pouvez voir :
- **Nom du produit** : Identifiant complet du produit
- **Laboratoire** : Fabricant du produit
- **Catégorie** : Classification du produit
- **Code EAN** : Code barre du produit
- **Taux de TVA** : Pourcentage de taxe appliqué
- **Statut du stock** : État des stocks avec code couleur (rouge si critique)
- **Valeur principale** : CA, quantité ou marge selon le tri choisi

Si vous avez activé un filtre produit, seuls les produits correspondant à ce filtre seront affichés.

### 5. Comparatif Groupement

![Comparatif Groupement](/images/docs/dashboard/dashboard-comparatif-groupement.png)

Ce module compare vos performances avec la moyenne du groupement Apothical :

- **CA Sell-In** : Comparaison de vos achats avec la moyenne du groupement
- **CA Sell-Out** : Comparaison de vos ventes avec la moyenne du groupement
- **Marge** : Comparaison de votre marge totale avec la moyenne du groupement
- **Taux de marge** : Comparaison de votre taux de marge avec la moyenne du groupement
- **Stock** : Comparaison de votre valeur de stock avec la moyenne du groupement
- **Références** : Comparaison de votre nombre de références avec la moyenne du groupement

Les écarts sont calculés en pourcentage (ou en points pour le taux de marge) et affichés en vert lorsqu'ils sont favorables, en rouge lorsqu'ils sont défavorables.

### 6. Projection des Ventes

![Projection des Ventes](/images/docs/dashboard/dashboard-sales-projection.png)

Ce module utilise les datas de N-1 pour estimer vos ventes futures et suivre votre progression vers les objectifs annuels :

- **Graphique de progression** : Montre votre avancement dans l'année
- **Progression Sell-In** : Suivi de vos achats par rapport à l'objectif annuel
- **Progression Sell-Out** : Suivi de vos ventes par rapport à l'objectif annuel
- **Évolution vs N-1** : Comparaison avec l'année précédente
- **Reste à réaliser** : Montant restant pour atteindre l'objectif

Cette visualisation vous aide à anticiper les tendances et à planifier vos actions en conséquence.

## Utilisation du Tableau de Bord

### Changer la Période d'Analyse

1. Cliquez sur le sélecteur de période dans la barre de navigation supérieure
2. Choisissez l'onglet "Période d'analyse"
3. Sélectionnez la période souhaitée (ce mois-ci, mois dernier, etc.)
4. Pour une période personnalisée, sélectionnez "Personnalisé" et définissez les dates de début et de fin
5. Cliquez sur "Appliquer"

### Configurer la Comparaison

1. Cliquez sur le sélecteur de période dans la barre de navigation supérieure
2. Choisissez l'onglet "Comparaison"
3. Sélectionnez la base de comparaison (année précédente, période précédente ou personnalisé)
4. Cliquez sur "Appliquer"

### Filtrer par Produits

1. Cliquez sur le bouton "Sélection produits" dans la barre de navigation
2. Utilisez les onglets pour rechercher par produit, laboratoire ou segment
3. Sélectionnez les éléments souhaités
4. Choisissez le mode de filtrage (ET/OU) si vous avez plusieurs sélections
5. Cliquez sur "Appliquer le filtre"

### Personnaliser l'Évolution des Ventes

1. Utilisez les boutons "Marge" et "Sell-in" pour afficher ou masquer ces séries
2. Sélectionnez l'intervalle (Jour, Semaine, Mois) pour ajuster la granularité du graphique
3. Passez le curseur sur les points du graphique pour voir les détails précis de chaque période

### Changer le Tri des Top Produits

1. Utilisez les boutons "CA", "Quantité" et "Marge" pour modifier le critère de tri
2. Le tableau se mettra automatiquement à jour pour afficher les produits classés selon ce critère

## Astuces et Bonnes Pratiques

- **Analyse régulière** : Consultez votre tableau de bord au moins une fois par semaine
- **Utilisation des filtres** : Concentrez-vous sur des segments spécifiques pour une analyse plus précise
- **Comparaison temporelle** : Utilisez la fonction de comparaison pour identifier les tendances saisonnières
- **Vision intégrée** : Analysez les différentes sections ensemble pour une compréhension complète
- **Action sur les insights** : Transformez les observations en actions concrètes
- **Suivi des projections** : Ajustez votre stratégie commerciale en fonction des prévisions

## Support et assistance

Si vous avez besoin d'aide ou si vous avez des questions qui ne trouvent pas réponse dans cette documentation :

- Contactez l'équipe support du groupement
- Consultez nos webinaires et formations en ligne

---

*Cette documentation est régulièrement mise à jour pour refléter les évolutions de l'application.*