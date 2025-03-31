// src/app/docs/[...slug]/page.tsx
import { getDocContent } from '@/lib/docs/docUtils';
import { DocContent } from '@/components/docs/DocContent';
import { notFound } from 'next/navigation';

export default async function DocPage({ params }: { params: { slug: string[] } }) {
  // Joindre tous les segments du chemin pour former le slug complet
  const slug = params.slug?.join('/') || '';
  console.log('Slug extrait des paramètres:', slug); // Pour déboguer
  
  const doc = await getDocContent(slug);
  
  if (!doc) {
    console.log('Document non trouvé pour le slug:', slug); // Pour déboguer
    return notFound();
  }
  
  return (
    <DocContent 
      title={doc.title} 
      content={doc.content} 
    />
  );
}