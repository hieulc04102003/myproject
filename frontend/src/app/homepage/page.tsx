/**
 * Homepage - Main landing page (Server Component)
 * Trang chủ "Bánh Mì Sài Gòn" chuẩn chuỗi F&B thực tế chuyên nghiệp
 */

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/features/home/components/hero-banner';
import { VoucherBar } from '@/features/home/components/voucher-bar';
import { BestSellers } from '@/features/home/components/best-sellers';
import { HomeContent } from '@/features/home/components/home-content';
import { WhyChooseUs } from '@/features/home/components/why-choose-us';
import { CateringSection } from '@/features/home/components/catering-section';
import { Testimonials } from '@/features/home/components/testimonials';
import { Gift, Sparkles, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-orange-500 selection:text-white">
      {/* 1. Header Navigation with Search, Cart and Account */}
      <Header />

      <main className="flex-1">
        {/* 2. Hero Banner Carousel & Brand Metrics */}
        <HeroBanner />

        {/* 3. Exclusive Daily Vouchers & Flash Deals */}
        <VoucherBar />

        {/* 4. Signature & Best Selling Dishes */}
        <BestSellers />

        {/* 5. Interactive Full Menu Catalog */}
        <section id="products" className="py-14 bg-slate-50 border-t border-slate-200/80">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thực Đơn Đa Dạng</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Khám Phá Hương Vị Sài Gòn
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Tự do tùy chọn thêm các loại nhân và topping hấp dẫn theo sở thích của riêng bạn
              </p>
            </div>

            {/* Menu Interactive Component (Filters + Search + Sort + Grid) */}
            <HomeContent />
          </div>
        </section>

        {/* 6. 4 Gold Standards / Brand Quality Heritage */}
        <WhyChooseUs />

        {/* 7. Corporate Catering & Event Services */}
        <CateringSection />

        {/* 8. Customer Testimonials & Reviews */}
        <Testimonials />

        {/* 9. Loyalty Club & Newsletter Banner */}
        <section className="py-16 bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 text-white relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
              <Gift className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Gia Nhập Câu Lạc Bộ Thành Viên
            </h2>
            <p className="text-sm sm:text-base text-orange-100 mb-8 max-w-xl mx-auto leading-relaxed">
              Tích lũy <strong>5% giá trị</strong> mỗi đơn hàng, nhận voucher <strong>50.000đ</strong> ngay khi tạo tài khoản và đặc quyền quà tặng sinh nhật bất ngờ.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link 
                href="/auth/register"
                className="w-full sm:w-auto bg-white text-orange-600 font-extrabold px-8 py-3.5 rounded-2xl hover:bg-orange-50 shadow-xl transition-all hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <span>Đăng Ký Nhận 50.000đ Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-orange-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Miễn phí 100% • Không gửi thư rác • Bảo mật thông tin</span>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Site Footer */}
      <Footer />
    </div>
  );
}
