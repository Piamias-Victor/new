// src/lib/docs/docUtils.ts
import fs from 'fs/promises';
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
      { slug: 'features/segment-filter', title: 'Filtre de produits' },
      { slug: 'features/date-filter', title: 'Filtre de dates' },
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

// Séparer le code côté serveur du code côté client
// Créer un drapeau pour indiquer si le code s'exécute côté serveur
const isServer = typeof window === 'undefined';

// Obtenir le contenu d'un document
export async function getDocContent(slug: string): Promise<{ title: string; content: string } | null> {
  // Si nous sommes côté client, retournons un contenu de secours statique
  if (!isServer) {
    // Trouver le document dans la structure si possible
    for (const section of documentationStructure) {
      const item = section.items.find(item => item.slug === slug);
      if (item) {
        return {
          title: item.title,
          content: `# ${item.title}\n\nChargement du contenu...`
        };
      }
    }
    
    // Si c'est la page d'index
    if (slug === 'index' || slug === '') {
      return {
        title: 'Documentation ApoData',
        content: '# Documentation ApoData\n\nChargement du contenu...'
      };
    }
    
    return {
      title: 'Documentation',
      content: 'Chargement du contenu...'
    };
  }
  
  try {
    // Code exécuté uniquement côté serveur
    const docsDirectory = path.join(process.cwd(), 'src/content/docs');
    
    // Pour l'index, utiliser le fichier index.md ou retourner un contenu par défaut
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(fullPath);
    } catch (error) {
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
    const fileContents = await fs.readFile(fullPath, 'utf8');
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

// Ces fonctions ne doivent être utilisées que côté serveur dans des API routes ou getServerSideProps
export async function createMarkdownFileIfNotExists(slug: string, title: string, content: string): Promise<void> {
  if (!isServer) {
    console.warn('Cette fonction ne peut être utilisée que côté serveur');
    return;
  }
  
  try {
    const docsDirectory = path.join(process.cwd(), 'src/content/docs');
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    
    // Vérifier si le fichier existe déjà
    try {
      await fs.access(fullPath);
      return; // Le fichier existe déjà, ne rien faire
    } catch (error) {
      // Le fichier n'existe pas, on continue
    }
    
    // Créer les répertoires nécessaires
    const directory = path.dirname(fullPath);
    await fs.mkdir(directory, { recursive: true });
    
    // Créer le contenu avec les métadonnées
    const fileContent = `---
title: "${title}"
description: "Documentation sur ${title}"
lastUpdated: "${new Date().toISOString().split('T')[0]}"
---

${content}`;
    
    // Écrire le fichier
    await fs.writeFile(fullPath, fileContent);
    console.log(`Fichier Markdown créé: ${fullPath}`);
  } catch (error) {
    console.error(`Erreur lors de la création du fichier Markdown ${slug}:`, error);
  }
}

// Fonction pour initialiser tous les fichiers de documentation manquants (à utiliser dans un script Node.js séparé)
export async function initializeDocumentationFiles(): Promise<void> {
  if (!isServer) {
    console.warn('Cette fonction ne peut être utilisée que côté serveur');
    return;
  }
  
  try {
    const docsDirectory = path.join(process.cwd(), 'src/content/docs');
    
    // Créer le répertoire de documentation s'il n'existe pas
    await fs.mkdir(docsDirectory, { recursive: true });
    
    // Créer le fichier d'index s'il n'existe pas
    await createMarkdownFileIfNotExists('index', 'Documentation ApoData', `# ApoData - Documentation

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
        await createMarkdownFileIfNotExists(
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