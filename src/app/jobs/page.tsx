'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Sparkles,
  MapPin,
  DollarSign,
  Building,
  ArrowUpRight,
  Archive,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';
import { formatSalaryRange } from '@/lib/utils';

export default function JobsListPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'interviews' | 'expiring' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState<string>('');

  // Fetch jobs with active filters
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', activeTab, search, workMode],
    queryFn: async () => {
      const res = await api.get('/jobs', {
        params: {
          tab: activeTab,
          search: search || undefined,
          workMode: workMode || undefined,
        },
      });
      return res.data.data;
    },
  });

  const jobs = data?.jobs || [];
  const total = data?.pagination?.total || 0;

  // Toggle Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.patch(`/jobs/${jobId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Delete Job mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const tabs = [
    { id: 'all', label: 'All Tracked Jobs' },
    { id: 'applied', label: 'Applied' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#1B59F8]" />
              <span>Job Vault</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] font-mono font-bold">
                {total} Jobs
              </span>
            </h1>
            <p className="text-xs text-[#848A95] mt-1">
              Organize, filter, and track all your target opportunities with instant AI match breakdown.
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98] w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Import New Job</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">AI</span>
          </Link>
        </div>

        {/* Tab Filter Bar */}
        <div className="flex items-center gap-2 border-b border-[#EFF0F6] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1B59F8] text-[#1B59F8]'
                  : 'border-transparent text-[#848A95] hover:text-[#151E23]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#848A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company name, or required skill..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] placeholder:text-[#848A95] focus:outline-none focus:border-[#1B59F8] shadow-xs"
            />
          </div>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:outline-none focus:border-[#1B59F8] shadow-xs"
          >
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>
        </div>

        {/* Jobs Data Table / Card View */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] overflow-hidden shadow-card">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#848A95]">Loading tracked jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-[#848A95] mx-auto" />
              <p className="text-sm font-bold text-[#151E23]">No jobs found in this view</p>
              <p className="text-xs text-[#848A95]">
                {search ? 'Try adjusting your search keywords.' : 'Import a job from LinkedIn, Greenhouse, or paste description.'}
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Job Post</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EFF0F6]">
              {jobs.map((job: any) => {
                const matchScore = job.matchResults?.[0]?.overallScore;
                const status = job.application?.status || 'SAVED';

                return (
                  <div
                    key={job.id}
                    className="p-5 hover:bg-[#F9F9F9] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Job Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-base font-bold text-[#151E23] hover:text-[#1B59F8] transition-colors truncate"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2F7FF] text-[#6B6C7E] font-mono font-bold uppercase">
                          {job.workMode}
                        </span>
                        {matchScore !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                              matchScore >= 85
                                ? 'bg-[#2FEA9B]/15 text-[#059669] border-[#2FEA9B]/30'
                                : matchScore >= 70
                                ? 'bg-[#1B59F8]/10 text-[#1B59F8] border-[#1B59F8]/20'
                                : 'bg-[#FFBF1A]/15 text-[#D97706] border-[#FFBF1A]/30'
                            }`}
                          >
                            {matchScore}% Match
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#848A95] flex-wrap">
                        <Link
                          href={`/network?search=${encodeURIComponent(job.company?.name || '')}`}
                          className="font-bold text-[#1B59F8] hover:underline flex items-center gap-1"
                          title="View company and recruiter contacts in CRM"
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>{job.company?.name || 'Company'}</span>
                        </Link>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        <span className="font-mono text-[#059669] font-bold">
                          {formatSalaryRange(job.minSalary, job.maxSalary, job.salaryCurrency)}
                        </span>
                        {job.application?.expectedSalary && (
                          <span className="font-mono text-[#1B59F8] font-bold bg-[#1B59F8]/10 px-2 py-0.5 rounded-lg text-[11px]">
                            Exp: ${Number(job.application.expectedSalary).toLocaleString()} {job.application.salaryCurrency || 'USD'}
                          </span>
                        )}
                      </div>

                      {/* Required Skills Chips */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.requiredSkills.slice(0, 5).map((skill: string, i: number) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-[#F9F9F9] border border-[#EFF0F6] text-[11px] text-[#4D4D4D] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="text-[10px] text-[#848A95] self-center">
                              +{job.requiredSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                      <Link
                        href={`/applications?stage=${status}`}
                        className="px-3 py-1 rounded-xl bg-[#F9F9F9] hover:bg-[#F2F7FF] border border-[#EFF0F6] text-xs font-bold text-[#4D4D4D] hover:text-[#1B59F8] transition-colors"
                        title="View stage in pipeline"
                      >
                        {status.replace(/_/g, ' ')}
                      </Link>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8] text-[#1B59F8] hover:text-white border border-[#1B59F8]/20 text-xs font-bold transition-all"
                      >
                        Inspect
                      </Link>

                      <button
                        onClick={() => archiveMutation.mutate(job.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F2F7FF] text-[#848A95] hover:text-[#151E23] transition-colors"
                        title={job.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Delete this job?')) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#848A95] hover:text-[#FF3E13] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

