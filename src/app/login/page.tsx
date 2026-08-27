'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser, isAuthenticated, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data || res.data;
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDF0] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1B59F8] flex items-center justify-center shadow-brand mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#151E23]">Welcome back</h1>
          <p className="text-xs text-[#848A95]">Sign in to your Job Recruitment & Career Intelligence suite</p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] p-8 shadow-card space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151E23]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#848A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twahanur@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none focus:ring-2 focus:ring-[#1B59F8]/20 transition-all placeholder:text-[#848A95] shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#151E23]">Password</label>
                <a href="#" className="text-xs text-[#1B59F8] hover:text-[#1442B8] font-bold">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#848A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none focus:ring-2 focus:ring-[#1B59F8]/20 transition-all placeholder:text-[#848A95] shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#848A95]">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-[#1B59F8] hover:text-[#1442B8] font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
