// src/app/docs/layout.tsx
import { DocLayout } from '@/components/docs/DocLayout';

export const metadata = {
  title: 'Documentation | ApoData Analytics',
  description: 'Guide d\'utilisation pour les pharmaciens',
};

export default function DocsLayout({ children }) {
  return <DocLayout>{children}</DocLayout>;
}