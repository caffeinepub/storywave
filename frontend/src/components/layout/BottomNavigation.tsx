import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Search, PlusCircle, Library, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/create', icon: PlusCircle, label: 'Create' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNavigation() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to || (to === '/home' && currentPath === '/');
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all',
                isActive && 'gradient-bg-subtle'
              )}>
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
