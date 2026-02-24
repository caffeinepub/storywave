import React from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { PlayerProvider } from './context/PlayerContext';
import AppLayout from './components/layout/AppLayout';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CreateStoryPage from './pages/CreateStoryPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';

const rootRoute = createRootRoute({
  component: () => (
    <PlayerProvider>
      <AppLayout />
    </PlayerProvider>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OnboardingPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const createStoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreateStoryPage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: LibraryPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  onboardingRoute,
  homeRoute,
  searchRoute,
  createStoryRoute,
  libraryRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
