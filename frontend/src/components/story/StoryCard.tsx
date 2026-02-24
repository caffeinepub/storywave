import React from 'react';
import { type StoryMetadata } from '../../backend';
import { categoryLabel, categoryColor, formatCount, cn } from '../../lib/utils';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetUserLikedStories, useLikeStory, useUnlikeStory, useSaveStoryToLibrary, useUnsaveStoryFromLibrary, useGetUserSavedStories } from '../../hooks/useQueries';
import { usePlayer } from '../../context/PlayerContext';
import MiniAudioPlayer from './MiniAudioPlayer';
import { Heart, Bookmark, Eye, Headphones } from 'lucide-react';

interface StoryCardProps {
  story: StoryMetadata;
}

export default function StoryCard({ story }: StoryCardProps) {
  const { identity } = useInternetIdentity();
  const { openPlayer } = usePlayer();
  const isAuthenticated = !!identity;

  const { data: likedIds = [] } = useGetUserLikedStories();
  const { data: savedStories = [] } = useGetUserSavedStories();
  const likeStory = useLikeStory();
  const unlikeStory = useUnlikeStory();
  const saveToLibrary = useSaveStoryToLibrary();
  const unsaveFromLibrary = useUnsaveStoryFromLibrary();

  const isLiked = likedIds.includes(story.id);
  const isSaved = savedStories.some(s => s.id === story.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isLiked) {
      unlikeStory.mutate(story.id);
    } else {
      likeStory.mutate(story.id);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isSaved) {
      unsaveFromLibrary.mutate(story.id);
    } else {
      saveToLibrary.mutate(story.id);
    }
  };

  const handleCardClick = () => {
    openPlayer(story);
  };

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden shadow-card card-hover cursor-pointer border border-border/50 animate-slide-up"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {story.coverImageUrl ? (
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full gradient-bg-subtle flex items-center justify-center">
            <Headphones className="w-12 h-12 text-primary opacity-60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <span className={cn('absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full border font-medium', categoryColor(story.category))}>
          {categoryLabel(story.category)}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">{story.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{story.creatorName}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatCount(story.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatCount(story.likeCount)}
          </span>
        </div>

        {/* Mini Player */}
        {story.audioFilePath && (
          <MiniAudioPlayer audioFilePath={story.audioFilePath} storyId={story.id} />
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={cn(
              'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-all',
              isLiked
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent',
              !isAuthenticated && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!isAuthenticated}
            className={cn(
              'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-all',
              isSaved
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent',
              !isAuthenticated && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
