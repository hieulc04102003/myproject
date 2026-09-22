'use client';

import { Category } from '@/types/product';
import { cn } from '@/lib/utils';
import { Utensils, Sparkles } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  isLoading?: boolean;
}

// Map helper to assign fun and enterprise-grade category icons
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('bánh mì') || lower.includes('banh mi') || lower.includes('bread')) return '🥖';
  if (lower.includes('nước') || lower.includes('uống') || lower.includes('cà phê') || lower.includes('drink') || lower.includes('tea')) return '☕';
  if (lower.includes('combo') || lower.includes('set')) return '🍱';
  if (lower.includes('chảo') || lower.includes('bò') || lower.includes('trứng')) return '🍳';
  if (lower.includes('xôi') || lower.includes('rice')) return '🍚';
  if (lower.includes('topping') || lower.includes('thêm')) return '🧀';
  if (lower.includes('chay') || lower.includes('veg')) return '🥗';
  return '🍽️';
};

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading = false,
}: CategoryFilterProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-11 w-28 bg-slate-100 rounded-2xl flex-shrink-0 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none items-center">
      {/* All Categories Pill */}
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 border',
          selectedCategoryId === null
            ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20 scale-105'
            : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50'
        )}
      >
        <Sparkles className={cn('w-4 h-4', selectedCategoryId === null ? 'text-amber-300 fill-amber-300' : 'text-orange-500')} />
        <span>Tất cả thực đơn</span>
      </button>

      {/* Category Pills */}
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const icon = getCategoryIcon(category.name);

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 border',
              isSelected
                ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20 scale-105'
                : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50'
            )}
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
