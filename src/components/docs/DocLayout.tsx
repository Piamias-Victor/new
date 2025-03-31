// src/components/docs/DocLayout.tsx
import { DocSidebar } from './DocSidebar';

export function DocLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="w-full md:w-64 border-r border-gray-200 bg-white p-4 shadow-sm">
        <DocSidebar />
      </div>
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}