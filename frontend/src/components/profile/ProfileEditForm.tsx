import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { type UserProfile } from '../../backend';
import { Loader2, Check } from 'lucide-react';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSaved?: () => void;
}

export default function ProfileEditForm({ profile, onSaved }: ProfileEditFormProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile.profilePictureUrl);
  const [saved, setSaved] = useState(false);
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    setUsername(profile.username);
    setBio(profile.bio);
    setProfilePictureUrl(profile.profilePictureUrl);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    await saveProfile.mutateAsync({
      username: username.trim().slice(0, 20),
      bio: bio.trim().slice(0, 200),
      profilePictureUrl: profilePictureUrl.trim().slice(0, 200),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-username" className="text-foreground">Username</Label>
        <Input
          id="edit-username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={20}
          className="bg-surface-3 border-border"
          required
        />
        <p className="text-xs text-muted-foreground">{username.length}/20</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-bio" className="text-foreground">Bio</Label>
        <Textarea
          id="edit-bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          className="bg-surface-3 border-border resize-none"
        />
        <p className="text-xs text-muted-foreground">{bio.length}/200</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-pfp" className="text-foreground">Profile Picture URL</Label>
        <Input
          id="edit-pfp"
          value={profilePictureUrl}
          onChange={e => setProfilePictureUrl(e.target.value)}
          maxLength={200}
          className="bg-surface-3 border-border"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>
      <Button
        type="submit"
        disabled={!username.trim() || saveProfile.isPending}
        className="w-full gradient-bg text-white border-0 hover:opacity-90"
      >
        {saveProfile.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
        ) : saved ? (
          <><Check className="w-4 h-4 mr-2" />Saved!</>
        ) : (
          'Save Profile'
        )}
      </Button>
    </form>
  );
}
