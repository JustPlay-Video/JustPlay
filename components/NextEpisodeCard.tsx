'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NextEpisode {
  episode: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    season_number: number;
    episode_number: number;
    duration_seconds: number;
  };
  show: {
    id: string;
    title: string;
  };
  progress: {
    current_round: number;
    current_show_position: number;
  };
}

interface NextEpisodeCardProps {
  lineupId: string;
}

export default function NextEpisodeCard({ lineupId }: NextEpisodeCardProps) {
  const [nextEpisode, setNextEpisode] = useState<NextEpisode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lineups/${lineupId}/next-episode`)
      .then(res => res.json())
      .then(data => {
        setNextEpisode(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch next episode:', err);
        setLoading(false);
      });
  }, [lineupId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!nextEpisode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No more episodes in this lineup
        </p>
      </div>
    );
  }

  const { episode, show, progress } = nextEpisode;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Up Next</h3>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          Round {progress.current_round}
        </span>
      </div>

      <Link href={`/watch/${episode.id}?lineup=${lineupId}`} className="block group">
        <div className="aspect-video relative overflow-hidden rounded-lg bg-black/20 mb-4">
          {episode.thumbnail_url && (
            <img
              src={episode.thumbnail_url}
              alt={episode.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <h4 className="font-semibold text-lg mb-1">{episode.title}</h4>
        <p className="text-sm text-white/80 mb-1">{show.title}</p>
        <p className="text-xs text-white/60">
          S{episode.season_number}E{episode.episode_number} · {Math.floor(episode.duration_seconds / 60)}m
        </p>
      </Link>
    </div>
  );
}
