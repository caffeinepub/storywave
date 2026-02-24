import React from 'react';
import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import BottomNavigation from './BottomNavigation';
import LoginButton from '../auth/LoginButton';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import FullScreenAudioPlayer from '../audio/FullScreenAudioPlayer';
import { usePlayer } from '../../context/PlayerContext';
import { Home, Search, PlusCircle, Library, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const DESKTOP_NAV = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/create', icon: PlusCircle, label: 'Create' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { currentStory, isPlayerOpen, closePlayer } = usePlayer();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed left-0 top-0 bottom-0 bg-surface-1 border-r border-border/50 z-30">
        <div className="p-5 border-b border-border/50">
          <Link to="/home" className="flex items-center gap-2">
            <img src="/assets/generated/storywave-logo.dim_256x256.png" alt="StoryWave" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-xl font-bold gradient-text">StoryWave</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {DESKTOP_NAV.map(({ to, icon: Icon, label }) => {
            const isActive = currentPath === to || (to === '/home' && currentPath === '/');
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                  isActive
                    ? 'gradient-bg-subtle text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <LoginButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 glass border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src="/assets/generated/storywave-logo.dim_256x256.png" alt="StoryWave" className="w-7 h-7 rounded-lg" />
            <span className="font-display text-lg font-bold gradient-text">StoryWave</span>
          </Link>
          <LoginButton />
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (mobile) */}
      <BottomNavigation />

      {/* Profile Setup Modal */}
      <ProfileSetupModal />

      {/* Full Screen Player */}
      {isPlayerOpen && currentStory && (
        <FullScreenAudioPlayer story={currentStory} onClose={closePlayer} />
      )}
    </div>
  );
}
