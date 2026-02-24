import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useSaveStory, useSaveAudioBlob } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Category } from '../../backend';
import { generateStoryId } from '../../lib/utils';
import { Upload, Loader2, CheckCircle, Music } from 'lucide-react';
import { ExternalBlob } from '../../backend';

const CATEGORIES = [
  { value: Category.horror, label: 'Horror' },
  { value: Category.romance, label: 'Romance' },
  { value: Category.motivation, label: 'Motivation' },
  { value: Category.comedy, label: 'Comedy' },
  { value: Category.scifi, label: 'Sci-Fi' },
  { value: Category.realLife, label: 'Real Life' },
];

export interface CreateStoryInitialValues {
  title?: string;
  description?: string;
  narrativeBody?: string;
  category?: Category;
}

interface CreateStoryFormProps {
  initialValues?: CreateStoryInitialValues;
}

export default function CreateStoryForm({ initialValues }: CreateStoryFormProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const saveStory = useSaveStory();
  const saveAudioBlob = useSaveAudioBlob();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [narrativeBody, setNarrativeBody] = useState(initialValues?.narrativeBody ?? '');
  const [category, setCategory] = useState<Category | ''>(initialValues?.category ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial values when they change (e.g. after AI generation)
  useEffect(() => {
    if (initialValues?.title !== undefined) setTitle(initialValues.title);
    if (initialValues?.description !== undefined) setDescription(initialValues.description);
    if (initialValues?.narrativeBody !== undefined) setNarrativeBody(initialValues.narrativeBody);
    if (initialValues?.category !== undefined) setCategory(initialValues.category);
  }, [initialValues]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !category || !title.trim()) return;

    setIsPublishing(true);
    try {
      const storyId = generateStoryId();
      const principal = identity.getPrincipal();
      const creatorName = profile?.username ?? 'Anonymous';

      // First save story metadata
      await saveStory.mutateAsync({
        id: storyId,
        title: title.trim(),
        description: description.trim(),
        category: category as Category,
        coverImageUrl: coverImageUrl.trim(),
        audioFilePath: '',
        creator: principal,
        creatorName,
        published: true,
        likeCount: BigInt(0),
        viewCount: BigInt(0),
        isSaved: false,
      });

      // Then upload audio if provided
      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Use ExternalBlob with progress tracking
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        void blob; // progress tracking side-effect only

        await saveAudioBlob.mutateAsync({ storyId, audioBlob: bytes });
        setUploadProgress(100);
      }

      setPublished(true);
      setTimeout(() => navigate({ to: '/home' }), 1500);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-400" />
        <h2 className="font-display text-2xl font-bold gradient-text">Story Published!</h2>
        <p className="text-muted-foreground">Redirecting to feed...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePublish} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-foreground font-medium">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Give your story a captivating title..."
          className="bg-surface-3 border-border focus:border-primary"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What's your story about?"
          rows={3}
          className="bg-surface-3 border-border focus:border-primary resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="narrative-body" className="text-foreground font-medium">
          Story Body
          {narrativeBody && (
            <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              AI Generated
            </span>
          )}
        </Label>
        <Textarea
          id="narrative-body"
          value={narrativeBody}
          onChange={e => setNarrativeBody(e.target.value)}
          placeholder="Write your full story here, or use AI Generate to create one automatically..."
          rows={8}
          className="bg-surface-3 border-border focus:border-primary resize-none text-sm leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground font-medium">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select value={category} onValueChange={v => setCategory(v as Category)}>
          <SelectTrigger className="bg-surface-3 border-border">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cover" className="text-foreground font-medium">Cover Image URL</Label>
        <Input
          id="cover"
          value={coverImageUrl}
          onChange={e => setCoverImageUrl(e.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="bg-surface-3 border-border focus:border-primary"
        />
        {coverImageUrl && (
          <div className="mt-2 rounded-xl overflow-hidden aspect-video w-full max-w-xs">
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground font-medium">Audio File</Label>
        <div
          className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {audioFile ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Music className="w-5 h-5" />
              <span className="text-sm font-medium">{audioFile.name}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Click to upload audio file</p>
              <p className="text-xs text-muted-foreground">MP3, WAV, OGG, M4A supported</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          className="hidden"
        />
        {isPublishing && audioFile && uploadProgress > 0 && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!title.trim() || !category || isPublishing}
        className="w-full gradient-bg text-white border-0 hover:opacity-90 font-semibold py-3 text-base"
      >
        {isPublishing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
        ) : (
          'Publish Story'
        )}
      </Button>
    </form>
  );
}
