'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-orange-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
            <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <ShoppingBag className="h-20 w-20 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700">Giỏ hàng trống</h2>
            <p className="text-gray-500">Hãy thêm món ăn vào giỏ hàng!</p>
            <Link href="/homepage">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Xem thực đơn
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                  {/* Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=200&q=60'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.selectedOptions.map((o) => o.option.name).join(' · ')}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-amber-700 italic mt-0.5">
                        Ghi chú: {item.note}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Đơn giá: {formatCurrency(item.product.basePrice)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-orange-600">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Tóm tắt đơn hàng</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} món)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600 text-lg">{formatCurrency(subtotal)}</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base font-semibold">
                    Đặt hàng ngay
                  </Button>
                </Link>

                <Link href="/homepage" className="block text-center text-sm text-gray-500 hover:text-orange-600">
                  ← Tiếp tục mua hàng
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
