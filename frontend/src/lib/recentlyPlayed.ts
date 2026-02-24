const STORAGE_KEY = 'storywave_recently_played';
const MAX_ITEMS = 20;

export function getRecentlyPlayedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(storyId: string): void {
  try {
    const current = getRecentlyPlayedIds();
    const filtered = current.filter(id => id !== storyId);
    const updated = [storyId, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
