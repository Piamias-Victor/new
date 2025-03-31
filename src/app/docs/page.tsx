// src/app/docs/page.tsx
import { getDocContent } from '@/lib/docs/docUtils';
import { DocContent } from '@/components/docs/DocContent';

export default async function DocsHomePage() {
  const doc = await getDocContent('index');
  
  return (
    <DocContent 
      title={doc?.title || 'Documentation'} 
      content={doc?.content || '# Documentation\n\nContenu indisponible'} 
    />
  );
}