import React, { useRef, useState, useEffect, useCallback } from 'react';
import { type StoryMetadata, ExternalBlob } from '../../backend';
import { formatTime, formatCount, categoryLabel, categoryColor } from '../../lib/utils';
import { useIncrementStoryViews } from '../../hooks/useQueries';
import { addRecentlyPlayed } from '../../lib/recentlyPlayed';
import { Button } from '@/components/ui/button';
import {
  X, Play, Pause, SkipBack, SkipForward, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FullScreenAudioPlayerProps {
  story: StoryMetadata;
  onClose: () => void;
}

const SPEEDS = [1, 1.5, 2] as const;

export default function FullScreenAudioPlayer({ story, onClose }: FullScreenAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const incrementViews = useIncrementStoryViews();

  useEffect(() => {
    if (story.audioFilePath) {
      try {
        const blob = ExternalBlob.fromURL(story.audioFilePath);
        setAudioUrl(blob.getDirectURL());
      } catch {
        setAudioUrl(story.audioFilePath);
      }
    }
    incrementViews.mutate(story.id);
    addRecentlyPlayed(story.id);
  }, [story.id, story.audioFilePath]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  }, [duration]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  }, []);

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    audio.playbackRate = next;
  }, [speed]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
      {/* Background blur from cover */}
      {story.coverImageUrl && (
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl scale-110"
          style={{ backgroundImage: `url(${story.coverImageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full px-6 pt-safe">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Now Playing</span>
          <div className="w-9" />
        </div>

        {/* Cover Art */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
          <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-glow-lg">
            {story.coverImageUrl ? (
              <img
                src={story.coverImageUrl}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-bg flex items-center justify-center">
                <span className="text-6xl">🎙️</span>
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="flex gap-1 items-end">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="w-1 rounded-full gradient-bg animate-pulse"
                      style={{
                        height: `${8 + Math.random() * 16}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Story Info */}
          <div className="text-center space-y-2 w-full">
            <span className={cn('inline-block text-xs px-2.5 py-0.5 rounded-full border', categoryColor(story.category))}>
              {categoryLabel(story.category)}
            </span>
            <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{story.title}</h2>
            <p className="text-muted-foreground">{story.creatorName}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatCount(story.viewCount)} views</span>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="pb-8 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="progress-bar w-full"
              style={{
                background: `linear-gradient(to right, oklch(0.65 0.22 290) ${progress}%, oklch(0.28 0.03 280) ${progress}%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Speed */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleSpeed}
              className="text-muted-foreground hover:text-foreground font-mono text-sm w-12"
            >
              {speed}x
            </Button>

            {/* Skip Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-foreground hover:text-primary w-12 h-12"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-glow hover:opacity-90 transition-opacity active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-foreground hover:text-primary w-12 h-12"
            >
              <SkipForward className="w-6 h-6" />
            </Button>

            {/* Placeholder for symmetry */}
            <div className="w-12" />
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
