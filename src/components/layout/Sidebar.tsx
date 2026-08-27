'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Kanban,
  Building2,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Job Vault', href: '/jobs', icon: Briefcase, badge: 'AI' },
  { label: 'Application Pipeline', href: '/applications', icon: Kanban },
  { label: 'CV Vault', href: '/cv', icon: FileText },
  { label: 'Companies & CRM', href: '/network', icon: Building2 },
  { label: 'Career Analytics', href: '/analytics', icon: BarChart3 },
];

const supportItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'w-64 flex-shrink-0 flex flex-col justify-between border-r border-[#EFF0F6] bg-white h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-[#EFF0F6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B59F8] to-[#6497FA] flex items-center justify-center shadow-md shadow-[#1B59F8]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-[#151E23] flex items-center gap-1.5">
                  JobTracker <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B59F8]/10 text-[#1B59F8] font-mono font-bold">AI</span>
                </h1>
                <p className="text-xs text-[#848A95] font-medium">Career Intelligence</p>
              </div>
            </div>

            {/* Mobile close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-[#848A95] hover:text-[#151E23] hover:bg-[#F2F7FF]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation List */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#848A95] mb-2">
                Main Menu
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                        isActive
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8]'
                          : 'text-[#6B6C7E] hover:text-[#151E23] hover:bg-[#F2F7FF]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-105', isActive ? 'text-[#1B59F8]' : 'text-[#848A95] group-hover:text-[#151E23]')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={cn('text-[10px] px-1.5 py-0.2 rounded font-mono font-bold', isActive ? 'bg-[#1B59F8] text-white' : 'bg-[#1B59F8]/10 text-[#1B59F8]')}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#848A95] mb-2">
                Support
              </p>
              <nav className="space-y-1">
                {supportItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                        isActive
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8]'
                          : 'text-[#6B6C7E] hover:text-[#151E23] hover:bg-[#F2F7FF]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-105', isActive ? 'text-[#1B59F8]' : 'text-[#848A95] group-hover:text-[#151E23]')} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-[#EFF0F6] bg-[#F9F9F9]">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EFF0F6] shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1B59F8] to-[#2FEA9B] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#151E23] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#848A95] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-[#848A95] hover:text-[#FF3E13] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full text-center py-2 text-xs font-semibold rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white shadow-brand transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

