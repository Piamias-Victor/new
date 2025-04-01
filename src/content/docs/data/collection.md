---
title: "Sécurité et Gestion des Données"
description: "Informations sur la collecte, le stockage et la protection des données dans ApoData"
lastUpdated: "2025-04-01"
---

# Sécurité et Gestion des Données

## Collecte des données

### Source des données

ApoData collecte automatiquement les données commerciales directement depuis les Logiciels de Gestion d'Officine (LGO) de chaque pharmacie **tous les soirs**. Ce processus entièrement automatisé permet d'avoir des analyses à jour quotidiennement sans aucune intervention manuelle de votre part.

### Données collectées et non collectées

**Données collectées :**
- Données de ventes (quantités, prix)
- Données de stock
- Informations sur les produits (codes, catégories, laboratoires)
- Commandes et approvisionnements

**Données strictement exclues :**
- Données de santé des patients
- Informations personnelles des clients
- Données d'ordonnances
- Historiques médicaux
- Toute autre donnée sensible liée aux patients

Nous appliquons une politique stricte de minimisation des données : seules les informations nécessaires à l'analyse commerciale sont collectées.

## Stockage et sécurité

### Infrastructure sécurisée

Toutes les données sont stockées sur des serveurs sécurisés certifiés **HDS** (Hébergeur de Données de Santé), bien que nous ne collectons aucune donnée de santé. Ces serveurs sont hébergés par Amazon Web Services (AWS) dans la région **eu-west-3 (Paris)**, garantissant ainsi que vos données restent sur le territoire français et sont soumises aux lois européennes sur la protection des données.

### Mesures de sécurité

Nous mettons en œuvre plusieurs niveaux de protection :

- Authentification multi-facteurs pour l'accès administrateur
- Pare-feu avancés et surveillance continue des systèmes
- Mises à jour de sécurité prioritaires

### Sauvegardes

Des **sauvegardes quotidiennes** complètes sont effectuées pour garantir la résilience des données en cas d'incident. Ces sauvegardes sont également chiffrées et stockées de manière sécurisée.

## Propriété et confidentialité des données

### Propriété exclusive

Toutes les données collectées restent la **propriété exclusive du groupement Apothical et des pharmacies**. Phardev, en tant que prestataire technologique, n'a qu'une mission de développement et de maintenance de la plateforme technique permettant de traiter et visualiser ces données.

### Limitation d'accès

Phardev n'a **aucun droit de propriété ni de regard** sur les données commerciales des pharmacies. Notre rôle se limite strictement à :

- Développer et maintenir l'infrastructure technique
- Assurer le bon fonctionnement des processus automatisés
- Fournir un support technique en cas de besoin

### Confidentialité

Des accords stricts de confidentialité sont en place pour protéger vos informations commerciales. Tout le personnel ayant potentiellement accès à l'infrastructure est soumis à des clauses de confidentialité renforcées.

## Conformité réglementaire

### RGPD

Bien que nous ne traitions pas de données personnelles de patients, notre plateforme est entièrement conforme au Règlement Général sur la Protection des Données (RGPD) pour toute donnée professionnelle traitée.

## Questions fréquentes

**Q: Les données de ma pharmacie sont-elles visibles par les autres pharmacies du groupement?**  
R: Non. Chaque pharmacie a uniquement accès à ses propres données. Seules des statistiques agrégées et anonymisées peuvent être partagées au niveau du groupement.

---

Pour toute question supplémentaire concernant la sécurité ou la gestion des données, n'hésitez pas à contacter votre référent Apothical