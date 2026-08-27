'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api
        .get('/users/profile')
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          logout();
        });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, [setUser, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
