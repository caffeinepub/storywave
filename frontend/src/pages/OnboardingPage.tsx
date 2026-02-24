import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Waves, Play, Mic, BookOpen } from 'lucide-react';
import LoginButton from '../components/auth/LoginButton';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const handleExplore = () => {
    navigate({ to: '/home' });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/storywave-hero.dim_1200x600.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/storywave-logo.dim_256x256.png" alt="StoryWave" className="w-9 h-9 rounded-xl" />
            <span className="font-display text-xl font-bold gradient-text">StoryWave</span>
          </div>
          <LoginButton />
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-12">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Waves className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              <span className="gradient-text">Stories that</span>
              <br />
              <span className="text-foreground">move you</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Discover, create, and share audio stories. From horror to romance — every voice deserves to be heard.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Play, text: 'Listen to stories' },
              { icon: Mic, text: 'Share your voice' },
              { icon: BookOpen, text: 'Explore genres' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-surface-2/80 border border-border/50 rounded-full px-4 py-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {text}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            {!identity && (
              <div className="w-full">
                <LoginButton />
              </div>
            )}
            <Button
              onClick={handleExplore}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-surface-2"
            >
              Explore Stories
            </Button>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="h-24 relative">
          <svg viewBox="0 0 1440 96" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path
              d="M0,64 C360,96 720,32 1080,64 C1260,80 1380,72 1440,64 L1440,96 L0,96 Z"
              fill="oklch(0.12 0.015 280)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
