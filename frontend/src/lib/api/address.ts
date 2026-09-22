import { apiClient } from '../api-client';

// ============================================================================
// VIETNAM ADMINISTRATIVE REGIONS (Tỉnh/Thành, Quận/Huyện, Phường/Xã)
// ============================================================================

export interface Province {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
}

export interface District {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  district_code: number;
}

// In-memory cache for speed and stability
const provinceCache: {
  provinces: Province[] | null;
  districts: Map<number, District[]>;
  wards: Map<number, Ward[]>;
} = {
  provinces: null,
  districts: new Map(),
  wards: new Map(),
};

// Fallback provinces list in case external API fails or is unreachable
const FALLBACK_PROVINCES: Province[] = [
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 74, name: 'Tỉnh Bình Dương' },
  { code: 75, name: 'Tỉnh Đồng Nai' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 49, name: 'Tỉnh Quảng Nam' },
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 80, name: 'Tỉnh Long An' },
  { code: 82, name: 'Tỉnh Tiền Giang' },
  { code: 89, name: 'Tỉnh An Giang' },
  { code: 86, name: 'Tỉnh Vĩnh Long' },
  { code: 66, name: 'Tỉnh Đắk Lắk' },
];

export const vietnamAddressApi = {
  /**
   * Lấy danh sách 63 Tỉnh/Thành phố trực thuộc Trung ương của Việt Nam
   */
  getProvinces: async (): Promise<Province[]> => {
    if (provinceCache.provinces && provinceCache.provinces.length > 0) {
      return provinceCache.provinces;
    }

    try {
      const res = await fetch('https://provinces.open-api.vn/api/p/');
      if (!res.ok) throw new Error(`Fetch provinces failed: ${res.status}`);
      const data: Province[] = await res.json();
      // Sắp xếp đưa TP.HCM và Hà Nội lên đầu cho tiện trải nghiệm đặt hàng đồ ăn
      const sorted = [...data].sort((a, b) => {
        if (a.code === 79) return -1;
        if (b.code === 79) return 1;
        if (a.code === 1) return -1;
        if (b.code === 1) return 1;
        return a.name.localeCompare(b.name, 'vi');
      });
      provinceCache.provinces = sorted;
      return sorted;
    } catch (err) {
      console.warn('Cannot fetch from provinces.open-api.vn, using fallback list:', err);
      return FALLBACK_PROVINCES;
    }
  },

  /**
   * Lấy danh sách Quận/Huyện/Thị xã theo mã Tỉnh/Thành
   */
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    if (provinceCache.districts.has(provinceCode)) {
      return provinceCache.districts.get(provinceCode)!;
    }

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      if (!res.ok) throw new Error(`Fetch districts failed: ${res.status}`);
      const data = await res.json();
      const districts: District[] = data.districts || [];
      provinceCache.districts.set(provinceCode, districts);
      return districts;
    } catch (err) {
      console.warn(`Cannot fetch districts for province ${provinceCode}:`, err);
      return [];
    }
  },

  /**
   * Lấy danh sách Phường/Xã/Thị trấn theo mã Quận/Huyện
   */
  getWards: async (districtCode: number): Promise<Ward[]> => {
    if (provinceCache.wards.has(districtCode)) {
      return provinceCache.wards.get(districtCode)!;
    }

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      if (!res.ok) throw new Error(`Fetch wards failed: ${res.status}`);
      const data = await res.json();
      const wards: Ward[] = data.wards || [];
      provinceCache.wards.set(districtCode, wards);
      return wards;
    } catch (err) {
      console.warn(`Cannot fetch wards for district ${districtCode}:`, err);
      return [];
    }
  },
};

// ============================================================================
// USER SAVED ADDRESSES (CRUD Database)
// ============================================================================

export interface UserAddress {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
  fullAddress: string;
  createdAt: string;
}

export interface CreateAddressInput {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault?: boolean;
}

const LOCAL_STORAGE_KEY = 'hinet_local_user_addresses';

const getLocalAddresses = (): UserAddress[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalAddresses = (addresses: UserAddress[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // ignore
  }
};

export const userAddressApi = {
  /**
   * Lấy danh sách tất cả địa chỉ của người dùng hiện tại
   */
  getAll: async (): Promise<UserAddress[]> => {
    try {
      const result = await apiClient.get<UserAddress[]>('/user-addresses');
      if (Array.isArray(result)) {
        // Kiểm tra xem có địa chỉ tạm thời nào trong localStorage cần đồng bộ lên DB không
        const local = getLocalAddresses();
        const pendingSync = local.filter((a) => a.id && a.id.startsWith('addr_'));
        if (pendingSync.length > 0) {
          for (const item of pendingSync) {
            try {
              await apiClient.post<UserAddress>('/user-addresses', {
                recipientName: item.recipientName,
                phoneNumber: item.phoneNumber,
                streetAddress: item.streetAddress,
                ward: item.ward,
                district: item.district,
                city: item.city,
                isDefault: item.isDefault,
              });
            } catch {
              // Bỏ qua lỗi từng item
            }
          }
          // Lấy lại danh sách đầy đủ từ DB sau khi đã đồng bộ
          const refreshed = await apiClient.get<UserAddress[]>('/user-addresses');
          setLocalAddresses(refreshed);
          return refreshed;
        }

        setLocalAddresses(result);
        return result;
      }
      return getLocalAddresses();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.warn('[userAddressApi] Backend endpoint /user-addresses chưa khả dụng (404). Sử dụng dữ liệu lưu trữ local.');
        return getLocalAddresses();
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết một địa chỉ theo ID
   */
  getById: async (id: string): Promise<UserAddress> => {
    try {
      return await apiClient.get<UserAddress>(`/user-addresses/${id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const found = getLocalAddresses().find((a) => a.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  /**
   * Thêm địa chỉ mới
   */
  create: async (data: CreateAddressInput): Promise<UserAddress> => {
    try {
      const created = await apiClient.post<UserAddress>('/user-addresses', data);
      const current = getLocalAddresses().filter((a) => a.id !== created.id);
      if (created.isDefault) {
        current.forEach((a) => (a.isDefault = false));
      }
      setLocalAddresses([created, ...current]);
      return created;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.warn('[userAddressApi] Backend chưa reload controller mới (404). Lưu địa chỉ vào LocalStorage để người dùng tiếp tục thao tác.');
        const current = getLocalAddresses();
        const fullAddress = [data.streetAddress, data.ward, data.district, data.city]
          .filter(Boolean)
          .join(', ');

        const isFirst = current.length === 0;
        const willBeDefault = data.isDefault ?? isFirst;

        if (willBeDefault) {
          current.forEach((a) => (a.isDefault = false));
        }

        const newAddr: UserAddress = {
          id: 'addr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          userId: 'local-user',
          recipientName: data.recipientName,
          phoneNumber: data.phoneNumber,
          streetAddress: data.streetAddress,
          ward: data.ward,
          district: data.district,
          city: data.city,
          isDefault: willBeDefault,
          fullAddress,
          createdAt: new Date().toISOString(),
        };

        current.unshift(newAddr);
        setLocalAddresses(current);
        return newAddr;
      }
      throw err;
    }
  },

  /**
   * Cập nhật địa chỉ hiện có
   */
  update: async (id: string, data: UpdateAddressInput): Promise<UserAddress> => {
    try {
      const updated = await apiClient.put<UserAddress>(`/user-addresses/${id}`, data);
      const current = getLocalAddresses();
      const idx = current.findIndex((a) => a.id === id);
      if (idx !== -1) {
        if (updated.isDefault) {
          current.forEach((a) => (a.isDefault = false));
        }
        current[idx] = updated;
        setLocalAddresses(current);
      }
      return updated;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const current = getLocalAddresses();
        const idx = current.findIndex((a) => a.id === id);
        if (idx !== -1) {
          const fullAddress = [data.streetAddress, data.ward, data.district, data.city]
            .filter(Boolean)
            .join(', ');

          if (data.isDefault) {
            current.forEach((a) => (a.isDefault = false));
          }

          const updatedAddr: UserAddress = {
            ...current[idx],
            recipientName: data.recipientName,
            phoneNumber: data.phoneNumber,
            streetAddress: data.streetAddress,
            ward: data.ward,
            district: data.district,
            city: data.city,
            isDefault: data.isDefault ?? current[idx].isDefault,
            fullAddress,
          };
          current[idx] = updatedAddr;
          setLocalAddresses(current);
          return updatedAddr;
        }
      }
      throw err;
    }
  },

  /**
   * Xóa địa chỉ
   */
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete<{ message: string }>(`/user-addresses/${id}`);
      const filtered = getLocalAddresses().filter((a) => a.id !== id);
      setLocalAddresses(filtered);
      return res;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const current = getLocalAddresses();
        const target = current.find((a) => a.id === id);
        const filtered = current.filter((a) => a.id !== id);
        if (target?.isDefault && filtered.length > 0) {
          filtered[0].isDefault = true;
        }
        setLocalAddresses(filtered);
        return { message: 'Đã xóa địa chỉ thành công (Local)' };
      }
      throw err;
    }
  },

  /**
   * Đặt địa chỉ làm mặc định
   */
  setDefault: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.patch<{ message: string }>(`/user-addresses/${id}/default`);
      const current = getLocalAddresses();
      current.forEach((a) => (a.isDefault = a.id === id));
      setLocalAddresses(current);
      return res;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const current = getLocalAddresses();
        current.forEach((a) => (a.isDefault = a.id === id));
        setLocalAddresses(current);
        return { message: 'Đã đặt địa chỉ mặc định thành công (Local)' };
      }
      throw err;
    }
  },
};
