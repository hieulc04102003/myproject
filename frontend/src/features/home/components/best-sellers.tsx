'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Star, ShoppingBag, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { useFeaturedProducts } from '@/features/products/hooks/use-products';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { ProductCustomizeModal } from '@/features/products/components/product-customize-modal';

interface BestSellersProps {
  onProductCustomize?: (product: Product) => void;
}

export function BestSellers({ onProductCustomize }: BestSellersProps) {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts(4);
  const addItem = useCartStore((state) => state.addItem);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const handleOpenCustomize = (product: Product) => {
    if (onProductCustomize) {
      onProductCustomize(product);
    } else {
      setCustomizingProduct(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const hasRequiredOptions = product.optionGroups?.some((og) => og.isRequired);
    if (hasRequiredOptions) {
      handleOpenCustomize(product);
      return;
    }

    // Add base product directly
    addItem(product, [], 1);
  };

  if (!isLoading && featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full mb-2">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>Gợi ý không thể bỏ lỡ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Món Bán Chạy Nhất (Signature)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Những món bánh mì đặc sản làm nên danh tiếng của thương hiệu Bánh Mì Sài Gòn
            </p>
          </div>

          <Link
            href="#menu"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <span>Xem tất cả thực đơn</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-4 animate-pulse space-y-4">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            ))
          ) : (
            featuredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Product Card Top Image */}
                <Link
                  href={`/products/${product.id}`}
                  className="block relative h-52 overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <Image
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=500&q=80'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />

                  {/* Gradient bottom shadow for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      Top {idx + 1} Best Seller
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">
                      {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || 'Hương vị truyền thống thơm ngon, chuẩn vị Bánh Mì Sài Gòn.'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Giá niêm yết
                      </span>
                      <span className="text-lg font-black text-orange-600">
                        {formatCurrency(product.basePrice ?? product.price ?? 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {product.optionGroups && product.optionGroups.length > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenCustomize(product)}
                          className="bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white rounded-xl text-xs font-bold px-3 py-1.5 transition-colors border border-orange-200/80"
                        >
                          Tùy chọn
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-md shadow-orange-600/20"
                          title="Thêm nhanh vào giỏ"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customize Modal for Signature Dishes */}
      <ProductCustomizeModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />
    </section>
  );
}
