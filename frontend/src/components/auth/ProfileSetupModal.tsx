import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2, Waves } from 'lucide-react';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    await saveProfile.mutateAsync({
      username: username.trim().slice(0, 20),
      bio: bio.trim().slice(0, 200),
      profilePictureUrl: profilePictureUrl.trim().slice(0, 200),
    });
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="bg-surface-2 border-border max-w-md mx-auto" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="w-5 h-5 text-primary" />
            <DialogTitle className="font-display text-xl gradient-text">Welcome to StoryWave</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Set up your profile to start sharing and discovering stories.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-foreground">Username <span className="text-destructive">*</span></Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. storyteller42"
              maxLength={20}
              className="bg-surface-3 border-border focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">{username.length}/20 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-foreground">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={200}
              rows={3}
              className="bg-surface-3 border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pfp" className="text-foreground">Profile Picture URL</Label>
            <Input
              id="pfp"
              value={profilePictureUrl}
              onChange={e => setProfilePictureUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              maxLength={200}
              className="bg-surface-3 border-border focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={!username.trim() || saveProfile.isPending}
            className="w-full gradient-bg text-white border-0 hover:opacity-90 font-semibold"
          >
            {saveProfile.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</>
            ) : (
              'Start Your Journey'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
