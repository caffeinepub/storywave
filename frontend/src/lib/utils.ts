import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(count: bigint | number): string {
  const n = typeof count === 'bigint' ? Number(count) : count;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function categoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    [Category.horror]: 'Horror',
    [Category.romance]: 'Romance',
    [Category.motivation]: 'Motivation',
    [Category.comedy]: 'Comedy',
    [Category.scifi]: 'Sci-Fi',
    [Category.realLife]: 'Real Life',
  };
  return labels[category] ?? category;
}

export function categoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    [Category.horror]: 'bg-red-900/40 text-red-300 border-red-800/50',
    [Category.romance]: 'bg-pink-900/40 text-pink-300 border-pink-800/50',
    [Category.motivation]: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
    [Category.comedy]: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50',
    [Category.scifi]: 'bg-cyan-900/40 text-cyan-300 border-cyan-800/50',
    [Category.realLife]: 'bg-green-900/40 text-green-300 border-green-800/50',
  };
  return colors[category] ?? 'bg-secondary text-secondary-foreground';
}

export function generateStoryId(): string {
  return `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
