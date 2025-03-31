---
title: "Filtre de dates"
description: "Guide complet d'utilisation du système de filtrage par dates dans ApoData"
lastUpdated: "2025-03-31"
---

# Filtre de dates

Le système de filtrage par dates est un composant essentiel d'ApoData qui vous permet de définir précisément la période d'analyse de vos données. Cet outil polyvalent offre à la fois des périodes prédéfinies et des options personnalisées pour répondre à tous vos besoins d'analyse temporelle.

## Présentation générale

Le filtre de dates d'ApoData vous permet de :

- Sélectionner rapidement des périodes prédéfinies (mois en cours, trimestre, etc.)
- Définir des périodes personnalisées avec précision
- Configurer une période de comparaison pour analyser les évolutions
- Visualiser clairement les périodes sélectionnées

Cette fonctionnalité est accessible en permanence depuis l'en-tête de l'application, assurant une cohérence d'analyse sur l'ensemble de la plateforme.

## Accéder au filtre de dates

Le sélecteur de dates est situé dans la barre d'en-tête de l'application et affiche par défaut la période actuellement sélectionnée. Pour modifier cette période, cliquez sur le sélecteur pour ouvrir le panneau de configuration.

![Sélecteur de dates](/images/docs/date-filter/date-selector.png)

## Structure du filtre de dates

Le panneau du filtre de dates est organisé en deux onglets principaux :

### 1. Période d'analyse

Cet onglet vous permet de définir la période principale pour votre analyse.

#### Périodes prédéfinies disponibles :

- **Ce mois-ci** : Données du mois en cours
- **Mois dernier** : Données du mois précédent
- **3 derniers mois** : Données des trois derniers mois
- **6 derniers mois** : Données du semestre écoulé
- **Cette année** : Données de l'année en cours
- **Personnalisé** : Période définie par l'utilisateur

![Sélection de période](/images/docs/date-filter/period-selection.png)

#### Période personnalisée :

Si vous sélectionnez l'option "Personnalisé", des champs supplémentaires apparaissent pour vous permettre de définir précisément les dates de début et de fin de votre analyse.

![Période personnalisée](/images/docs/date-filter/custom-period.png)

### 2. Comparaison

L'onglet "Comparaison" vous permet de configurer une période secondaire à comparer avec votre période principale d'analyse.

#### Options de comparaison :

- **Année précédente** : Période équivalente de l'année précédente
- **Période précédente** : Période de même durée juste avant la période principale
- **Personnalisé** : Période de comparaison définie par l'utilisateur

![Options de comparaison](/images/docs/date-filter/comparison-options.png)

La comparaison est un outil puissant pour :
- Mesurer l'évolution d'une année sur l'autre
- Évaluer les tendances
- Identifier les saisonnalités

## Affichage des périodes sélectionnées

Une fois vos sélections effectuées, un résumé des périodes actives est affiché :

- Dans le sélecteur de la barre d'en-tête (format condensé)
- Dans un widget "Périodes analysées" sur le dashboard (format détaillé)

![Affichage des périodes](/images/docs/date-filter/periods-display.png)

Le widget détaillé présente clairement :
- Les dates exactes de chaque période
- Un code couleur distinct pour différencier la période principale de la période de comparaison

## Appliquer les filtres de date

Une fois que vous avez configuré vos périodes d'analyse et de comparaison, cliquez sur le bouton "Appliquer" pour mettre à jour l'ensemble des visualisations et analyses avec ces nouvelles périodes.

L'application conserve vos sélections de dates pendant votre session, ce qui permet une cohérence d'analyse lorsque vous naviguez entre les différentes sections.

## Impact sur les visualisations

L'application des filtres de dates a un impact immédiat sur :

- Les graphiques d'évolution (affichage des deux périodes en superposition)
- Les indicateurs clés de performance (calcul des variations)
- Les tableaux de données (filtrage des enregistrements)
- Les analyses prévisionnelles (ajustement des modèles)

## Bonnes pratiques

- **Adaptez la période à l'analyse** : Pour l'analyse de tendances, privilégiez des périodes plus longues (trimestre, semestre)
- **Comparez des périodes comparables** : Pour les analyses saisonnières, comparez avec la même période de l'année précédente
- **Ajustez la granularité** : Plus la période est courte, plus l'analyse sera précise mais potentiellement sujette à des fluctuations ponctuelles
- **Vérifiez la cohérence** : Assurez-vous que les périodes sélectionnées contiennent suffisamment de données pour une analyse pertinente

---

La maîtrise du filtre de dates est essentielle pour réaliser des analyses temporelles pertinentes dans ApoData et identifier correctement les tendances et évolutions de votre activité.