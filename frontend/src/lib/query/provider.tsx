'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * TanStack Query (React Query) Provider
 * Wrap toàn bộ app để enable data fetching, caching, synchronization
 */

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Tạo QueryClient instance - mỗi client render tạo instance riêng
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian cache data trước khi refetch
            staleTime: 60 * 1000, // 1 minute
            // Tự động refetch khi window focus
            refetchOnWindowFocus: false,
            // Retry failed requests
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
