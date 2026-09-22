'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Award, 
  Store, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Coffee
} from 'lucide-react';

interface Slide {
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  titleStart: string;
  titleHighlight: string;
  titleEnd: string;
  description: string;
  image: string;
  priceTag?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const slides: Slide[] = [
  {
    badge: 'Đang mở cửa • Giao hàng nóng giòn trong 20 phút',
    badgeIcon: Clock,
    titleStart: 'Bánh Mì Sài Gòn',
    titleHighlight: 'Hương Vị Gia Truyền',
    titleEnd: 'Nóng Giòn Chuẩn Vị',
    description: 'Vỏ bánh nướng mới mỗi 30 phút, ruột xốp mềm. Hòa quyện cùng pate thủ công thơm béo và rau sạch chuẩn VietGAP mỗi ngày.',
    image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=900&q=85',
    priceTag: 'Chỉ từ 25.000đ',
    primaryCtaText: 'Đặt Món Giao Ngay',
    primaryCtaLink: '#menu',
    secondaryCtaText: 'Khám Phá Thực Đơn',
    secondaryCtaLink: '#menu',
  },
  {
    badge: 'Combo Bữa Sáng Năng Lượng • Tiết Kiệm 25%',
    badgeIcon: Coffee,
    titleStart: 'Khởi Đầu Ngày Mới Với',
    titleHighlight: 'Combo Bánh Mì &',
    titleEnd: 'Cà Phê Phin Đậm Đà',
    description: '1 Ổ Bánh mì đặc biệt + 1 Cà phê phin Robusta Tây Nguyên thơm nồng. Bữa sáng hoàn hảo cho dân văn phòng và học sinh, sinh viên.',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&q=85',
    priceTag: 'Combo chỉ 45.000đ',
    primaryCtaText: 'Đặt Combo Bữa Sáng',
    primaryCtaLink: '#menu',
    secondaryCtaText: 'Xem Tất Cả Combo',
    secondaryCtaLink: '#menu',
  },
  {
    badge: 'Dành Cho Doanh Nghiệp • Sự Kiện & Hội Nghị',
    badgeIcon: Award,
    titleStart: 'Giải Pháp Đặt Tiệc',
    titleHighlight: 'Suất Ăn Doanh Nghiệp',
    titleEnd: 'Chiết Khấu Đến 20%',
    description: 'Phục vụ hội thảo, sự kiện, bữa sáng công ty từ 20 đến 1.000 phần. Đóng gói hộp giấy cao cấp, xuất hóa đơn VAT điện tử nhanh chóng.',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=900&q=85',
    priceTag: 'Chiết khấu đến 20%',
    primaryCtaText: 'Xem Dịch Vụ Doanh Nghiệp',
    primaryCtaLink: '#catering',
    secondaryCtaText: 'Tư Vấn Hotline',
    secondaryCtaLink: 'tel:1900xxxx',
  },
];

const stats = [
  { value: '15+', label: 'Chi nhánh phục vụ' },
  { value: '20 Phút', label: 'Cam kết giao nóng' },
  { value: '50.000+', label: 'Đơn hàng mỗi tháng' },
  { value: '4.9 ⭐', label: 'Đánh giá hài lòng' },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="relative bg-gradient-to-b from-orange-50/60 via-amber-50/30 to-white overflow-hidden border-b border-orange-100/60">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-6 z-10 text-left">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xs border border-orange-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
              </span>
              <BadgeIcon className="h-4 w-4 text-orange-600" />
              <span>{slide.badge}</span>
            </div>

            {/* Headline with Brand Hierarchy */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {slide.titleStart}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                {slide.titleHighlight}
              </span>{' '}
              <span className="block">{slide.titleEnd}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                size="lg" 
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-orange-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <Link href={slide.primaryCtaLink} className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>{slide.primaryCtaText}</span>
                </Link>
              </Button>

              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-slate-200 hover:bg-slate-100/80 text-slate-800 font-semibold h-12 px-6 rounded-2xl"
              >
                <Link href={slide.secondaryCtaLink} className="flex items-center gap-2">
                  <span>{slide.secondaryCtaText}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              </Button>
            </div>

            {/* Corporate Value Props */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
              {stats.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual & Carousel */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[340px] sm:h-[420px] lg:h-[460px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
              <Image
                src={slide.image}
                alt={slide.titleHighlight}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

              {/* Floating Price / Offer Tag */}
              {slide.priceTag && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600 fill-orange-500 animate-pulse" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    {slide.priceTag}
                  </span>
                </div>
              )}

              {/* Bottom Tag */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 text-white border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-xs">
                    BM
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Chuẩn Vị Bánh Mì Sài Gòn</p>
                    <p className="text-[10px] text-slate-300">Nướng mới liên tục mỗi 30 phút</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-orange-500' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      title={`Chuyển đến banner ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                title="Banner trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                title="Banner kế tiếp"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
