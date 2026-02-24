import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ExternalBlob } from '../../backend';
import { formatTime } from '../../lib/utils';
import { Play, Pause } from 'lucide-react';

interface MiniAudioPlayerProps {
  audioFilePath: string;
  storyId: string;
}

export default function MiniAudioPlayer({ audioFilePath, storyId }: MiniAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    if (audioFilePath) {
      try {
        const blob = ExternalBlob.fromURL(audioFilePath);
        setAudioUrl(blob.getDirectURL());
      } catch {
        setAudioUrl(audioFilePath);
      }
    }
  }, [audioFilePath]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1 space-y-0.5">
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
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
