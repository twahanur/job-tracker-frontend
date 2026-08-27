'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Clock,
  Building,
  MapPin,
  ExternalLink,
  Kanban,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  ChevronDown,
  Users,
  Filter,
  Check,
  RotateCw,
  Layers,
  Activity,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailStudioModal } from '@/components/applications/EmailStudioModal';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import { formatSalaryRange } from '@/lib/utils';

// Timeframe options
const TIMEFRAME_OPTIONS = [
  { label: 'All-time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 3 Months', value: '90d' },
  { label: 'This Year', value: '1y' },
];

// Stage options
const STAGE_OPTIONS = [
  { label: 'All Stages', value: 'ALL' },
  { label: 'Saved & Matched', value: 'SAVED' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Screening / HR', value: 'SCREENING' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Final Interview', value: 'INTERVIEW' },
  { label: 'Offers Secured 🏆', value: 'OFFER' },
  { label: 'Rejected / Archived', value: 'REJECTED' },
];

// Chart view options
const CHART_VIEW_OPTIONS = [
  { label: '2026 Monthly', value: 'monthly' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Weekly Breakdown', value: 'weekly' },
];

/**
 * Mathematical SVG Sparkline generator
 */
function DynamicSparkline({
  points = [],
  color = '#1B59F8',
  gradientId = 'spark-grad-1',
  width = 100,
  height = 24,
}: {
  points?: number[];
  color?: string;
  gradientId?: string;
  width?: number;
  height?: number;
}) {
  const pts = points && points.length > 0 ? points : [0, 0];
  const min = Math.min(...pts);
  const max = Math.max(...pts, min + 1);

  const coords = pts.map((val, idx) => {
    const x = pts.length > 1 ? (idx / (pts.length - 1)) * width : width / 2;
    const normalized = (val - min) / (max - min || 1);
    // Invert y because SVG y=0 is top
    const y = height - 4 - normalized * (height - 8);
    return { x, y };
  });

  // Build path with gentle curve
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const midX = (prev.x + curr.x) / 2;
    linePath += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const fillPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path d={linePath} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Relative time formatter
function formatRelativeTime(dateStr: string) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 3600));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Active filter states
  const [timeframe, setTimeframe] = useState('all');
  const [stage, setStage] = useState('ALL');
  const [domain, setDomain] = useState('All Domains');
  const [chartMode, setChartMode] = useState<'monthly' | '6m' | 'weekly'>('monthly');

  // UI state
  const [openDropdown, setOpenDropdown] = useState<'timeframe' | 'stage' | 'domain' | 'chart' | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'urgent' | 'activity'>('urgent');
  const [selectedAppForEmail, setSelectedAppForEmail] = useState<any | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dynamic Dashboard intelligence stats
  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-stats', timeframe, stage, domain, chartMode],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats', {
        params: {
          timeframe,
          stage,
          domain: domain === 'All Domains' ? undefined : domain,
          chartMode,
        },
      });
      return res.data.data;
    },
  });

  // Follow-up reminder complete mutation
  const completeFollowUpMutation = useMutation({
    mutationFn: async (followUpId: string) => {
      await api.patch(`/dashboard/reminders/${followUpId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const kpi = stats?.kpi || {
    totalJobs: 0,
    allTotalJobs: 0,
    totalCvs: 0,
    activeApplications: 0,
    appliedCount: 0,
    interviewCount: 0,
    offerCount: 0,
    conversionRate: 0,
    avgMatchScore: 0,
    momJobGrowth: 0,
    matchTrend: [0, 0],
    velocityTrend: [0, 0],
  };

  const pipeline = stats?.pipelineCounts || {
    SAVED: 0,
    APPLIED: 0,
    SCREENING: 0,
    TECHNICAL: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  const availableDomains = stats?.filters?.availableDomains || [
    'All Domains',
    'Engineering',
    'Data & AI',
    'Product',
    'Design',
    'Marketing',
    'General Tech',
  ];

  const activityTimeline = stats?.activityTimeline || [];
  const topOpportunities = stats?.topOpportunities || [];
  const followUpNeeded = stats?.followUpNeeded || [];
  const pendingFollowUps = stats?.pendingFollowUps || [];
  const recentActivity = stats?.recentActivity || [];

  const currentTimeframeLabel = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label || 'All-time';
  const currentStageLabel = STAGE_OPTIONS.find((o) => o.value === stage)?.label || 'All Stages';
  const currentChartLabel = CHART_VIEW_OPTIONS.find((o) => o.value === chartMode)?.label || '2026 Monthly';

  // Total active pipeline sum
  const totalPipelineCount = Object.values(pipeline).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

  return (
    <AppShell>
      <div className="space-y-5" ref={dropdownRef}>
        {/* Top Header Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'timeframe' ? null : 'timeframe')}
                className="flex items-center gap-1.5 bg-white hover:bg-[#F9F9F9] px-3 py-1.5 rounded-xl border border-[#EFF0F6] shadow-xs text-xs font-semibold text-[#151E23] transition-all cursor-pointer"
              >
                <span className="text-[#848A95]">Timeframe:</span>
                <span className="text-[#151E23] font-bold">{currentTimeframeLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#848A95]" />
              </button>

              {openDropdown === 'timeframe' && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white border border-[#EFF0F6] p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100">
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTimeframe(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left font-medium transition-colors ${
                        timeframe === opt.value
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8] font-bold'
                          : 'text-[#151E23] hover:bg-[#F2F7FF]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {timeframe === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stage Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'stage' ? null : 'stage')}
                className="flex items-center gap-1.5 bg-white hover:bg-[#F9F9F9] px-3 py-1.5 rounded-xl border border-[#EFF0F6] shadow-xs text-xs font-semibold text-[#151E23] transition-all cursor-pointer"
              >
                <span className="text-[#848A95]">Stage:</span>
                <span className="text-[#151E23] font-bold">{currentStageLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#848A95]" />
              </button>

              {openDropdown === 'stage' && (
                <div className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-white border border-[#EFF0F6] p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100">
                  {STAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStage(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left font-medium transition-colors ${
                        stage === opt.value
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8] font-bold'
                          : 'text-[#151E23] hover:bg-[#F2F7FF]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {stage === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'domain' ? null : 'domain')}
                className="flex items-center gap-1.5 bg-white hover:bg-[#F9F9F9] px-3 py-1.5 rounded-xl border border-[#EFF0F6] shadow-xs text-xs font-semibold text-[#151E23] transition-all cursor-pointer"
              >
                <span className="text-[#848A95]">Domain:</span>
                <span className="text-[#151E23] font-bold">{domain}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#848A95]" />
              </button>

              {openDropdown === 'domain' && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-white border border-[#EFF0F6] p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100">
                  {availableDomains.map((dom: string) => (
                    <button
                      key={dom}
                      onClick={() => {
                        setDomain(dom);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left font-medium transition-colors ${
                        domain === dom
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8] font-bold'
                          : 'text-[#151E23] hover:bg-[#F2F7FF]'
                      }`}
                    >
                      <span>{dom}</span>
                      {domain === dom && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters CTA if active */}
            {(timeframe !== 'all' || stage !== 'ALL' || domain !== 'All Domains') && (
              <button
                onClick={() => {
                  setTimeframe('all');
                  setStage('ALL');
                  setDomain('All Domains');
                }}
                className="text-[11px] font-bold text-[#1B59F8] hover:underline px-2 py-1"
              >
                Clear filters
              </button>
            )}

            {isFetching && (
              <RotateCw className="w-3.5 h-3.5 text-[#1B59F8] animate-spin ml-1" />
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Opportunity</span>
            </Link>

            <Link
              href="/cv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-[#151E23] text-xs font-bold border border-[#EFF0F6] shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-[#1B59F8]" />
              <span>CV Vault</span>
            </Link>
          </div>
        </div>

        {/* 4 Responsive Dynamic KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Target Jobs */}
          <Link
            href="/jobs"
            className="p-5 rounded-2xl bg-white border border-[#EFF0F6] shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-[#1B59F8]/30 transition-all space-y-3 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#848A95] uppercase tracking-wider group-hover:text-[#1B59F8] transition-colors">Active Target Jobs</span>
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#151E23] tracking-tight">{kpi.totalJobs}</span>
              <span className="text-xs font-semibold text-[#848A95]">
                / {kpi.activeApplications} in pipeline
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#EFF0F6] text-xs">
              <span
                className={`font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] ${
                  kpi.momJobGrowth > 0
                    ? 'text-[#059669] bg-[#2FEA9B]/15'
                    : kpi.momJobGrowth < 0
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-[#848A95] bg-[#F9F9F9]'
                }`}
              >
                {kpi.momJobGrowth > 0 ? `▲ +${kpi.momJobGrowth}% MoM` : kpi.momJobGrowth < 0 ? `▼ ${kpi.momJobGrowth}% MoM` : '• Stable Volume'}
              </span>
              <span className="text-[11px] text-[#1B59F8] font-semibold flex items-center gap-0.5">
                <span>Vault</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Card 2: Submitted Applications */}
          <Link
            href="/applications"
            className="p-5 rounded-2xl bg-white border border-[#EFF0F6] shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-[#1B59F8]/30 transition-all space-y-3 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#848A95] uppercase tracking-wider group-hover:text-[#1B59F8] transition-colors">Applications Sent</span>
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Kanban className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#151E23] tracking-tight">{kpi.appliedCount}</span>
              <span className="text-xs font-semibold text-[#848A95]">active outreach</span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#EFF0F6] text-xs">
              <span className="font-bold text-[#1B59F8] bg-[#1B59F8]/10 px-2 py-0.5 rounded-full text-[11px]">
                {kpi.interviewCount} In Interviews
              </span>
              <span className="text-[11px] text-[#1B59F8] font-semibold flex items-center gap-0.5">
                <span>Pipeline</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Card 3: Avg AI Match Score */}
          <Link
            href="/cv"
            className="p-5 rounded-2xl bg-white border border-[#EFF0F6] shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-[#1B59F8]/30 transition-all space-y-3 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#848A95] uppercase tracking-wider group-hover:text-[#1B59F8] transition-colors">Avg Match Alignment</span>
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-3xl font-extrabold text-[#151E23] tracking-tight">
                {kpi.avgMatchScore > 0 ? `${kpi.avgMatchScore}%` : 'N/A'}
              </div>
              <div className="w-24 h-7">
                <DynamicSparkline
                  points={kpi.matchTrend}
                  color="#1B59F8"
                  gradientId="sparkline-match-trend"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#EFF0F6] text-xs">
              <span
                className={`font-bold text-[11px] ${
                  kpi.avgMatchScore >= 80
                    ? 'text-[#059669]'
                    : kpi.avgMatchScore >= 60
                    ? 'text-[#1B59F8]'
                    : 'text-[#848A95]'
                }`}
              >
                {kpi.avgMatchScore >= 80
                  ? 'Strong candidate fit'
                  : kpi.avgMatchScore >= 60
                  ? 'Moderate candidate fit'
                  : kpi.avgMatchScore > 0
                  ? 'Gaps identified'
                  : 'Awaiting Evaluations'}
              </span>
              <span className="text-[11px] text-[#1B59F8] font-semibold flex items-center gap-0.5">
                <span>CV Vault</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Card 4: Conversion Velocity & Offers */}
          <Link
            href="/analytics"
            className="p-5 rounded-2xl bg-white border border-[#EFF0F6] shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-[#2FEA9B]/40 transition-all space-y-3 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#848A95] uppercase tracking-wider group-hover:text-[#059669] transition-colors">Conversion Velocity</span>
              <div className="p-2 rounded-xl bg-[#2FEA9B]/15 text-[#059669]">
                <Award className="w-4 h-4 text-[#059669]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-3xl font-extrabold text-[#151E23] tracking-tight">
                +{kpi.conversionRate}%
              </div>
              <div className="w-24 h-7">
                <DynamicSparkline
                  points={kpi.velocityTrend}
                  color="#2FEA9B"
                  gradientId="sparkline-velocity-trend"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#EFF0F6] text-xs">
              <span className="font-bold text-[#059669] text-[11px]">
                {pipeline.OFFER} Offers Secured 🏆
              </span>
              <span className="text-[11px] text-[#059669] font-semibold flex items-center gap-0.5">
                <span>Analytics</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Dynamic Application & Ingestion Activity Bar Chart Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFF0F6]">
            <div>
              <h3 className="text-base font-bold text-[#151E23]">Application & Ingestion Activity</h3>
              <p className="text-xs text-[#848A95]">
                Real-time volume of tracked job opportunities and application outreach momentum
              </p>
            </div>

            {/* Interactive View Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'chart' ? null : 'chart')}
                className="flex items-center gap-1.5 bg-[#F9F9F9] hover:bg-[#F2F7FF] px-3 py-1.5 rounded-xl border border-[#EFF0F6] text-xs font-bold text-[#151E23] transition-colors cursor-pointer"
              >
                <span>View: {currentChartLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#848A95]" />
              </button>

              {openDropdown === 'chart' && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-[#EFF0F6] p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100">
                  {CHART_VIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setChartMode(opt.value as any);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left font-medium transition-colors ${
                        chartMode === opt.value
                          ? 'bg-[#1B59F8]/10 text-[#1B59F8] font-bold'
                          : 'text-[#151E23] hover:bg-[#F2F7FF]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {chartMode === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 px-1">
              {activityTimeline.length === 0 ? (
                <div className="w-full flex items-center justify-center h-full text-xs text-[#848A95]">
                  No activity accumulated yet. Ingest your first opportunity above!
                </div>
              ) : (
                activityTimeline.map((item: any, idx: number) => {
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group min-w-0 relative"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip Card on Hover */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 bg-[#151E23] text-white text-[11px] rounded-xl px-3 py-1.5 shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 pointer-events-none">
                          <p className="font-bold">{item.label}</p>
                          <p className="text-[10px] text-[#A2A8B4]">
                            {item.jobsCount} Ingested • {item.appliedCount} Applied
                          </p>
                        </div>
                      )}

                      {/* Bar Container */}
                      <div className="w-full max-w-[28px] bg-[#F2F7FF] rounded-full h-40 flex flex-col justify-end p-0.5 cursor-pointer">
                        <div
                          className={`w-full rounded-full transition-all duration-500 shadow-xs ${
                            item.total > 0
                              ? 'bg-[#1B59F8] group-hover:bg-[#1442B8]'
                              : 'bg-[#D5D7E1]'
                          }`}
                          style={{ height: `${item.val}%` }}
                        />
                      </div>

                      {/* Period Label */}
                      <span className="text-[11px] font-bold text-[#848A95] group-hover:text-[#151E23] transition-colors truncate">
                        {item.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Pipeline Stage Distribution Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#151E23] uppercase tracking-wider">
                Application Pipeline Distribution
              </h2>
              <p className="text-xs text-[#848A95]">
                Real-time candidate volume across all stages • Click any stage to open board
              </p>
            </div>
            <Link
              href="/applications"
              className="text-xs text-[#1B59F8] hover:text-[#1442B8] flex items-center gap-1 font-bold w-fit"
            >
              <span>Open Pipeline Board ({totalPipelineCount})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {[
              { label: 'Saved & Matched', key: 'SAVED', count: pipeline.SAVED, color: 'text-[#151E23]', bg: 'bg-[#F9F9F9] hover:bg-[#F2F2F2] border-[#EFF0F6]' },
              { label: 'Applied', key: 'APPLIED', count: pipeline.APPLIED, color: 'text-[#1B59F8]', bg: 'bg-[#1B59F8]/5 hover:bg-[#1B59F8]/10 border-[#1B59F8]/20' },
              { label: 'Screening / HR', key: 'PHONE_SCREEN', count: pipeline.SCREENING, color: 'text-[#1B59F8]', bg: 'bg-[#1B59F8]/10 hover:bg-[#1B59F8]/15 border-[#1B59F8]/30' },
              { label: 'Technical', key: 'TECHNICAL_ASSESSMENT', count: pipeline.TECHNICAL, color: 'text-[#1442B8]', bg: 'bg-[#1442B8]/10 hover:bg-[#1442B8]/15 border-[#1442B8]/20' },
              { label: 'Final Interview', key: 'FIRST_ROUND_INTERVIEW', count: pipeline.INTERVIEW, color: 'text-[#0F2552]', bg: 'bg-[#0F2552]/10 hover:bg-[#0F2552]/15 border-[#0F2552]/20' },
              { label: 'Offers 🏆', key: 'OFFER_RECEIVED', count: pipeline.OFFER, color: 'text-[#059669]', bg: 'bg-[#2FEA9B]/15 hover:bg-[#2FEA9B]/25 border-[#2FEA9B]/30' },
            ].map((stg, i) => (
              <Link
                key={i}
                href={`/applications?stage=${stg.key}`}
                className={`p-4 rounded-2xl border ${stg.bg} space-y-1 block transition-all hover:scale-[1.02] cursor-pointer shadow-xs`}
              >
                <span className="text-[11px] text-[#848A95] font-bold block truncate">{stg.label}</span>
                <span className={`text-2xl font-extrabold font-mono ${stg.color}`}>{stg.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 2-Column Section: Top Opportunities & Follow-Ups / Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Top High-Match Opportunities (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#151E23] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1B59F8]" />
                <span>Top Evaluated Opportunities</span>
              </h2>
              <Link href="/jobs" className="text-xs text-[#1B59F8] hover:text-[#1442B8] font-bold">
                Browse Vault ({kpi.totalJobs})
              </Link>
            </div>

            <div className="space-y-3">
              {topOpportunities.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-[#EFF0F6] text-center space-y-2 shadow-card">
                  <Briefcase className="w-8 h-8 text-[#848A95] mx-auto" />
                  <p className="text-xs font-bold text-[#151E23]">No evaluated opportunities found</p>
                  <p className="text-[11px] text-[#848A95]">
                    Ingest job descriptions and run Gemini Flash matches to view your highest alignment matches here.
                  </p>
                  <Link
                    href="/jobs/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B59F8] text-white text-xs font-bold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ingest First Job</span>
                  </Link>
                </div>
              ) : (
                topOpportunities.map((opp: any) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl bg-white border border-[#EFF0F6] hover:border-[#1B59F8]/40 hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/network?search=${encodeURIComponent(opp.companyName || '')}`}
                          className="text-xs font-bold text-[#1B59F8] hover:underline"
                          title="View company and recruiter contacts in CRM"
                        >
                          {opp.companyName}
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2F7FF] text-[#6B6C7E] font-mono font-bold">
                          {opp.workMode}
                        </span>
                        {opp.domain && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F9F9F9] border border-[#EFF0F6] text-[#848A95] font-semibold">
                            {opp.domain}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/jobs/${opp.id}`}
                        className="text-sm font-bold text-[#151E23] hover:text-[#1B59F8] block transition-colors truncate"
                      >
                        {opp.title}
                      </Link>

                      <div className="flex items-center gap-3 text-xs text-[#848A95] flex-wrap">
                        {opp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {opp.location}
                          </span>
                        )}
                        <span className="font-mono text-[#059669] font-bold">
                          {formatSalaryRange(opp.minSalary, opp.maxSalary, opp.salaryCurrency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFF0F6] flex-shrink-0">
                      {opp.matchScore !== undefined ? (
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                            opp.matchScore >= 85
                              ? 'bg-[#2FEA9B]/15 text-[#059669] border-[#2FEA9B]/30'
                              : opp.matchScore >= 70
                              ? 'bg-[#1B59F8]/10 text-[#1B59F8] border-[#1B59F8]/20'
                              : 'bg-[#FFBF1A]/15 text-[#D97706] border-[#FFBF1A]/30'
                          }`}
                        >
                          {opp.matchScore}% Match
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#848A95] font-semibold">Unmatched</span>
                      )}

                      <Link
                        href={`/jobs/${opp.id}`}
                        className="text-xs text-[#848A95] hover:text-[#151E23] flex items-center gap-1 group-hover:text-[#1B59F8] font-semibold transition-colors"
                      >
                        <span>Inspect Match</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Urgent Action & Reminders OR Live Activity Stream (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Header with Switcher Tabs */}
            <div className="flex items-center justify-between pb-1 border-b border-[#EFF0F6]">
              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('urgent')}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer ${
                    rightPanelTab === 'urgent'
                      ? 'border-[#1B59F8] text-[#1B59F8]'
                      : 'border-transparent text-[#848A95] hover:text-[#151E23]'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Actions ({followUpNeeded.length + pendingFollowUps.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('activity')}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer ${
                    rightPanelTab === 'activity'
                      ? 'border-[#1B59F8] text-[#1B59F8]'
                      : 'border-transparent text-[#848A95] hover:text-[#151E23]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Stream</span>
                </button>
              </div>

              <Link href="/applications" className="text-[11px] text-[#848A95] hover:text-[#1B59F8] font-semibold">
                Manage
              </Link>
            </div>

            {rightPanelTab === 'urgent' ? (
              <div className="space-y-3">
                {followUpNeeded.length === 0 && pendingFollowUps.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-[#EFF0F6] text-center space-y-2 shadow-card">
                    <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
                    <p className="text-xs font-bold text-[#151E23]">All caught up!</p>
                    <p className="text-[11px] text-[#848A95]">
                      No overdue applications or pending scheduled reminders.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Overdue 7-Day Follow-ups */}
                    {followUpNeeded.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-[#D97706] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Follow-Up Due ({item.daysSinceApplied} days active)</span>
                          </span>
                          <button
                            onClick={() =>
                              setSelectedAppForEmail({
                                id: item.id,
                                job: { title: item.title, company: { name: item.companyName } },
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 text-[#1B59F8] text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Draft Email</span>
                          </button>
                        </div>
                        <p className="font-bold text-[#151E23]">
                          {item.title} @ {item.companyName}
                        </p>
                      </div>
                    ))}

                    {/* Scheduled Reminders */}
                    {pendingFollowUps.map((f: any) => (
                      <div
                        key={f.id}
                        className="p-4 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-1.5 text-xs group"
                      >
                        <div className="flex items-center justify-between text-[#848A95]">
                          <span className="font-bold text-[#1B59F8]">{f.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px]">
                              {new Date(f.scheduledDate).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => completeFollowUpMutation.mutate(f.id)}
                              className="p-1 rounded-lg text-[#848A95] hover:text-[#059669] hover:bg-[#2FEA9B]/15 transition-colors"
                              title="Mark Done"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#151E23] font-semibold">
                          {f.jobTitle} ({f.companyName})
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              /* Live Activity Stream Tab */
              <div className="space-y-2.5">
                {recentActivity.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-[#EFF0F6] text-center text-xs text-[#848A95] shadow-card">
                    No status events logged yet.
                  </div>
                ) : (
                  recentActivity.map((evt: any) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-white border border-[#EFF0F6] shadow-xs text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#151E23] truncate max-w-[180px]">
                          {evt.companyName}
                        </span>
                        <span className="text-[10px] text-[#848A95] font-mono">
                          {formatRelativeTime(evt.changedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6C7E] truncate">{evt.jobTitle}</p>
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F7FF] text-[#848A95] font-mono font-bold">
                          {evt.previousStatus || 'SAVED'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[#848A95]" />
                        <span className="px-2 py-0.5 rounded-md bg-[#1B59F8]/10 text-[#1B59F8] font-mono font-bold">
                          {evt.newStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Email Studio Modal */}
        {selectedAppForEmail && (
          <EmailStudioModal
            isOpen={!!selectedAppForEmail}
            onClose={() => setSelectedAppForEmail(null)}
            application={selectedAppForEmail}
          />
        )}
      </div>
    </AppShell>
  );
}
