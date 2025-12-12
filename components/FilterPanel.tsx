'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FilterPanelProps {
  genres: string[];
}

/**
 * FilterPanel component for browse page filtering
 * Allows users to filter by genre, age range, and sort order
 *
 * @component
 * @param {string[]} genres - Array of available genres
 * @example
 * ```tsx
 * <FilterPanel genres={['Comedy', 'Adventure', 'Educational']} />
 * ```
 */
export default function FilterPanel({ genres }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');
  const [ageRange, setAgeRange] = useState({
    min: searchParams.get('minAge') || '',
    max: searchParams.get('maxAge') || ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (selectedGenre !== 'all') {
      params.set('genre', selectedGenre);
    } else {
      params.delete('genre');
    }

    if (ageRange.min) {
      params.set('minAge', ageRange.min);
    } else {
      params.delete('minAge');
    }

    if (ageRange.max) {
      params.set('maxAge', ageRange.max);
    } else {
      params.delete('maxAge');
    }

    if (sortBy !== 'newest') {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }

    router.push(`/browse?${params.toString()}`);
  };

  useEffect(() => {
    updateFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, ageRange, sortBy]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      {/* Genre Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Genre
        </label>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Age Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={ageRange.min}
            onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
            className="rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={ageRange.max}
            onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
            className="rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="newest">Newest</option>
          <option value="title">Title (A-Z)</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSelectedGenre('all');
          setAgeRange({ min: '', max: '' });
          setSortBy('newest');
          router.push('/browse');
        }}
        className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        Clear All Filters
      </button>
    </div>
  );
}
