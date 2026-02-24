import React, { createContext, useContext, useState, useCallback } from 'react';
import { type StoryMetadata } from '../backend';

interface PlayerContextType {
  currentStory: StoryMetadata | null;
  isPlayerOpen: boolean;
  openPlayer: (story: StoryMetadata) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentStory, setCurrentStory] = useState<StoryMetadata | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const openPlayer = useCallback((story: StoryMetadata) => {
    setCurrentStory(story);
    setIsPlayerOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentStory, isPlayerOpen, openPlayer, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
