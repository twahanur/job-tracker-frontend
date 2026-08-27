'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Search,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowDownToLine,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get('/notifications');
      return res.data.data;
    },
    enabled: !!user,
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      logout();
      router.push('/login');
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Reports & Intelligence';
    if (pathname.startsWith('/cv')) return 'CV Vault & Parser';
    if (pathname.startsWith('/jobs/new')) return 'Job Ingestion Studio';
    if (pathname.startsWith('/jobs')) return 'Job Vault';
    if (pathname.startsWith('/applications')) return 'Application Pipeline';
    if (pathname.startsWith('/network')) return 'Network CRM';
    if (pathname.startsWith('/analytics')) return 'Career Analytics';
    return 'Job Application Tracker';
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-[#EFF0F6] bg-white/90 px-6 backdrop-blur-md">
      {/* Current Page Title & Hamburger for Mobile */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#848A95] hover:text-[#151E23] hover:bg-[#F2F7FF] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#151E23]">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Global Action Tools */}
      <div className="flex items-center gap-3">
        {/* Model Intelligence Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#1B59F8]/10 px-3 py-1 text-xs font-mono font-bold text-[#1B59F8] border border-[#1B59F8]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#1B59F8]" />
          <span>Gemini Flash AI</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#EFF0F6] text-[#848A95] hover:text-[#151E23] hover:border-[#D5D7E1] shadow-xs transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3E13] text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#EFF0F6] p-3.5 shadow-dropdown space-y-2.5 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFF0F6]">
                <span className="font-bold text-[#151E23]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[11px] text-[#1B59F8] hover:text-[#1442B8] font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#848A95] text-[11px]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        n.isRead
                          ? 'bg-[#F9F9F9] border-[#EFF0F6] text-[#6B6C7E]'
                          : 'bg-[#1B59F8]/5 border-[#1B59F8]/20 text-[#151E23]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-[#151E23]">{n.title}</span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#1B59F8] mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B6C7E] mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-xl bg-white border border-[#EFF0F6] px-3 py-1.5 text-xs text-[#151E23] hover:border-[#1B59F8]/40 shadow-xs transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#1B59F8] to-[#6497FA] text-xs font-bold text-white shadow-xs">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline font-bold max-w-[120px] truncate text-[#151E23]">{user.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#848A95]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#EFF0F6] p-2 shadow-dropdown z-50">
                <div className="px-3 py-2 border-b border-[#EFF0F6] text-xs">
                  <p className="font-bold text-[#151E23] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#848A95] truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#FF3E13] hover:bg-rose-50 font-semibold transition-colors mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#6B6C7E] hover:text-[#151E23] hover:bg-[#F2F7FF] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#1B59F8] px-4 py-2 text-xs font-bold text-white hover:bg-[#1442B8] shadow-brand transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

