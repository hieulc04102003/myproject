'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { adminUsersApi } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';
import type { User } from '@/types/user';
import Link from 'next/link';

// ─── Debounce hook ──────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  'from-orange-500 to-amber-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-violet-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getRoleBadge(role: string) {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return {
        label: 'Admin',
        className: 'bg-purple-100 text-purple-800 border border-purple-200',
        icon: <Shield size={11} className="text-purple-600" />,
      };
    case 'STAFF':
      return {
        label: 'Staff',
        className: 'bg-sky-100 text-sky-800 border border-sky-200',
        icon: <UserCheck size={11} className="text-sky-600" />,
      };
    default:
      return {
        label: 'Customer',
        className: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: null,
      };
  }
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-200 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200" />
            <div className="h-2.5 w-24 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3 w-28 rounded bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3 w-20 rounded bg-gray-200" />
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="ml-auto h-7 w-16 rounded-lg bg-gray-200" />
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState<string>(''); // '' | 'true' | 'false'
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset về trang 1 khi filter thay đổi
  const resetPage = useCallback(() => setPage(1), []);
  useEffect(resetPage, [debouncedSearch, role, isActive, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, pageSize, role, isActive, debouncedSearch],
    queryFn: () =>
      adminUsersApi.getAll({
        page,
        pageSize,
        role: role || undefined,
        search: debouncedSearch || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true',
      }),
  });

  // Stats từ data hiện tại (full count từ server)
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  const hasActiveFilters = !!(role || isActive || debouncedSearch);

  const clearFilters = () => {
    setRole('');
    setIsActive('');
    setSearchInput('');
  };

  // Stat cards — dùng 3 queries nhỏ để lấy count thực
  const { data: allData } = useQuery({
    queryKey: ['admin', 'users', 'stat', 'all'],
    queryFn: () => adminUsersApi.getAll({ page: 1, pageSize: 1 }),
    staleTime: 60_000,
  });
  const { data: activeData } = useQuery({
    queryKey: ['admin', 'users', 'stat', 'active'],
    queryFn: () => adminUsersApi.getAll({ page: 1, pageSize: 1, isActive: true }),
    staleTime: 60_000,
  });
  const { data: adminData } = useQuery({
    queryKey: ['admin', 'users', 'stat', 'admins'],
    queryFn: () => adminUsersApi.getAll({ page: 1, pageSize: 1, role: 'ADMIN' }),
    staleTime: 60_000,
  });

  const stats = [
    {
      label: 'Tổng người dùng',
      value: allData?.totalCount ?? '—',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Đang hoạt động',
      value: activeData?.totalCount ?? '—',
      icon: UserCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Tạm khóa',
      value:
        allData?.totalCount !== undefined && activeData?.totalCount !== undefined
          ? allData.totalCount - activeData.totalCount
          : '—',
      icon: UserX,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      border: 'border-rose-100',
    },
    {
      label: 'Quản trị viên',
      value: adminData?.totalCount ?? '—',
      icon: Shield,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      border: 'border-purple-100',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Xem, tìm kiếm và lọc toàn bộ tài khoản trong hệ thống
          </p>
        </div>
      </div>

      {/* ── Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-2xl border ${s.border} bg-white px-4 py-3.5 shadow-xs`}
            >
              <div className="flex items-center gap-3">
                <div className={`${s.iconBg} ${s.iconColor} rounded-xl p-2.5`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  <p className="mt-0.5 text-xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1" style={{ minWidth: '200px' }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role filter */}
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-8 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="CUSTOMER">Customer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-8 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Tạm khóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X size={14} />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Result count */}
          {!isLoading && data && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <SlidersHorizontal size={13} />
              <span>
                {data.totalCount > 0 ? (
                  <>
                    Tìm thấy <strong className="text-gray-700">{data.totalCount}</strong> người dùng
                  </>
                ) : (
                  'Không có kết quả'
                )}
              </span>
            </div>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs font-medium text-gray-400">Đang lọc:</span>
            {debouncedSearch && (
              <FilterTag label={`Tìm: "${debouncedSearch}"`} onRemove={() => setSearchInput('')} />
            )}
            {role && (
              <FilterTag
                label={`Vai trò: ${role}`}
                onRemove={() => setRole('')}
              />
            )}
            {isActive !== '' && (
              <FilterTag
                label={isActive === 'true' ? 'Đang hoạt động' : 'Tạm khóa'}
                onRemove={() => setIsActive('')}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Người dùng
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Liên hệ
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Vai trò
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ngày tham gia
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: pageSize > 5 ? 6 : pageSize }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                  </td>
                </tr>
              ) : (
                data?.items.map((user: User) => (
                  <UserRow key={user.id} user={user} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={data?.totalCount ?? 0}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              pageSizeOptions={[10, 20, 50]}
              itemName="người dùng"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded hover:text-orange-900 transition-colors"
        aria-label="Xóa bộ lọc này"
      >
        <X size={11} />
      </button>
    </span>
  );
}

function UserRow({ user }: { user: User }) {
  const roleBadge = getRoleBadge(user.role);

  return (
    <tr className="group transition-colors hover:bg-orange-50/30">
      {/* User Info */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${getAvatarColor(user.id)} text-white text-sm font-bold flex items-center justify-center shadow-sm`}
          >
            {getInitials(user.fullName)}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-5 py-3.5">
        <div className="space-y-0.5">
          <p className="text-sm text-gray-700">{user.phoneNumber || '—'}</p>
          {user.email && (
            <p className="truncate text-xs text-gray-400 max-w-[180px]">{user.email}</p>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
          />
          {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge.className}`}
        >
          {roleBadge.icon}
          {roleBadge.label}
        </span>
      </td>

      {/* Join Date */}
      <td className="px-5 py-3.5">
        <p className="text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>
      </td>

      {/* Action */}
      <td className="px-5 py-3.5 text-right">
        <Link
          href={`/admin/users/${user.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all group-hover:border-gray-200 group-hover:bg-white group-hover:text-gray-800 hover:shadow-xs"
          title="Xem chi tiết"
        >
          <Eye size={13} />
          Chi tiết
        </Link>
      </td>
    </tr>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Users size={26} />
      </div>
      <p className="text-sm font-semibold text-gray-700">
        {hasFilters ? 'Không tìm thấy kết quả' : 'Chưa có người dùng nào'}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {hasFilters
          ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc bên trên.'
          : 'Người dùng sẽ xuất hiện ở đây khi họ đăng ký.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <X size={13} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
