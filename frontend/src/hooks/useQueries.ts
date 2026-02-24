import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Category, type StoryMetadata, type UserProfile, type StoryDraft } from '../backend';

// ── Profile Queries ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal && !!identity,
  });
}

// ── Story Queries ────────────────────────────────────────────────────────────

export function useGetAllStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryMetadata[]>({
    queryKey: ['allStories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStories();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTrendingStories(limit: number = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryMetadata[]>({
    queryKey: ['trendingStories', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingStories(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStoriesByCategory(category: Category | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryMetadata[]>({
    queryKey: ['storiesByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getStoriesByCategory(category);
    },
    enabled: !!actor && !actorFetching && !!category,
  });
}

export function useSearchStories(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryMetadata[]>({
    queryKey: ['searchStories', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchStories(searchTerm.trim());
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}

export function useGetUserStories(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StoryMetadata[]>({
    queryKey: ['userStories', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserStories(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal && !!identity,
  });
}

export function useGetUserSavedStories() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StoryMetadata[]>({
    queryKey: ['userSavedStories', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      const savedIds = await actor.getUserSavedStories(principal);
      const allStories = await actor.getAllStories();
      return allStories.filter(s => savedIds.includes(s.id));
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetUserLikedStories() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['userLikedStories', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserLikedStories(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ── Story Mutations ──────────────────────────────────────────────────────────

export function useSaveStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: StoryMetadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveStory(story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStories'] });
      queryClient.invalidateQueries({ queryKey: ['userStories'] });
      queryClient.invalidateQueries({ queryKey: ['trendingStories'] });
    },
  });
}

export function useSaveAudioBlob() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ storyId, audioBlob }: { storyId: string; audioBlob: Uint8Array }) => {
      if (!actor) throw new Error('Actor not available');
      const { ExternalBlob } = await import('../backend');
      // Ensure we have a proper ArrayBuffer (not SharedArrayBuffer) for ExternalBlob.fromBytes
      const safeBytes = new Uint8Array(audioBlob.buffer.slice(0)) as Uint8Array<ArrayBuffer>;
      const blob = ExternalBlob.fromBytes(safeBytes);
      return actor.saveAudioBlob(storyId, blob);
    },
  });
}

export function useLikeStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStories'] });
      queryClient.invalidateQueries({ queryKey: ['trendingStories'] });
      queryClient.invalidateQueries({ queryKey: ['userLikedStories'] });
      queryClient.invalidateQueries({ queryKey: ['storiesByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['searchStories'] });
    },
  });
}

export function useUnlikeStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikeStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStories'] });
      queryClient.invalidateQueries({ queryKey: ['trendingStories'] });
      queryClient.invalidateQueries({ queryKey: ['userLikedStories'] });
      queryClient.invalidateQueries({ queryKey: ['storiesByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['searchStories'] });
    },
  });
}

export function useSaveStoryToLibrary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveStoryToLibrary(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSavedStories'] });
    },
  });
}

export function useUnsaveStoryFromLibrary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unsaveStoryFromLibrary(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSavedStories'] });
    },
  });
}

export function useIncrementStoryViews() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementStoryViews(storyId);
    },
  });
}

// ── AI Story Generation ──────────────────────────────────────────────────────

export function useGenerateAIDraftStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      genre,
      tone,
      prompt,
    }: {
      id: string;
      genre: string;
      tone: string;
      prompt: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateAIDraftStory(id, genre, tone, prompt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draftStory'] });
    },
  });
}

export function useGetDraftStory(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StoryDraft | null>({
    queryKey: ['draftStory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDraftStory();
    },
    enabled: !!actor && !actorFetching && !!identity && enabled,
    retry: false,
  });
}
