import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreateStoryForm, { type CreateStoryInitialValues } from '../components/story/CreateStoryForm';
import AIStoryGeneratorForm from '../components/story/AIStoryGeneratorForm';
import LoginButton from '../components/auth/LoginButton';
import { Mic, Sparkles, PenLine } from 'lucide-react';
import type { AIGeneratedStory } from '../backend';
import { Category } from '../backend';

type Mode = 'manual' | 'ai';

const GENRE_TO_CATEGORY: Record<string, Category> = {
  horror: Category.horror,
  romance: Category.romance,
  motivation: Category.motivation,
  comedy: Category.comedy,
  scifi: Category.scifi,
  realLife: Category.realLife,
};

export default function CreateStoryPage() {
  const { identity } = useInternetIdentity();
  const [mode, setMode] = useState<Mode>('manual');
  const [initialValues, setInitialValues] = useState<CreateStoryInitialValues | undefined>(undefined);

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">Share Your Story</h2>
          <p className="text-muted-foreground">Log in to create and publish your audio stories.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  const handleAIGenerated = (story: AIGeneratedStory) => {
    const category = GENRE_TO_CATEGORY[story.genre] ?? undefined;
    setInitialValues({
      title: story.title,
      description: story.description,
      narrativeBody: story.body,
      category,
    });
    setMode('manual');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Create Story</h1>
        <p className="text-muted-foreground text-sm mt-1">Share your voice with the world</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-surface-3 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'manual'
              ? 'gradient-bg text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenLine className="w-4 h-4" />
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'ai'
              ? 'gradient-bg text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Generate
        </button>
      </div>

      {/* AI pre-fill notice */}
      {mode === 'manual' && initialValues && (
        <div className="mb-5 flex items-start gap-3 p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Story pre-filled by AI</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Review and edit the fields below, then publish when ready.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInitialValues(undefined)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {mode === 'ai' ? (
        <AIStoryGeneratorForm onGenerated={handleAIGenerated} />
      ) : (
        <CreateStoryForm initialValues={initialValues} />
      )}
    </div>
  );
}
