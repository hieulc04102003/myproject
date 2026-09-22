'use client';

import { Flame, ShieldCheck, Leaf, Truck, Award, CheckCircle2 } from 'lucide-react';

const standards = [
  {
    icon: Flame,
    title: 'Lò Nướng Tại Chỗ 30 Phút',
    subtitle: 'Vỏ giòn rụm - Ruột xốp thơm',
    description: 'Bánh mì luôn được nướng mới liên tục mỗi 30 phút tại các chi nhánh. Tuyệt đối không giao bánh nguội hoặc để qua ngày.',
    badge: 'Nóng giòn 100%',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Award,
    title: 'Pate Thủ Công & Thịt Nướng Than',
    subtitle: 'Công thức gia truyền hơn 10 năm',
    description: 'Pate gan heo tươi béo ngậy được chưng cất thủ công mỗi sáng. Thịt ướp mật ong nướng than hoa thơm lừng đậm đà.',
    badge: 'Vị gia truyền',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Leaf,
    title: '100% Rau Sạch Nông Trại VietGAP',
    subtitle: 'Tươi giòn an toàn tuyệt đối',
    description: 'Dưa leo, ngò rí, đồ chua muối chua ngọt tự nhiên và ớt hiểm được nhập mới trực tiếp từ nông trại Đà Lạt mỗi sáng sớm.',
    badge: 'Chuẩn VietGAP',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Truck,
    title: 'Giao Siêu Tốc Túi Giữ Nhiệt 20P',
    subtitle: 'Giữ trọn độ nóng đến tận tay',
    description: 'Đóng gói bao bì giấy Kraft thân thiện môi trường, vận chuyển bằng túi giữ nhiệt chuyên dụng. Hoàn tiền 100% nếu không hài lòng.',
    badge: 'Cam kết 20 phút',
    color: 'from-blue-500 to-indigo-500',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200/80">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chất Lượng Vượt Trội</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cam Kết 4 Chuẩn Vàng Thương Hiệu
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Mỗi ổ bánh mì trao đến tay bạn là sự kết tinh của tâm huyết người thợ lành nghề, 
            nguồn nguyên liệu tươi sạch và quy trình an toàn vệ sinh thực phẩm nghiêm ngặt nhất.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standards.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top Corner Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-orange-600">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Trust Sign */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đảm bảo 100% chất lượng</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
