// src/components/docs/DocContent.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './DocContent.css'; // Nous allons créer ce fichier CSS

export function DocContent({ title, content }: { title: string; content: string }) {
  return (
    <article className="doc-content">
      {/* Nous ne rendons pas le titre ici car il est déjà dans le contenu Markdown */}
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={{
          // Personnalisation des composants rendus
          h1: ({node, ...props}) => <h1 className="doc-h1" {...props} />,
          h2: ({node, ...props}) => <h2 className="doc-h2" {...props} />,
          h3: ({node, ...props}) => <h3 className="doc-h3" {...props} />,
          p: ({node, ...props}) => <p className="doc-p" {...props} />,
          ul: ({node, ...props}) => <ul className="doc-ul" {...props} />,
          ol: ({node, ...props}) => <ol className="doc-ol" {...props} />,
          li: ({node, ...props}) => <li className="doc-li" {...props} />,
          a: ({node, ...props}) => <a className="doc-link" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="doc-blockquote" {...props} />,
          code: ({node, inline, ...props}) => 
            inline 
              ? <code className="doc-inline-code" {...props} />
              : <pre className="doc-code-block"><code {...props} /></pre>,
          strong: ({node, ...props}) => <strong className="doc-strong" {...props} />,
          em: ({node, ...props}) => <em className="doc-em" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}