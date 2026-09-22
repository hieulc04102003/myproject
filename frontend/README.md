# Bánh Mì Sài Gòn - Frontend

Frontend cho ứng dụng bán bánh mì trực tuyến, được xây dựng với Next.js 14 App Router, TypeScript, và Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (100% type-safe)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: 
  - Zustand (Cart state với localStorage persist)
  - TanStack Query (Server state & caching)
- **Icons**: Lucide React
- **HTTP Client**: Axios với interceptors

## 📁 Cấu trúc dự án

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── providers.tsx      # React Query provider
│   │   └── globals.css        # Global styles
│   │
│   ├── features/              # Feature-based architecture
│   │   ├── home/
│   │   │   ├── components/   # Homepage components
│   │   │   │   ├── hero-banner.tsx
│   │   │   │   ├── category-filter.tsx
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── product-grid.tsx
│   │   │   │   ├── search-bar.tsx
│   │   │   │   ├── why-choose-us.tsx
│   │   │   │   └── home-content.tsx
│   │   │   ├── hooks/        # React Query hooks
│   │   │   │   └── use-products.ts
│   │   │   └── api/          # API services
│   │   │       └── product-service.ts
│   │   │
│   │   └── ... (products, auth, orders features)
│   │
│   ├── components/            # Shared components
│   │   ├── ui/               # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   └── layout/           # Layout components
│   │       ├── header.tsx
│   │       └── footer.tsx
│   │
│   ├── lib/                   # Utilities
│   │   ├── utils.ts          # Helper functions
│   │   └── api-client.ts     # Axios client với JWT
│   │
│   ├── store/                 # Zustand stores
│   │   └── cart-store.ts     # Cart state management
│   │
│   └── types/                 # TypeScript types
│       ├── product.ts
│       ├── cart.ts
│       └── user.ts
│
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🎯 Key Features

### Homepage Sections

1. **Header**
   - Logo & branding
   - Search bar với debounce
   - Cart button với badge (số lượng + tổng tiền)
   - User menu

2. **Hero Banner**
   - Attractive CTA
   - Quality badges
   - Trust indicators

3. **Category Filter**
   - Pill tabs cho filtering
   - Responsive horizontal scroll

4. **Product Grid**
   - 2 cột mobile, 4 cột desktop
   - Product cards với image lazy loading
   - Quick add / Customize buttons
   - Skeleton loading states

5. **Why Choose Us**
   - 4 benefit cards
   - Icons và descriptions

6. **Footer**
   - Contact info
   - Opening hours
   - Social links

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Install dependencies
```bash
cd frontend
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for production
```bash
npm run build
npm run start
```

## 📦 State Management

### Cart State (Zustand)
```typescript
// Usage in components
import { useCartStore } from '@/store/cart-store';

function Component() {
  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.totalItems);
  
  // Add item to cart
  addItem(product, selectedOptions, quantity);
}
```

### Server State (TanStack Query)
```typescript
// Usage in components
import { useProducts } from '@/features/products/hooks/use-products';

function Component() {
  const { data, isLoading } = useProducts({ categoryId: '...' });
}
```

## 🎨 Styling

### Tailwind Classes
- Mobile-first responsive design
- Custom color palette (Orange theme)
- Utility classes

### Component Variants
```typescript
// Button variants
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
```

## 🔐 Type Safety

Tất cả components đều có TypeScript types đầy đủ:
- Product, Category interfaces
- CartItem, CartState
- No `any` types
- Strict mode enabled

## 📱 Responsive Design

- **Mobile**: 2-column grid, collapsible menu
- **Tablet**: 3-column grid
- **Desktop**: 4-column grid, full navigation

## 🚧 TODO

- [ ] Cart Drawer/Modal
- [ ] Product Customization Modal
- [ ] User Authentication
- [ ] Order placement flow
- [ ] Coupon application
- [ ] Product detail page
- [ ] Order history
- [ ] User profile

## 📄 License

MIT
