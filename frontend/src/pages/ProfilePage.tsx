import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUserStories } from '../hooks/useQueries';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import LoginButton from '../components/auth/LoginButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const principal = identity?.getPrincipal().toString();
  const { data: myStories = [] } = useGetUserStories(principal);

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">Your Profile</h2>
          <p className="text-muted-foreground">Log in to view and edit your profile.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="w-20 h-20 border-2 border-primary/30">
          <AvatarImage src={profile?.profilePictureUrl} alt={profile?.username} />
          <AvatarFallback className="gradient-bg text-white text-2xl font-bold">
            {profile?.username?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground">{profile?.username ?? 'Anonymous'}</h2>
          {profile?.bio && <p className="text-muted-foreground text-sm mt-1 max-w-xs">{profile.bio}</p>}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{myStories.length} {myStories.length === 1 ? 'story' : 'stories'} published</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Edit Profile</h3>
        {profile && <ProfileEditForm profile={profile} />}
      </div>
    </div>
  );
}
