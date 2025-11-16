/**
 * MuxPlayer Component
 *
 * Video player component using Mux Player for HLS streaming.
 * Supports playback of Mux-hosted videos with automatic adaptive bitrate streaming.
 *
 * @component
 * @example
 * ```tsx
 * <MuxPlayer
 *   playbackId="abc123xyz"
 *   title="Episode Title"
 *   onPlay={() => console.log('Playing')}
 * />
 * ```
 */

'use client';

import React from 'react';
import MuxPlayerReact from '@mux/mux-player-react';

interface MuxPlayerProps {
  /**
   * Mux playback ID for the video
   * Retrieved from episodes.mux_playback_id
   */
  playbackId: string;

  /**
   * Video title (displayed in player)
   */
  title?: string;

  /**
   * Thumbnail URL (optional, Mux auto-generates if not provided)
   */
  thumbnailUrl?: string;

  /**
   * Callback fired when video starts playing
   */
  onPlay?: () => void;

  /**
   * Callback fired when video is paused
   */
  onPause?: () => void;

  /**
   * Callback fired when video ends
   */
  onEnded?: () => void;

  /**
   * Callback fired periodically during playback
   * @param currentTime - Current playback position in seconds
   */
  onTimeUpdate?: (currentTime: number) => void;

  /**
   * Start playback at specific time (in seconds)
   */
  startTime?: number;

  /**
   * Enable autoplay (default: false)
   */
  autoPlay?: boolean;

  /**
   * Enable muted by default (useful with autoplay)
   */
  muted?: boolean;
}

/**
 * MuxPlayer - Video playback component
 *
 * Features:
 * - Automatic adaptive bitrate streaming (HLS)
 * - Native controls with play/pause/fullscreen
 * - Playback progress tracking
 * - Thumbnail preview on hover
 * - Responsive sizing
 *
 * @param {MuxPlayerProps} props - Component props
 */
export default function MuxPlayer({
  playbackId,
  title,
  thumbnailUrl,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  startTime = 0,
  autoPlay = false,
  muted = false,
}: MuxPlayerProps) {
  /**
   * Handle time update events
   */
  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onTimeUpdate) {
      const videoElement = event.currentTarget;
      onTimeUpdate(videoElement.currentTime);
    }
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <MuxPlayerReact
        playbackId={playbackId}
        metadata={{
          video_title: title || 'Video',
        }}
        poster={thumbnailUrl}
        currentTime={startTime}
        autoPlay={autoPlay}
        muted={muted}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        streamType="on-demand"
        primaryColor="#3b82f6"
        accentColor="#60a5fa"
      />
    </div>
  );
}
