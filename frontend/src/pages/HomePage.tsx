import React from 'react';
import { useGetAllStories, useGetTrendingStories } from '../hooks/useQueries';
import StoryCard from '../components/story/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Sparkles } from 'lucide-react';

function StoryCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: allStories = [], isLoading: loadingAll } = useGetAllStories();
  const { data: trending = [], isLoading: loadingTrending } = useGetTrendingStories(5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-3xl overflow-hidden h-40 md:h-52"
        style={{ backgroundImage: 'url(/assets/generated/storywave-hero.dim_1200x600.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6">
          <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">Featured</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Your next favorite<br />story awaits
          </h2>
        </div>
      </div>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Trending Now</h2>
        </div>
        {loadingTrending ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => <StoryCardSkeleton key={i} />)}
          </div>
        ) : trending.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No stories yet. Be the first to publish!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trending.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>

      {/* All Stories */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">All Stories</h2>
        </div>
        {loadingAll ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => <StoryCardSkeleton key={i} />)}
          </div>
        ) : allStories.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">🎙️</p>
            <p className="text-muted-foreground">No stories published yet.</p>
            <p className="text-sm text-muted-foreground">Create the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
