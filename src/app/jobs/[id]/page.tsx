'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  Mail,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  RotateCw,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailStudioModal } from '@/components/applications/EmailStudioModal';
import { EditJobModal } from '@/components/jobs/EditJobModal';
import api from '@/lib/api';
import { formatSalaryRange } from '@/lib/utils';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const queryClient = useQueryClient();

  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [isEmailStudioOpen, setIsEmailStudioOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch job details & match results
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data.data;
    },
  });

  // Fetch CVs for the switcher dropdown
  const { data: cvs = [] } = useQuery({
    queryKey: ['cvs'],
    queryFn: async () => {
      const res = await api.get('/cv');
      return res.data.data;
    },
  });

  // Run Match mutation
  const matchMutation = useMutation({
    mutationFn: async (cvId?: string) => {
      const res = await api.post(`/jobs/${jobId}/match`, { cvId: cvId || undefined });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const latestMatch = job?.matchResults?.[0];

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-5 w-full animate-pulse">
          <div className="h-9 w-36 bg-white rounded-xl border border-[#EFF0F6] shadow-xs" />
          <div className="p-8 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-4">
            <div className="h-4 w-28 bg-[#EDEDF0] rounded" />
            <div className="h-8 w-72 bg-[#EDEDF0] rounded" />
            <div className="h-4 w-48 bg-[#EDEDF0] rounded" />
          </div>
          <div className="p-8 rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-6">
            <div className="h-6 w-60 bg-[#EDEDF0] rounded" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 h-48 bg-[#F9F9F9] rounded-2xl border border-[#EFF0F6]" />
              <div className="md:col-span-8 h-48 bg-[#F9F9F9] rounded-2xl border border-[#EFF0F6]" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="p-12 text-center text-xs text-[#FF3E13]">Job not found</div>
      </AppShell>
    );
  }

  const score = latestMatch?.overallScore;
  const recommendation = latestMatch?.recommendation || 'NOT EVALUATED';

  return (
    <AppShell>
      <div className="space-y-5 w-full">
        {/* Back navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-[#848A95] hover:text-[#151E23] font-bold transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#EFF0F6] shadow-xs w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-[#1B59F8]" />
            <span>Back to Job Vault</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6] shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1B59F8]" />
              <span>Edit Details & Salary</span>
            </button>

            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6] shadow-xs transition-colors"
              >
                <span>Original Posting</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#1B59F8]" />
              </a>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] font-mono font-bold uppercase">
                  {job.workMode}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F2F7FF] border border-[#EFF0F6] text-[#6B6C7E] font-mono font-semibold">
                  {job.jobType.replace(/_/g, ' ')}
                </span>
                {job.deadline && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[#D97706] font-mono font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#151E23]">{job.title}</h1>

              <div className="flex items-center gap-4 text-xs text-[#848A95] flex-wrap">
                <Link
                  href={`/network?search=${encodeURIComponent(job.company?.name || '')}`}
                  className="font-bold text-[#1B59F8] hover:underline flex items-center gap-1.5 text-sm"
                  title="View company and recruiter contacts in CRM"
                >
                  <Building className="w-4 h-4 text-[#1B59F8]" />
                  <span>{job.company?.name || 'Company'}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>

                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}

                {/* Posted Salary */}
                <span className="font-mono text-[#059669] font-bold bg-[#2FEA9B]/10 px-2.5 py-1 rounded-xl border border-[#2FEA9B]/20">
                  Offered: {formatSalaryRange(job.minSalary, job.maxSalary, job.salaryCurrency)}
                </span>

                {/* Candidate Expected Salary */}
                {job.application?.expectedSalary ? (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1B59F8] bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 border border-[#1B59F8]/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    title="Click to edit expected salary"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-[#1B59F8]" />
                    <span>Target Expected: ${Number(job.application.expectedSalary).toLocaleString()} {job.application.salaryCurrency || 'USD'}</span>
                    <Pencil className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#848A95] hover:text-[#1B59F8] bg-[#F2F7FF] hover:bg-[#1B59F8]/10 px-2.5 py-1 rounded-xl transition-colors cursor-pointer border border-[#EFF0F6]"
                    title="Set your expected compensation for this role"
                  >
                    <Plus className="w-3 h-3 text-[#1B59F8]" />
                    <span>+ Set Expected Salary</span>
                  </button>
                )}

                {job.recruiter?.email && (
                  <button
                    type="button"
                    onClick={() => setIsEmailStudioOpen(true)}
                    className="inline-flex items-center gap-1 font-semibold text-[#1B59F8] hover:text-[#1442B8] bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                    title="Generate AI email outreach to recruiter"
                  >
                    <Mail className="w-3 h-3 text-[#1B59F8]" />
                    <span>HR: {job.recruiter.email}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Application Status & Outreach Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Link
                href={`/applications?stage=${job.application?.status || 'SAVED'}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 border border-[#1B59F8]/20 text-[#1B59F8] text-xs font-bold transition-all"
                title="View in Application Pipeline Kanban"
              >
                <span>Stage: {job.application?.status || 'SAVED'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              
              <button
                type="button"
                onClick={() => setIsEmailStudioOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Outreach & Email Studio</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI MATCH INSPECTOR SECTION */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFF0F6]">
            <div>
              <h2 className="text-lg font-bold text-[#151E23] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1B59F8]" />
                <span>Multi-Dimensional AI Match Breakdown</span>
              </h2>
              <p className="text-xs text-[#848A95] mt-0.5">
                Evaluated by Google Gemini Flash against your structured CV profile.
              </p>
            </div>

            {/* Run / Switch Match Controls */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:outline-none focus:border-[#1B59F8]"
              >
                <option value="">Primary CV (Default)</option>
                {cvs.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (v{c.currentVersion})
                  </option>
                ))}
              </select>

              <button
                onClick={() => matchMutation.mutate(selectedCvId || undefined)}
                disabled={matchMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
              >
                <RotateCw className={`w-3.5 h-3.5 ${matchMutation.isPending ? 'animate-spin' : ''}`} />
                <span>{matchMutation.isPending ? 'Analyzing...' : latestMatch ? 'Re-Evaluate' : 'Run Match'}</span>
              </button>
            </div>
          </div>

          {latestMatch ? (
            <div className="space-y-6">
              {/* Top Score Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Overall Score Circle */}
                <div className="md:col-span-4 p-6 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#848A95]">Overall Match</span>
                  <div
                    className={`text-5xl font-extrabold font-mono tracking-tight ${
                      score >= 85
                        ? 'text-[#059669]'
                        : score >= 70
                        ? 'text-[#1B59F8]'
                        : score >= 50
                        ? 'text-[#D97706]'
                        : 'text-[#FF3E13]'
                    }`}
                  >
                    {score}%
                  </div>
                  <span
                    className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                      score >= 85
                        ? 'bg-[#2FEA9B]/15 text-[#059669] border-[#2FEA9B]/30'
                        : score >= 70
                        ? 'bg-[#1B59F8]/10 text-[#1B59F8] border-[#1B59F8]/20'
                        : 'bg-[#FFBF1A]/15 text-[#D97706] border-[#FFBF1A]/30'
                    }`}
                  >
                    {recommendation.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[11px] text-[#848A95]">Matched with: {latestMatch.cv?.title || 'CV'}</p>
                </div>

                {/* 5-Category Breakdown Bars */}
                <div className="md:col-span-8 space-y-2.5 p-5 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] text-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#848A95] block mb-2">
                    Score Breakdown By Category
                  </span>

                  {[
                    { label: 'Skills & Stack (40%)', val: latestMatch.skillsScore, color: 'bg-[#1B59F8]' },
                    { label: 'Experience & Seniority (25%)', val: latestMatch.experienceScore, color: 'bg-[#1442B8]' },
                    { label: 'Education & Certs (10%)', val: latestMatch.educationScore, color: 'bg-[#2FEA9B]' },
                    { label: 'Location & Work Mode (15%)', val: latestMatch.locationScore, color: 'bg-[#6497FA]' },
                    { label: 'Salary Compatibility (10%)', val: latestMatch.salaryScore, color: 'bg-[#FFBF1A]' },
                  ].map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[#848A95]">
                        <span className="font-semibold">{cat.label}</span>
                        <span className="font-mono text-[#151E23] font-bold">{cat.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#E4E5E7] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                          style={{ width: `${cat.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color-Coded Skill Matrix */}
              <div className="space-y-3 pt-4 border-t border-[#EFF0F6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#848A95]">
                  Skill Alignment Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Matched */}
                  <div className="p-4 rounded-2xl bg-[#2FEA9B]/10 border border-[#2FEA9B]/30 space-y-2">
                    <span className="font-bold text-[#059669] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Matched Skills ({latestMatch.matchedSkills?.length || 0})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {latestMatch.matchedSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#2FEA9B]/20 text-[#059669] text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Partial */}
                  <div className="p-4 rounded-2xl bg-[#FFBF1A]/10 border border-[#FFBF1A]/30 space-y-2">
                    <span className="font-bold text-[#D97706] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Partial Matches ({latestMatch.partialSkills?.length || 0})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {latestMatch.partialSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#FFBF1A]/20 text-[#D97706] text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <span className="font-bold text-[#FF3E13] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Missing Skills ({latestMatch.missingSkills?.length || 0})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {latestMatch.missingSkills && latestMatch.missingSkills.length > 0 ? (
                        latestMatch.missingSkills.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-100 text-[#FF3E13] text-[11px] font-bold">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#848A95] text-[11px]">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] space-y-2 text-xs">
                  <h4 className="font-bold text-[#059669] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Candidate Strengths</span>
                  </h4>
                  <ul className="list-disc list-inside text-[#4D4D4D] space-y-1">
                    {latestMatch.strengths?.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] space-y-2 text-xs">
                  <h4 className="font-bold text-[#D97706] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Skill & Experience Gaps</span>
                  </h4>
                  <ul className="list-disc list-inside text-[#4D4D4D] space-y-1">
                    {latestMatch.gaps?.map((gap: string, i: number) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Tips */}
              {latestMatch.actionableTips && latestMatch.actionableTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#1B59F8]/5 border border-[#1B59F8]/20 space-y-2 text-xs">
                  <h4 className="font-bold text-[#1B59F8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Actionable Resume Tailoring & Interview Tips</span>
                  </h4>
                  <ul className="list-disc list-inside text-[#151E23] space-y-1">
                    {latestMatch.actionableTips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Narrative Explanation */}
              {latestMatch.explanation && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-[#848A95] uppercase tracking-wider">Executive AI Summary</h4>
                  <p className="text-[#4D4D4D] leading-relaxed bg-[#F9F9F9] p-4 rounded-2xl border border-[#EFF0F6]">
                    {latestMatch.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#1B59F8] mx-auto" />
              <p className="text-sm font-bold text-[#151E23]">No match evaluation performed yet</p>
              <p className="text-xs text-[#848A95] max-w-md mx-auto">
                Click "Run Match" above to evaluate your CV against this job posting and receive a comprehensive compatibility score, gap analysis, and tailoring advice.
              </p>
            </div>
          )}
        </div>

        {/* Job Details Section */}
        <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 sm:p-8 space-y-6 shadow-card">
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#848A95] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#1B59F8]" />
                <span>Required Skills & Tech Stack ({job.requiredSkills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-[#EFF0F6]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#848A95]">About The Role</h3>
            <p className="text-xs text-[#4D4D4D] leading-relaxed whitespace-pre-line bg-[#F9F9F9] p-4 rounded-2xl border border-[#EFF0F6]">
              {job.description}
            </p>
          </div>
        </div>

        {/* Email Studio Modal */}
        {job.application && (
          <EmailStudioModal
            isOpen={isEmailStudioOpen}
            onClose={() => setIsEmailStudioOpen(false)}
            application={{ ...job.application, job }}
          />
        )}

        {/* Edit Job & Application Modal */}
        <EditJobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={job}
        />
      </div>
    </AppShell>
  );
}

