import React from 'react';
import { Category } from '../../backend';
import { categoryLabel, cn } from '../../lib/utils';

const CATEGORIES = [
  Category.horror,
  Category.romance,
  Category.motivation,
  Category.comedy,
  Category.scifi,
  Category.realLife,
];

interface CategoryFilterProps {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium',
          selected === null
            ? 'gradient-bg text-white border-transparent'
            : 'bg-surface-2 text-muted-foreground border-border hover:text-foreground'
        )}
      >
        All
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(selected === cat ? null : cat)}
          className={cn(
            'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium',
            selected === cat
              ? 'gradient-bg text-white border-transparent'
              : 'bg-surface-2 text-muted-foreground border-border hover:text-foreground'
          )}
        >
          {categoryLabel(cat)}
        </button>
      ))}
    </div>
  );
}
