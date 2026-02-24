import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserSavedStories, useGetUserStories, useGetAllStories } from '../hooks/useQueries';
import { getRecentlyPlayedIds } from '../lib/recentlyPlayed';
import StoryCard from '../components/story/StoryCard';
import LoginButton from '../components/auth/LoginButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Library, Bookmark, Mic, Clock } from 'lucide-react';
import { type StoryMetadata } from '../backend';

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-12 space-y-3">
      <p className="text-4xl">{icon}</p>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export default function LibraryPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const { data: savedStories = [], isLoading: loadingSaved } = useGetUserSavedStories();
  const { data: myStories = [], isLoading: loadingMine } = useGetUserStories(principal);
  const { data: allStories = [] } = useGetAllStories();

  const recentlyPlayedIds = getRecentlyPlayedIds();
  const recentlyPlayed: StoryMetadata[] = recentlyPlayedIds
    .map(id => allStories.find(s => s.id === id))
    .filter((s): s is StoryMetadata => !!s);

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
          <Library className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">Your Library</h2>
          <p className="text-muted-foreground">Log in to access your saved stories and creations.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Library</h1>
        <p className="text-muted-foreground text-sm mt-1">Your stories, all in one place</p>
      </div>

      <Tabs defaultValue="saved">
        <TabsList className="w-full bg-surface-2 border border-border/50 rounded-2xl p-1 mb-6">
          <TabsTrigger value="saved" className="flex-1 rounded-xl data-[state=active]:gradient-bg data-[state=active]:text-white text-xs">
            <Bookmark className="w-3.5 h-3.5 mr-1" />Saved
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1 rounded-xl data-[state=active]:gradient-bg data-[state=active]:text-white text-xs">
            <Mic className="w-3.5 h-3.5 mr-1" />My Stories
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex-1 rounded-xl data-[state=active]:gradient-bg data-[state=active]:text-white text-xs">
            <Clock className="w-3.5 h-3.5 mr-1" />Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          {loadingSaved ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : savedStories.length === 0 ? (
            <EmptyState icon="🔖" message="No saved stories yet. Tap the save button on any story!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedStories.map(story => <StoryCard key={story.id} story={story} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {loadingMine ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : myStories.length === 0 ? (
            <EmptyState icon="🎙️" message="You haven't published any stories yet. Create your first one!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myStories.map(story => <StoryCard key={story.id} story={story} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          {recentlyPlayed.length === 0 ? (
            <EmptyState icon="🎧" message="No recently played stories. Start listening!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentlyPlayed.map(story => <StoryCard key={story.id} story={story} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
