/**
 * Root Layout - App-wide layout with providers
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Bánh Mì Sài Gòn - Nóng Giòn Ngon Tuyệt | Giao Nhanh 20 Phút',
  description: 'Bánh mì Sài Gòn chuẩn vị truyền thống. Rau sạch, pate tươi làm thủ công. Giao hàng nhanh 20 phút. Đặt ngay!',
  keywords: 'bánh mì, bánh mì Sài Gòn, đặt bánh mì online, giao bánh mì nhanh, bánh mì ngon',
  openGraph: {
    title: 'Bánh Mì Sài Gòn - Nóng Giòn Ngon Tuyệt',
    description: 'Chuẩn vị Sài Gòn, giao hàng nhanh 20 phút',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
