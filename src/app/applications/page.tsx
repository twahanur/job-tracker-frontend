'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Kanban,
  Building,
  MapPin,
  Sparkles,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  ArrowUpRight,
  MoreVertical,
  DollarSign,
  Search,
  Filter,
  Pencil,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailStudioModal } from '@/components/applications/EmailStudioModal';
import { EditApplicationModal } from '@/components/applications/EditApplicationModal';
import api from '@/lib/api';
import { formatSalaryRange } from '@/lib/utils';

const COLUMNS = [
  {
    id: 'SAVED_MATCHED',
    key: 'SAVED',
    title: 'Saved & Matched',
    color: 'border-[#EFF0F6] bg-[#F9F9F9] text-[#151E23]',
    badgeBg: 'bg-white text-[#151E23]',
    statuses: ['SAVED', 'MATCHED', 'DRAFTED'],
  },
  {
    id: 'APPLIED',
    key: 'APPLIED',
    title: 'Applied',
    color: 'border-[#1B59F8]/20 bg-[#1B59F8]/5 text-[#1B59F8]',
    badgeBg: 'bg-[#1B59F8]/10 text-[#1B59F8]',
    statuses: ['APPLIED'],
  },
  {
    id: 'PHONE_SCREEN',
    key: 'PHONE_SCREEN',
    title: 'Screening / HR',
    color: 'border-[#1B59F8]/30 bg-[#1B59F8]/10 text-[#1B59F8]',
    badgeBg: 'bg-[#1B59F8]/20 text-[#1B59F8]',
    statuses: ['PHONE_SCREEN'],
  },
  {
    id: 'TECHNICAL',
    key: 'TECHNICAL_ASSESSMENT',
    title: 'Technical Round',
    color: 'border-[#1442B8]/20 bg-[#1442B8]/5 text-[#1442B8]',
    badgeBg: 'bg-[#1442B8]/10 text-[#1442B8]',
    statuses: ['TECHNICAL_ASSESSMENT'],
  },
  {
    id: 'INTERVIEW',
    key: 'FIRST_ROUND_INTERVIEW',
    title: 'Final Interview',
    color: 'border-[#0F2552]/20 bg-[#0F2552]/5 text-[#0F2552]',
    badgeBg: 'bg-[#0F2552]/10 text-[#0F2552]',
    statuses: ['FIRST_ROUND_INTERVIEW', 'FINAL_ROUND_INTERVIEW'],
  },
  {
    id: 'OFFER',
    key: 'OFFER_RECEIVED',
    title: 'Offer Received 🏆',
    color: 'border-[#2FEA9B]/30 bg-[#2FEA9B]/10 text-[#059669]',
    badgeBg: 'bg-[#2FEA9B]/20 text-[#059669]',
    statuses: ['OFFER_RECEIVED', 'OFFER_ACCEPTED'],
  },
];

function ApplicationsKanbanContent() {
  const searchParams = useSearchParams();
  const highlightedStage = searchParams.get('stage') || '';

  const queryClient = useQueryClient();
  const [selectedAppForEmail, setSelectedAppForEmail] = useState<any | null>(null);
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/applications');
      return res.data.data;
    },
  });

  // Update Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      await api.patch(`/applications/${appId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  // Filtered by search query
  const filteredApps = applications.filter((app: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = app.job?.title?.toLowerCase() || '';
    const company = app.job?.company?.name?.toLowerCase() || '';
    const location = app.job?.location?.toLowerCase() || '';
    return title.includes(q) || company.includes(q) || location.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
            <Kanban className="w-6 h-6 text-[#1B59F8]" />
            <span>Application Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] font-mono font-bold">
              {applications.length} Active
            </span>
          </h1>
          <p className="text-xs text-[#848A95] mt-1">
            Interactive Kanban board tracking applications from match through offer negotiation with AI outreach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#848A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter pipeline by role, company, or location..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] placeholder:text-[#848A95] focus:outline-none focus:border-[#1B59F8] shadow-xs"
          />
        </div>

        {highlightedStage && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#848A95]">Focused Stage:</span>
            <span className="font-bold text-[#1B59F8] px-2.5 py-0.5 rounded-full bg-[#1B59F8]/10">
              {highlightedStage}
            </span>
            <Link href="/applications" className="text-[11px] text-[#848A95] hover:text-[#151E23]">
              Clear
            </Link>
          </div>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {COLUMNS.map((col) => {
          const colApps = filteredApps.filter((app: any) =>
            col.statuses.includes(app.status),
          );
          const isHighlighted = highlightedStage && (col.statuses.includes(highlightedStage) || col.key === highlightedStage);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border p-4 w-[280px] sm:w-[300px] shrink-0 space-y-3 transition-all ${
                isHighlighted ? 'ring-2 ring-[#1B59F8] shadow-card-hover' : ''
              } ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-[#EFF0F6]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wide">{col.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${col.badgeBg}`}>
                    {colApps.length}
                  </span>
                </div>
              </div>

              {/* Card List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colApps.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#848A95] border border-dashed border-[#EFF0F6] bg-white/60 rounded-xl">
                    Empty stage
                  </div>
                ) : (
                  colApps.map((app: any) => {
                    const job = app.job;
                    const matchScore = job?.matchResults?.[0]?.overallScore;

                    return (
                      <div
                        key={app.id}
                        className="rounded-2xl bg-white border border-[#EFF0F6] p-4 hover:border-[#1B59F8]/40 hover:shadow-card-hover transition-all shadow-card space-y-3 group"
                      >
                        {/* Card Header */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <Link
                              href={`/network?search=${encodeURIComponent(job?.company?.name || '')}`}
                              className="text-xs font-bold text-[#1B59F8] hover:underline truncate"
                              title="View company in CRM"
                            >
                              {job?.company?.name || 'Company'}
                            </Link>
                            {matchScore !== undefined && (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                                  matchScore >= 85
                                    ? 'bg-[#2FEA9B]/15 text-[#059669] border-[#2FEA9B]/30'
                                    : 'bg-[#1B59F8]/10 text-[#1B59F8] border-[#1B59F8]/20'
                                }`}
                              >
                                {matchScore}%
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/jobs/${job?.id}`}
                            className="text-xs font-bold text-[#151E23] hover:text-[#1B59F8] block line-clamp-2 transition-colors"
                            title="Open Job Details"
                          >
                            {job?.title}
                          </Link>

                          {/* Salary Information */}
                          <div className="flex items-center justify-between gap-1 flex-wrap text-[11px] font-mono pt-1">
                            <span className="text-[#059669] font-bold">
                              {formatSalaryRange(job?.minSalary, job?.maxSalary, job?.salaryCurrency)}
                            </span>
                            {app.expectedSalary ? (
                              <button
                                type="button"
                                onClick={() => setSelectedAppForEdit(app)}
                                className="text-[#1B59F8] font-bold bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
                                title="Click to edit expected salary"
                              >
                                Exp: ${Number(app.expectedSalary).toLocaleString()}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedAppForEdit(app)}
                                className="text-[#848A95] hover:text-[#1B59F8] text-[10px] cursor-pointer"
                                title="Set expected target salary"
                              >
                                + Set Exp.
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-[#EFF0F6] flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedAppForEmail(app)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 text-[#1B59F8] text-[10px] font-bold transition-colors cursor-pointer"
                              title="Generate AI Outreach"
                            >
                              <Sparkles className="w-3 h-3 text-[#1B59F8]" />
                              <span>AI Email</span>
                            </button>

                            <button
                              onClick={() => setSelectedAppForEdit(app)}
                              className="p-1 rounded-lg hover:bg-[#F2F7FF] text-[#848A95] hover:text-[#1B59F8] transition-colors cursor-pointer"
                              title="Edit Application & Expected Salary"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Quick Stage Mover */}
                          <select
                            value={app.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({ appId: app.id, status: e.target.value })
                            }
                            className="text-[10px] bg-[#F9F9F9] border border-[#EFF0F6] text-[#151E23] rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-[#1B59F8] cursor-pointer"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="PHONE_SCREEN">Screening</option>
                            <option value="TECHNICAL_ASSESSMENT">Technical</option>
                            <option value="FIRST_ROUND_INTERVIEW">Interview</option>
                            <option value="OFFER_RECEIVED">Offer 🎉</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Outreach Studio Modal */}
      {selectedAppForEmail && (
        <EmailStudioModal
          isOpen={!!selectedAppForEmail}
          onClose={() => setSelectedAppForEmail(null)}
          application={selectedAppForEmail}
        />
      )}

      {/* Quick Edit Application Modal */}
      {selectedAppForEdit && (
        <EditApplicationModal
          isOpen={!!selectedAppForEdit}
          onClose={() => setSelectedAppForEdit(null)}
          application={selectedAppForEdit}
        />
      )}
    </div>
  );
}

export default function ApplicationsKanbanPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-xs text-[#848A95]">Loading application pipeline...</div>}>
        <ApplicationsKanbanContent />
      </Suspense>
    </AppShell>
  );
}
