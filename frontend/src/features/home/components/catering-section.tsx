'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, PhoneCall, FileText, CheckCircle2, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CateringSection() {
  return (
    <section id="catering" className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
                alt="Đặt tiệc bánh mì doanh nghiệp"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Floating Stat Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-orange-400">200+ Doanh Nghiệp</p>
                    <p className="text-xs text-slate-300">Đã tin tưởng chọn dịch vụ ăn sáng & sự kiện</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Info Details */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dành Riêng Cho Khách Hàng Doanh Nghiệp</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              Giải Pháp Suất Ăn Doanh Nghiệp, Hội Thảo &amp; Sự Kiện
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Chúng tôi cung cấp các gói suất ăn bánh mì nóng giòn kết hợp cà phê / nước trái cây 
              dành riêng cho các buổi họp giao ban, hội nghị khách hàng, teabreak hoặc bữa sáng cố định cho nhân viên công ty.
            </p>

            {/* Benefit Bullets */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Chiết Khấu Đến 20%</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Áp dụng cho đơn hàng từ 30 phần trở lên</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <FileText className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Hóa Đơn VAT Điện Tử</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Xuất hóa đơn GTGT đầy đủ, nhanh chóng trong ngày</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Bao Bì Giấy Sang Trọng</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Đóng gói từng phần sạch đẹp, kèm khăn lạnh &amp; tăm</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Giao Đúng Giờ Hẹn</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cam kết bánh ra lò chuẩn bị đúng mốc giờ sự kiện</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                size="lg"
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-orange-600/30"
              >
                <a href="tel:1900xxxx" className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Hotline Tư Vấn: 1900 xxxx</span>
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/10 font-semibold h-12 px-6 rounded-2xl"
              >
                <Link href="/contact" className="flex items-center gap-2">
                  <span>Gửi Yêu Cầu Báo Giá</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
