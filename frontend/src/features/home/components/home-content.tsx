'use client';

import { useState, useMemo } from 'react';
import { CategoryFilter } from './category-filter';
import { ProductGrid } from './product-grid';
import { useProducts, useCategories } from '../hooks/use-products';
import { ProductCustomizeModal } from '@/features/products/components/product-customize-modal';
import { Pagination } from '@/components/ui/pagination';
import type { Product } from '@/types/product';
import { Search, X, SlidersHorizontal, ArrowUpDown, Utensils } from 'lucide-react';

export function HomeContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'featured'>('default');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Fetch data
  const { data: productsData, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategoryId || undefined,
    search: searchQuery || undefined,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Reset page to 1 when search, category or sort changes
  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategoryId(catId);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    setPage(1);
  };

  // Sort products client-side for immediate responsiveness
  const sortedProducts = useMemo(() => {
    if (!productsData?.products) return [];
    const list = [...productsData.products];

    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => (a.basePrice ?? a.price ?? 0) - (b.basePrice ?? b.price ?? 0));
      case 'price_desc':
        return list.sort((a, b) => (b.basePrice ?? b.price ?? 0) - (a.basePrice ?? a.price ?? 0));
      case 'featured':
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      default:
        return list;
    }
  }, [productsData?.products, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedProducts.slice(startIndex, startIndex + pageSize);
  }, [sortedProducts, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const menuEl = document.getElementById('products');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="menu" className="space-y-6 scroll-mt-20">
      {/* Category Pills Slider */}
      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            isLoading={categoriesLoading}
          />
        </div>
      </div>

      {/* Control Bar: Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên món bánh mì, nước uống..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Count & Sort dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
          <span className="text-slate-500 font-medium">
            {productsLoading ? (
              'Đang tải món...'
            ) : (
              <>Tìm thấy <strong className="text-orange-600 font-bold">{sortedProducts.length}</strong> món</>
            )}
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="featured">Món nổi bật</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        isLoading={productsLoading}
        onProductCustomize={(product) => {
          setCustomizingProduct(product);
        }}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200/80">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={sortedProducts.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            itemName="món ăn"
          />
        </div>
      )}

      {/* Customize Modal for Customer Topping Selection */}
      <ProductCustomizeModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
