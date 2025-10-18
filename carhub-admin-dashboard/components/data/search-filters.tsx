// components/data/search-filters.tsx
'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
  onClearFilters: () => void;
  searchPlaceholder?: string;
}

export function SearchFilters({
  searchValue,
  onSearchChange,
  filters,
  onClearFilters,
  searchPlaceholder = "Search...",
}: SearchFiltersProps) {
  const hasActiveFilters = searchValue || filters.some(filter => filter.value && filter.value !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filters Row */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {filter.label}
              </label>
              <Select
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={`All ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}