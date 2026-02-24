import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGenerateAIDraftStory, useGetDraftStory } from '../../hooks/useQueries';
import { generateStoryId } from '../../lib/utils';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { AIGeneratedStory } from '../../backend';

const GENRES = [
  { value: 'horror', label: '🎃 Horror' },
  { value: 'romance', label: '💕 Romance' },
  { value: 'motivation', label: '🔥 Motivation' },
  { value: 'comedy', label: '😂 Comedy' },
  { value: 'scifi', label: '🚀 Sci-Fi' },
  { value: 'realLife', label: '🌍 Real Life' },
];

const TONES = [
  { value: 'dark', label: '🌑 Dark' },
  { value: 'uplifting', label: '☀️ Uplifting' },
  { value: 'funny', label: '😄 Funny' },
  { value: 'suspenseful', label: '😰 Suspenseful' },
  { value: 'inspirational', label: '✨ Inspirational' },
];

interface AIStoryGeneratorFormProps {
  onGenerated: (story: AIGeneratedStory) => void;
}

export default function AIStoryGeneratorForm({ onGenerated }: AIStoryGeneratorFormProps) {
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [prompt, setPrompt] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [fetchDraft, setFetchDraft] = useState(false);

  const generateMutation = useGenerateAIDraftStory();
  const draftQuery = useGetDraftStory(fetchDraft);

  // When draft is fetched successfully, pass it to parent
  React.useEffect(() => {
    if (draftQuery.data && fetchDraft) {
      onGenerated(draftQuery.data.draft);
      setFetchDraft(false);
    }
  }, [draftQuery.data, fetchDraft, onGenerated]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genre || !tone) return;

    const id = generateStoryId();
    setDraftId(id);
    setFetchDraft(false);

    try {
      await generateMutation.mutateAsync({ id, genre, tone, prompt });
      setFetchDraft(true);
    } catch {
      // error handled via mutation state
    }
  };

  const handleRetry = () => {
    generateMutation.reset();
    setFetchDraft(false);
    setDraftId(null);
  };

  const isLoading = generateMutation.isPending || (fetchDraft && draftQuery.isLoading);
  const hasError = generateMutation.isError || (fetchDraft && draftQuery.isError);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Story Generator</p>
          <p className="text-xs text-muted-foreground">Choose a genre and tone, then let AI craft your story</p>
        </div>
      </div>

      {/* Error state */}
      {hasError && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Story generation failed. Please try again.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="ml-2 h-7 px-2 text-destructive hover:text-destructive"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-surface-3">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Crafting your story...</span>
          </div>
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
        </div>
      )}

      {/* Form */}
      {!isLoading && (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">
              Genre <span className="text-destructive">*</span>
            </Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-surface-3 border-border">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {GENRES.map(g => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">
              Tone <span className="text-destructive">*</span>
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-surface-3 border-border">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {TONES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-prompt" className="text-foreground font-medium">
              Story Prompt{' '}
              <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe a scene, character, or idea to inspire the story... (e.g. 'A detective who can hear the thoughts of the dead')"
              rows={3}
              className="bg-surface-3 border-border focus:border-primary resize-none text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={!genre || !tone}
            className="w-full gradient-bg text-white border-0 hover:opacity-90 font-semibold py-3 text-base"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Story
          </Button>
        </form>
      )}
    </div>
  );
}
