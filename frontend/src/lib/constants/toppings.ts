import type { OptionGroup } from '@/types/product';

/**
 * Danh sách Topping & Tùy chọn chuẩn cho tiệm bánh mì / ẩm thực
 * Dùng khi sản phẩm chưa được gán OptionGroups cụ thể trong CSDL
 * Sử dụng định dạng UUID chuẩn để tương thích 100% với backend .NET
 */
export const DEFAULT_TOPPING_GROUPS: OptionGroup[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    name: 'Topping thêm ngon mê ly',
    selectionType: 'MULTIPLE',
    isRequired: false,
    minSelection: 0,
    maxSelection: 8,
    options: [
      { id: 'e1f2a3b4-0001-4000-8000-000000000001', name: 'Trứng ốp la lòng đào', priceModifier: 5000, isAvailable: true },
      { id: 'e1f2a3b4-0001-4000-8000-000000000002', name: 'Chả lụa bì truyền thống', priceModifier: 7000, isAvailable: true },
      { id: 'e1f2a3b4-0001-4000-8000-000000000003', name: 'Pate gan béo bùi', priceModifier: 5000, isAvailable: true },
      { id: 'e1f2a3b4-0001-4000-8000-000000000004', name: 'Phô mai bò cười béo ngậy', priceModifier: 7000, isAvailable: true },
      { id: 'e1f2a3b4-0001-4000-8000-000000000005', name: 'Thịt xá xíu đậm đà', priceModifier: 10000, isAvailable: true },
      { id: 'e1f2a3b4-0001-4000-8000-000000000006', name: 'Bơ tươi trứng gà thơm ngon', priceModifier: 3000, isAvailable: true },
    ],
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    name: 'Chọn mức độ cay',
    selectionType: 'SINGLE',
    isRequired: true,
    minSelection: 1,
    maxSelection: 1,
    options: [
      { id: 'e1f2a3b4-0002-4000-8000-000000000001', name: 'Không cay (không cho ớt)', priceModifier: 0, isAvailable: true },
      { id: 'e1f2a3b4-0002-4000-8000-000000000002', name: 'Cay vừa (ít ớt tươi)', priceModifier: 0, isAvailable: true },
      { id: 'e1f2a3b4-0002-4000-8000-000000000003', name: 'Cay nhiều (nhiều ớt hiểm)', priceModifier: 0, isAvailable: true },
    ],
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    name: 'Tùy chọn nước sốt & rau',
    selectionType: 'MULTIPLE',
    isRequired: false,
    minSelection: 0,
    maxSelection: 4,
    options: [
      { id: 'e1f2a3b4-0003-4000-8000-000000000001', name: 'Sốt Mayonnaise thơm béo', priceModifier: 0, isAvailable: true },
      { id: 'e1f2a3b4-0003-4000-8000-000000000002', name: 'Sốt tương ớt cay ngọt', priceModifier: 0, isAvailable: true },
      { id: 'e1f2a3b4-0003-4000-8000-000000000003', name: 'Thêm nước sốt nướng đặc biệt', priceModifier: 3000, isAvailable: true },
      { id: 'e1f2a3b4-0003-4000-8000-000000000004', name: 'Nhiều dưa leo & rau thơm', priceModifier: 0, isAvailable: true },
    ],
  },
];
