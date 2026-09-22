'use client';

/**
 * Search Bar Component - Debounced search input
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Tìm món ăn...' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search function
  const debouncedSearch = debounce((...args: unknown[]) => {
    onSearch(args[0] as string);
  }, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
