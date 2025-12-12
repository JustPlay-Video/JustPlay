'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * SearchBar component for browse page
 * Debounced search input that updates URL params
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar />
 * ```
 */
export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.push(`/browse?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search shows..."
        className="w-full rounded-lg border-0 py-3 px-4 pl-12 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
