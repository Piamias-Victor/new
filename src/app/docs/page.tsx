import { getDocContent } from '@/lib/docs/docUtils';
import { DocContent } from '@/components/docs/DocContent';

export default function DocsHomePage() {
  const doc = getDocContent('index');
  
  return (
    <DocContent 
      title={doc.title} 
      content={doc.content} 
    />
  );
}