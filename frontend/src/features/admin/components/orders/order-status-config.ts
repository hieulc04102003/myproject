/**
 * Shared order status configuration dùng chung cho admin và staff.
 */

export interface StatusConfig {
  label: string;
  /** Tailwind classes cho badge display */
  badge: string;
  /** Tailwind classes cho select dropdown */
  select: string;
  dot: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    label: 'Chờ xác nhận',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    select: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    select: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    dot: 'bg-cyan-500',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    select: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
    select: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    select: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200',
    select: 'bg-rose-50 text-rose-700 border border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const STATUS_OPTIONS = [
  { value: 'PENDING',    label: 'Chờ xác nhận' },
  { value: 'CONFIRMED',  label: 'Đã xác nhận' },
  { value: 'PREPARING',  label: 'Đang chuẩn bị' },
  { value: 'SHIPPING',   label: 'Đang giao hàng' },
  { value: 'COMPLETED',  label: 'Hoàn thành' },
  { value: 'CANCELLED',  label: 'Đã hủy' },
];

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status?.toUpperCase()] ?? {
    label: status ?? 'Không rõ',
    badge: 'bg-gray-100 text-gray-600 border border-gray-200',
    select: 'bg-gray-100 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
  };
}
