// src/lib/docs/docUtils.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Structure des documents de documentation
interface DocItem {
  slug: string;
  title: string;
}

interface DocSection {
  title: string;
  items: DocItem[];
}

// Chemin vers le dossier des documents
const docsDirectory = path.join(process.cwd(), 'src/content/docs');

// Structure de documentation pour ApoData
const documentationStructure: DocSection[] = [
  {
    title: 'Prise en main',
    items: [
      { slug: 'getting-started', title: 'Premiers pas' }
    ]
  },
  {
    title: 'Fonctionnalités',
    items: [
      { slug: 'features/segment-filter', title: 'Segment de filtre' },
      { slug: 'features/dashboard', title: 'Page globale' },
      { slug: 'features/product-page', title: 'Page Produit' },
      { slug: 'features/laboratory-page', title: 'Page Labo' }
    ]
  },
  {
    title: 'Data',
    items: [
      { slug: 'data/collection', title: 'Collecte des données' },
      { slug: 'data/indicators', title: 'Calcul des indicateurs' }
    ]
  },
  {
    title: 'Guides pratiques',
    items: [
      { slug: 'guides/svr-analysis', title: 'Analyse du labo SVR' }
    ]
  }
];

// Obtenir tous les slugs
export function getAllDocSlugs(): string[] {
  return documentationStructure.flatMap(section => 
    section.items.map(item => item.slug)
  );
}

// Obtenir la structure de documentation
export function getDocStructure(): DocSection[] {
  return documentationStructure;
}

// Vérifier si un dossier existe, sinon le créer
function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Dossier créé: ${directoryPath}`);
  }
}

// Obtenir le contenu d'un document
export function getDocContent(slug: string): { title: string; content: string } | null {
  try {
    // S'assurer que le dossier de documentation existe
    ensureDirectoryExists(docsDirectory);
    
    // Pour l'index, utiliser le fichier index.md ou retourner un contenu par défaut
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(fullPath)) {
      console.warn(`Fichier non trouvé: ${fullPath}`);
      
      // Si c'est l'index mais que le fichier n'existe pas, retourner un contenu par défaut
      if (slug === 'index' || slug === '') {
        return {
          title: 'Documentation ApoData',
          content: `# ApoData - Documentation

## Bienvenue dans la documentation

Bienvenue dans la documentation officielle d'ApoData, la plateforme d'intelligence commerciale conçue spécifiquement pour les pharmacies du groupement Apothical. Ce guide complet vous accompagnera dans la prise en main et l'utilisation avancée de toutes les fonctionnalités offertes par notre solution.

## À propos d'ApoData

### Notre vision

ApoData est née d'une conviction : les pharmaciens devraient pouvoir prendre des décisions commerciales basées sur des données précises et pertinentes, sans avoir besoin d'expertise en analyse de données. Notre plateforme transforme des données complexes en insights actionnables, permettant aux pharmaciens de se concentrer sur ce qui compte vraiment : leurs patients et le développement de leur officine.

### Notre mission

Notre mission est de démocratiser l'intelligence commerciale dans le secteur pharmaceutique en proposant une solution :

- **Accessible** : Intuitive et ne nécessitant aucune compétence technique
- **Pertinente** : Centrée sur les indicateurs qui comptent vraiment pour une pharmacie
- **Actionnable** : Transformant les données en recommandations concrètes
- **Évolutive** : S'adaptant continuellement aux besoins du marché

## Ce que vous pouvez accomplir avec ApoData

ApoData vous permet de :

- **Analyser vos performances commerciales** avec une vision à 360°
- **Identifier les opportunités de développement** par segment, laboratoire ou produit
- **Comparer vos performances** avec celles du groupement
- **Générer des rapports automatiques** pour suivre vos KPIs sans effort`
        };
      }
      
      // Pour les autres pages, rechercher dans la structure et retourner un contenu par défaut
      for (const section of documentationStructure) {
        const item = section.items.find(item => item.slug === slug);
        if (item) {
          return {
            title: item.title,
            content: `# ${item.title}\n\nContenu de la page ${item.title}. Cette page est en cours de rédaction.`
          };
        }
      }
      
      return null;
    }
    
    // Lire le fichier et extraire les métadonnées avec gray-matter
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      title: data.title || 'Documentation',
      content,
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture du document ${slug}:`, error);
    
    // En cas d'erreur, vérifier si c'est un slug connu dans la structure
    if (slug === 'index' || slug === '') {
      return {
        title: 'Documentation ApoData',
        content: `# ApoData - Documentation\n\nBienvenue dans la documentation...`
      };
    }
    
    for (const section of documentationStructure) {
      const item = section.items.find(item => item.slug === slug);
      if (item) {
        return {
          title: item.title,
          content: `# ${item.title}\n\nContenu de la page ${item.title}. Cette page est en cours de rédaction.`
        };
      }
    }
    
    return null;
  }
}

// Fonction utilitaire pour créer un fichier Markdown s'il n'existe pas
export function createMarkdownFileIfNotExists(slug: string, title: string, content: string): void {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    
    // Si le fichier existe déjà, ne pas l'écraser
    if (fs.existsSync(fullPath)) {
      return;
    }
    
    // Créer les répertoires nécessaires
    const directory = path.dirname(fullPath);
    ensureDirectoryExists(directory);
    
    // Créer le contenu avec les métadonnées
    const fileContent = `---
title: "${title}"
description: "Documentation sur ${title}"
lastUpdated: "${new Date().toISOString().split('T')[0]}"
---

${content}`;
    
    // Écrire le fichier
    fs.writeFileSync(fullPath, fileContent);
    console.log(`Fichier Markdown créé: ${fullPath}`);
  } catch (error) {
    console.error(`Erreur lors de la création du fichier Markdown ${slug}:`, error);
  }
}

// Fonction pour initialiser tous les fichiers de documentation manquants
export function initializeDocumentationFiles(): void {
  try {
    // Créer le répertoire de documentation s'il n'existe pas
    ensureDirectoryExists(docsDirectory);
    
    // Créer le fichier d'index s'il n'existe pas
    createMarkdownFileIfNotExists('index', 'Documentation ApoData', `# ApoData - Documentation

## Bienvenue dans la documentation

Bienvenue dans la documentation officielle d'ApoData, la plateforme d'intelligence commerciale conçue spécifiquement pour les pharmacies du groupement Apothical. Ce guide complet vous accompagnera dans la prise en main et l'utilisation avancée de toutes les fonctionnalités offertes par notre solution.

## À propos d'ApoData

### Notre vision

ApoData est née d'une conviction : les pharmaciens devraient pouvoir prendre des décisions commerciales basées sur des données précises et pertinentes, sans avoir besoin d'expertise en analyse de données. Notre plateforme transforme des données complexes en insights actionnables, permettant aux pharmaciens de se concentrer sur ce qui compte vraiment : leurs patients et le développement de leur officine.

### Notre mission

Notre mission est de démocratiser l'intelligence commerciale dans le secteur pharmaceutique en proposant une solution :

- **Accessible** : Intuitive et ne nécessitant aucune compétence technique
- **Pertinente** : Centrée sur les indicateurs qui comptent vraiment pour une pharmacie
- **Actionnable** : Transformant les données en recommandations concrètes
- **Évolutive** : S'adaptant continuellement aux besoins du marché

## Ce que vous pouvez accomplir avec ApoData

ApoData vous permet de :

- **Analyser vos performances commerciales** avec une vision à 360°
- **Identifier les opportunités de développement** par segment, laboratoire ou produit
- **Comparer vos performances** avec celles du groupement
- **Générer des rapports automatiques** pour suivre vos KPIs sans effort`);
    
    // Parcourir toute la structure et créer les fichiers manquants
    for (const section of documentationStructure) {
      for (const item of section.items) {
        createMarkdownFileIfNotExists(
          item.slug, 
          item.title, 
          `# ${item.title}\n\nContenu de la page ${item.title}. Cette page est en cours de rédaction.`
        );
      }
    }
    
    console.log('Initialisation des fichiers de documentation terminée');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des fichiers de documentation:', error);
  }
}