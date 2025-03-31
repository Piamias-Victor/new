'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DocSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/docs/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <form onSubmit={handleSearch}>
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-2 p-1 bg-blue-500 text-white rounded"
        >
          🔍
        </button>
      </div>
    </form>
  );
}