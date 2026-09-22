'use client';

/**
 * Reusable Pagination Component - Chuẩn Enterprise UI
 * Hỗ trợ số trang thông minh (Ellipsis), First/Last, Prev/Next, Page Size selector và Co giãn Mobile
 */

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemName?: string;
  showItemCount?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  itemName = 'kết quả',
  showItemCount = true,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  // Tính toán dải số trang với dấu ba chấm
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  const from = pageSize ? (currentPage - 1) * pageSize + 1 : 1;
  const to = pageSize && totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 select-none',
        className
      )}
    >
      {/* 1. Left side: Items count summary & Page size selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
        {showItemCount && totalItems !== undefined && (
          <div>
            {pageSize ? (
              <span>
                Hiển thị <strong className="text-slate-800">{from}</strong> -{' '}
                <strong className="text-slate-800">{to}</strong> trong{' '}
                <strong className="text-orange-600 font-bold">{totalItems}</strong> {itemName}
              </span>
            ) : (
              <span>
                Tổng cộng: <strong className="text-orange-600 font-bold">{totalItems}</strong> {itemName}
              </span>
            )}
          </div>
        )}

        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer transition-colors shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Right side: Pagination Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* Mobile View Summary */}
        <div className="sm:hidden flex items-center gap-2 text-xs font-semibold text-slate-600 mr-2">
          <span>Trang {currentPage} / {totalPages}</span>
        </div>

        {/* First Page (<<) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="Về trang đầu"
          title="Về trang đầu"
          className="hidden sm:flex h-8 w-8 rounded-xl items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page (<) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          title="Trang trước"
          className="h-8 px-2.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 text-xs font-medium text-slate-700 border border-slate-200 sm:border-transparent hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sm:hidden">Trước</span>
        </button>

        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="h-8 w-7 flex items-center justify-center text-xs text-slate-400 font-bold"
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-[32px] px-2 rounded-xl text-xs font-bold transition-all',
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page (>) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
          title="Trang sau"
          className="h-8 px-2.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 text-xs font-medium text-slate-700 border border-slate-200 sm:border-transparent hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="sm:hidden">Sau</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page (>>) */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Đến trang cuối"
          title="Đến trang cuối"
          className="hidden sm:flex h-8 w-8 rounded-xl items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
