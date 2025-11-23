/**
 * VideoPlayerSection Component
 *
 * Client-side wrapper for MuxPlayer with progress tracking
 */

'use client';

import { useWatchProgress } from '@/hooks/useWatchProgress';
import MuxPlayer from './MuxPlayer';

interface Caption {
  id: string;
  language_code: string;
  language_name: string;
  caption_url: string;
  is_default: boolean;
}

interface VideoPlayerSectionProps {
  playbackId: string;
  episodeId: string;
  title: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  startTime?: number;
  lineupId?: string | null;
  childProfileId?: string | null;
  captions?: Caption[];
}

/**
 * VideoPlayerSection - Handles video playback with progress tracking
 *
 * Features:
 * - Integrates MuxPlayer
 * - Automatically saves watch progress
 * - Resumes from last position
 * - Tracks completion status
 *
 * @param props - Component props
 */
export default function VideoPlayerSection({
  playbackId,
  episodeId,
  title,
  thumbnailUrl,
  durationSeconds,
  startTime = 0,
  lineupId,
  childProfileId,
}: VideoPlayerSectionProps) {
  const { saveProgress } = useWatchProgress({
    episodeId,
    durationSeconds,
    lineupId,
    childProfileId,
  });

  const handleTimeUpdate = (currentTime: number) => {
    saveProgress(currentTime);
  };

  const handlePlay = () => {
    console.log('Video playing');
  };

  const handlePause = () => {
    console.log('Video paused');
  };

  const handleEnded = () => {
    // Mark as completed (will be handled by saveProgress at 90%)
    console.log('Video ended');
    saveProgress(durationSeconds);
  };

  return (
    <MuxPlayer
      playbackId={playbackId}
      title={title}
      thumbnailUrl={thumbnailUrl}
      startTime={startTime}
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
    />
  );
}
