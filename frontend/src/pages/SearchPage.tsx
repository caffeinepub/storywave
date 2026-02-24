import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from '../components/search/SearchBar';
import CategoryFilter from '../components/search/CategoryFilter';
import StoryCard from '../components/story/StoryCard';
import { useGetAllStories, useGetTrendingStories, useSearchStories, useGetStoriesByCategory } from '../hooks/useQueries';
import { Category } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Search } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: allStories = [] } = useGetAllStories();
  const { data: trending = [], isLoading: loadingTrending } = useGetTrendingStories(10);
  const { data: searchResults = [], isLoading: loadingSearch } = useSearchStories(debouncedSearch);
  const { data: categoryResults = [], isLoading: loadingCategory } = useGetStoriesByCategory(selectedCategory);

  const displayStories = useMemo(() => {
    if (debouncedSearch.trim()) return searchResults;
    if (selectedCategory) return categoryResults;
    return allStories;
  }, [debouncedSearch, searchResults, selectedCategory, categoryResults, allStories]);

  const isLoading = debouncedSearch.trim() ? loadingSearch : selectedCategory ? loadingCategory : false;
  const showTrending = !debouncedSearch.trim() && !selectedCategory;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">Discover</h1>
        <p className="text-muted-foreground text-sm">Find your next favorite story</p>
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {showTrending && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Trending</h2>
          </div>
          {loadingTrending ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trending.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      )}

      {(debouncedSearch.trim() || selectedCategory) && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              {debouncedSearch.trim() ? `Results for "${debouncedSearch}"` : `${selectedCategory ? selectedCategory : ''} Stories`}
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : displayStories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-muted-foreground">No stories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      )}

      {!debouncedSearch.trim() && !selectedCategory && (
        <section>
          <h2 className="font-semibold text-foreground mb-4">All Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
