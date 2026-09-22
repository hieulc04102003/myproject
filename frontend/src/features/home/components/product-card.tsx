'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Plus, Star, Flame, Check, SlidersHorizontal } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onCustomize?: (product: Product) => void;
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const hasOptions = product.optionGroups && product.optionGroups.length > 0;
  const hasRequiredOptions = hasOptions && product.optionGroups?.some((og) => og.isRequired);
  const displayPrice = product.basePrice ?? product.price ?? 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasRequiredOptions) {
      if (onCustomize) onCustomize(product);
      return;
    }

    // Quick add base product
    addItem(product, [], 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Image Container */}
      <Link 
        href={`/products/${product.id}`} 
        className="block relative h-52 sm:h-48 overflow-hidden bg-slate-100 cursor-pointer"
      >
        <Image
          src={product.imageUrl || 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=500&q=80'}
          alt={product.name}
          fill
          className={cn(
            'object-cover group-hover:scale-105 transition-transform duration-500',
            imageLoading ? 'blur-xs scale-102' : 'blur-0'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          onLoad={() => setImageLoading(false)}
        />

        {/* Soft Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top-left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3 fill-white" />
              Hot
            </span>
          )}
          {!product.isAvailable && (
            <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Tạm hết hàng
            </span>
          )}
        </div>

        {/* Top-right Rating */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-800">
            {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
          </span>
        </div>
      </Link>

      {/* Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'Bánh mì nóng giòn chuẩn vị Sài Gòn, nguyên liệu tươi mới mỗi ngày.'}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              Giá bán
            </span>
            <span className="text-base sm:text-lg font-black text-orange-600">
              {formatCurrency(displayPrice)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onCustomize && hasOptions && (
              <Button
                size="sm"
                onClick={handleCustomize}
                className="bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white rounded-xl text-xs font-bold px-2.5 py-1.5 transition-colors border border-orange-200/80 flex items-center gap-1 shadow-2xs"
                title="Tùy chọn món & thêm topping"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Topping</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleQuickAdd}
              className={cn(
                'rounded-xl h-8 w-8 p-0 flex items-center justify-center transition-all shadow-md',
                justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 active:scale-95'
              )}
              title="Thêm nhanh vào giỏ hàng"
            >
              {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-4 animate-pulse">
      <div className="h-48 bg-slate-100 rounded-2xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded-md w-3/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className="h-5 bg-slate-100 rounded-md w-20" />
        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
