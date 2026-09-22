'use client';

import { Star, Quote, CheckCircle2 } from 'lucide-react';

const reviews = [
  {
    name: 'Nguyễn Thị Mai Lan',
    role: 'Trưởng phòng Nhân sự - Vincom Center',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    comment: 'Công ty mình thường xuyên đặt 60-80 phần ăn sáng cho workshop thứ 2 hàng tuần. Bánh mì giao đến luôn nóng hổi giòn rụm, đóng gói rất lịch sự và có sẵn hóa đơn VAT.',
    rating: 5,
    tag: 'Khách hàng Doanh nghiệp',
  },
  {
    name: 'Trần Minh Hoàng',
    role: 'Kỹ sư phần mềm - Landmark 81',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    comment: 'Là người Sài Gòn mê bánh mì, mình cực kỳ ưng pate ở đây: béo thơm không bị tanh, vỏ bánh giòn vừa phải không bị vụn nát. Đặt qua web giao nhanh đúng 18 phút.',
    rating: 5,
    tag: 'Khách hàng thân thiết',
  },
  {
    name: 'Lê Thu Hương',
    role: 'Food Reviewer / Content Creator',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
    comment: 'Thịt nướng thơm mùi mật ong và than hoa rất đặc trưng. Rau ngò sạch sẽ, đồ chua cân bằng vị hoàn hảo. Một trong những thương hiệu bánh mì chỉn chu nhất hiện nay.',
    rating: 5,
    tag: 'Đánh giá ẩm thực',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full mb-3">
            <Star className="w-3.5 h-3.5 fill-orange-500" />
            <span>Trải Nghiệm Khách Hàng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Khách Hàng Nói Gì Về Chúng Tôi?
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Hơn 50.000 thực khách và 200+ doanh nghiệp đã tin yêu và đồng hành mỗi ngày
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
            >
              <div>
                {/* Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-orange-200" />
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span>{item.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.role}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.2 rounded-md">
                    {item.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
