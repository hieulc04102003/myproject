'use client';

/**
 * SignalR client - cập nhật trạng thái đơn hàng theo thời gian thực.
 * URL hub: {API_ORIGIN}/hubs/order-status (JWT gắn qua accessTokenFactory).
 */

import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';

export interface OrderStatusChangedPayload {
  orderCode: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Hook lắng nghe sự kiện OrderStatusChanged từ server.
 * @param onStatusChanged callback khi nhận sự kiện
 * @param enabled chỉ kích hoạt khi có giá trị truthy (vd: user đã đăng nhập)
 */
export function useOrderStatusHub(
  onStatusChanged: (payload: OrderStatusChangedPayload) => void,
  enabled: boolean = true
) {
  // giữ callback mới nhất mà không cần đưa vào deps
  const handlerRef = useRef(onStatusChanged);
  handlerRef.current = onStatusChanged;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let connection: signalR.HubConnection | null = null;
    let stopped = false;

    const start = async () => {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_ORIGIN}/hubs/order-status`, {
          accessTokenFactory: () => getAccessToken() ?? '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('OrderStatusChanged', (payload: OrderStatusChangedPayload) => {
        handlerRef.current(payload);
      });

      try {
        await connection.start();
      } catch {
        // Thử lại sau 5s nếu server chưa sẵn sàng
        if (!stopped) setTimeout(() => { if (!stopped) void start(); }, 5000);
      }
    };

    void start();

    return () => {
      stopped = true;
      void connection?.stop();
    };
  }, [enabled]);
}
