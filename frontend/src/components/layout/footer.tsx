/**
 * Footer Component - Site footer with info and links
 */

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BM</span>
              </div>
              <div>
                <h3 className="font-bold text-white">Bánh Mì Sài Gòn</h3>
                <p className="text-xs">Nóng giòn - Ngon tuyệt</p>
              </div>
            </div>
            <p className="text-sm">
              Mang đến hương vị bánh mì Sài Gòn đặc trưng với nguyên liệu tươi ngon, 
              chất lượng đảm bảo.
            </p>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-semibold text-white mb-4">Giờ Mở Cửa</h4>
            <ul className="space-y-2 text-sm">
              <li>Thứ 2 - Thứ 6: 6:00 - 22:00</li>
              <li>Thứ 7 - Chủ nhật: 6:00 - 23:00</li>
              <li className="text-orange-400">⚡ Giao hàng 24/7</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liên Kết</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-orange-400 transition-colors">
                  Hồ sơ cá nhân
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-orange-400 transition-colors">
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-400 transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liên Hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-orange-400" />
                <div>
                  <p className="font-medium text-white">Hotline</p>
                  <a href="tel:1900xxxx" className="hover:text-orange-400">1900 xxxx</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-orange-400" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a href="mailto:info@banhmisaigon.vn" className="hover:text-orange-400">
                    info@banhmisaigon.vn
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-orange-400" />
                <div>
                  <p className="font-medium text-white">Địa chỉ</p>
                  <p>123 Nguyễn Huệ, Q.1, TP.HCM</p>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2024 Bánh Mì Sài Gòn. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
