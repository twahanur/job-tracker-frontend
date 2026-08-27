'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/auth-store';
import { Sparkles } from 'lucide-react';

function ContentSkeleton() {
  return (
    <div className="space-y-5 w-full animate-pulse">
      {/* Top Header Controls skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-white rounded-xl border border-[#EFF0F6] shadow-xs" />
          <div className="h-9 w-28 bg-white rounded-xl border border-[#EFF0F6] shadow-xs" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-36 bg-white rounded-xl border border-[#EFF0F6] shadow-xs" />
          <div className="h-9 w-24 bg-white rounded-xl border border-[#EFF0F6] shadow-xs" />
        </div>
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-[#EDEDF0] rounded-full" />
              <div className="h-7 w-7 bg-[#1B59F8]/10 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-[#EDEDF0] rounded-lg" />
            <div className="pt-2 border-t border-[#EFF0F6] flex justify-between items-center">
              <div className="h-3 w-24 bg-[#EDEDF0] rounded-full" />
              <div className="h-3 w-16 bg-[#EDEDF0] rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Content Card Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#EFF0F6]">
          <div className="space-y-1">
            <div className="h-4 w-48 bg-[#EDEDF0] rounded-md" />
            <div className="h-3 w-36 bg-[#EDEDF0] rounded-md" />
          </div>
          <div className="h-7 w-24 bg-[#F9F9F9] rounded-xl border border-[#EFF0F6]" />
        </div>
        <div className="h-40 w-full bg-[#F9F9F9] rounded-2xl" />
      </div>

      {/* 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-3">
          <div className="h-4 w-40 bg-[#EDEDF0] rounded-md" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 bg-[#F9F9F9] rounded-2xl border border-[#EFF0F6]" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-3">
          <div className="h-4 w-36 bg-[#EDEDF0] rounded-md" />
          <div className="space-y-2 pt-2">
            {[1, 2].map((k) => (
              <div key={k} className="h-16 bg-[#F9F9F9] rounded-2xl border border-[#EFF0F6]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen bg-[#EDEDF0] text-[#151E23] antialiased">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">
          {isLoading ? (
            <ContentSkeleton />
          ) : !isAuthenticated ? (
            <ContentSkeleton />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
