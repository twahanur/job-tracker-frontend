'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['career-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 w-full animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-white rounded-xl" />
            <div className="h-4 w-96 bg-white rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] h-32" />
            <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] h-32" />
            <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] h-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#EFF0F6] h-64" />
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#EFF0F6] h-64" />
          </div>
        </div>
      </AppShell>
    );
  }

  const platformStats = analytics?.platformStats || {};
  const workModeCounts = analytics?.workModeCounts || { REMOTE: 0, HYBRID: 0, ONSITE: 0 };
  const salaryMetrics = analytics?.salaryMetrics || { avgMinSalary: 0, avgMaxSalary: 0, analyzedJobs: 0 };
  const velocityMetrics = analytics?.velocityMetrics || { avgDaysToInterview: 7, totalApplicationsTracked: 0 };
  const skillsIntelligence = analytics?.skillsIntelligence || { topSkills: [], candidateSkills: [] };

  const candidateSkillsSet = new Set(skillsIntelligence.candidateSkills || []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#1B59F8]" />
              <span>Career Analytics & Intelligence</span>
            </h1>
            <p className="text-xs text-[#848A95] mt-1">
              Data-driven insights across job platforms, interview velocity, salary compensation, and market skill demand.
            </p>
          </div>
        </div>

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Salary Range */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] space-y-2 shadow-card">
            <div className="flex items-center justify-between text-[#848A95]">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Market Target Salary</span>
              <div className="p-2 rounded-xl bg-[#2FEA9B]/10 text-[#059669]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#151E23] font-mono">
              {salaryMetrics.avgMinSalary > 0
                ? `${formatCurrency(salaryMetrics.avgMinSalary)} - ${formatCurrency(salaryMetrics.avgMaxSalary)}`
                : 'N/A'}
            </div>
            <p className="text-[11px] text-[#848A95]">
              Calculated across {salaryMetrics.analyzedJobs} opportunities with disclosed compensation
            </p>
          </div>

          {/* Average Interview Velocity */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] space-y-2 shadow-card">
            <div className="flex items-center justify-between text-[#848A95]">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Time to First Response</span>
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#1B59F8] font-mono">
              ~{velocityMetrics.avgDaysToInterview} Days
            </div>
            <p className="text-[11px] text-[#848A95]">From application submission to first screening</p>
          </div>

          {/* Total Processed Applications */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] space-y-2 shadow-card">
            <div className="flex items-center justify-between text-[#848A95]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Pipeline Tracked</span>
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#151E23] font-mono">
              {velocityMetrics.totalApplicationsTracked} Applications
            </div>
            <p className="text-[11px] text-[#848A95]">Active across all recruitment stages and sources</p>
          </div>
        </div>

        {/* 2-Column Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Platform Channel Performance (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
            <div>
              <h2 className="text-sm font-bold text-[#151E23] uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1B59F8]" />
                <span>Source Platform Conversion ROI</span>
              </h2>
              <p className="text-xs text-[#848A95]">
                Effectiveness of each job board & platform channel in yielding interviews and offers.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(platformStats).map(([platform, data]: [string, any]) => {
                const total = data.total || 0;
                const applied = data.applied || 0;
                const interview = data.interview || 0;
                const offer = data.offer || 0;
                const conversion = applied > 0 ? Math.round(((interview + offer) / applied) * 100) : 0;

                return (
                  <div
                    key={platform}
                    className="p-3.5 rounded-xl bg-[#F9F9F9] border border-[#EFF0F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#151E23] font-mono">{platform}</span>
                      <p className="text-[11px] text-[#848A95]">
                        {total} opportunities tracked • {applied} applied
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-[#848A95] block uppercase">Interviews</span>
                        <span className="font-bold text-[#1B59F8]">{interview}</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-[#848A95] block uppercase">Offers</span>
                        <span className="font-bold text-[#059669]">{offer}</span>
                      </div>
                      <div className="text-center sm:text-right pl-3 border-l border-[#EFF0F6]">
                        <span className="text-[10px] text-[#848A95] block uppercase">Conv. Rate</span>
                        <span className="font-bold text-[#1B59F8]">{conversion}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Work Mode Distribution & Summary (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
            <div>
              <h2 className="text-sm font-bold text-[#151E23] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1B59F8]" />
                <span>Work Mode Breakdown</span>
              </h2>
              <p className="text-xs text-[#848A95]">Distribution of your target roles by work setting.</p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Remote', count: workModeCounts.REMOTE || 0, color: 'bg-[#2FEA9B]', text: 'text-[#059669]' },
                { label: 'Hybrid', count: workModeCounts.HYBRID || 0, color: 'bg-[#1B59F8]', text: 'text-[#1B59F8]' },
                { label: 'Onsite', count: workModeCounts.ONSITE || 0, color: 'bg-[#FFBF1A]', text: 'text-[#D97706]' },
              ].map((mode, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#F9F9F9] border border-[#EFF0F6] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#151E23]">{mode.label}</span>
                    <span className={`font-mono font-bold ${mode.text}`}>{mode.count} Roles</span>
                  </div>
                  <div className="h-2 w-full bg-[#E4E5E7] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${mode.color} transition-all duration-500 rounded-full`}
                      style={{
                        width: `${
                          velocityMetrics.totalApplicationsTracked > 0
                            ? Math.round((mode.count / velocityMetrics.totalApplicationsTracked) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Skill Demand vs Candidate Skill Matrix */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
          <div>
            <h2 className="text-sm font-bold text-[#151E23] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B59F8]" />
              <span>In-Demand Tech Skills vs Your CV Coverage</span>
            </h2>
            <p className="text-xs text-[#848A95]">
              Most frequently requested skills across your ingested jobs and whether they are present on your primary CV.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {skillsIntelligence.topSkills.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-[#848A95]">
                No skill metrics accumulated yet. Ingest jobs to see market demand.
              </div>
            ) : (
              skillsIntelligence.topSkills.map((item: any, i: number) => {
                const hasSkill = candidateSkillsSet.has(item.skill);

                return (
                  <Link
                    key={i}
                    href={`/jobs?search=${encodeURIComponent(item.skill)}`}
                    className={`p-3.5 rounded-xl border space-y-1.5 transition-all hover:scale-[1.02] block cursor-pointer ${
                      hasSkill
                        ? 'bg-[#2FEA9B]/10 border-[#2FEA9B]/30 hover:border-[#2FEA9B] text-[#059669]'
                        : 'bg-[#F9F9F9] border-[#EFF0F6] hover:border-[#1B59F8]/30 text-[#6B6C7E]'
                    }`}
                    title={`View jobs requiring ${item.skill}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate text-[#151E23]">{item.skill}</span>
                      {hasSkill && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#848A95]">
                      <span>{item.count} postings</span>
                      <span className={`font-bold ${hasSkill ? 'text-[#059669]' : 'text-[#848A95]'}`}>
                        {hasSkill ? 'In CV ✓' : 'Missing'}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

