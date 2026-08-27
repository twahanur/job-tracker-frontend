'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  X,
  Mail,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();

  // Mode: 'import' (URL/Text) vs 'preview' (Edit & Confirm)
  const [step, setStep] = useState<'import' | 'preview'>('import');
  const [importMode, setImportMode] = useState<'url' | 'text'>('url');

  // Input states
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Extracted Job Fields (Editable in preview)
  const [jobData, setJobData] = useState<{
    title: string;
    companyName: string;
    location: string;
    country: string;
    workMode: string;
    jobType: string;
    minSalary: string;
    maxSalary: string;
    salaryCurrency: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    benefits: string[];
    recruiterName: string;
    recruiterEmail: string;
    deadline: string;
    sourceUrl: string;
    rawContent: string;
    contentHash: string;
    isDuplicate: boolean;
    expectedSalary: string;
    expectedSalaryCurrency: string;
    applicationStatus: string;
    applicationNotes: string;
    portalUrl: string;
  }>({
    title: '',
    companyName: '',
    location: '',
    country: '',
    workMode: 'REMOTE',
    jobType: 'FULL_TIME',
    minSalary: '',
    maxSalary: '',
    salaryCurrency: 'USD',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    benefits: [],
    recruiterName: '',
    recruiterEmail: '',
    deadline: '',
    sourceUrl: '',
    rawContent: '',
    contentHash: '',
    isDuplicate: false,
    expectedSalary: '',
    expectedSalaryCurrency: 'USD',
    applicationStatus: 'SAVED',
    applicationNotes: '',
    portalUrl: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Run Gemini Flash extraction on URL or Text
  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);
    setExtractError(null);

    try {
      const payload = importMode === 'url' ? { url } : { rawText };
      const res = await api.post('/jobs/extract', payload);
      const data = res.data.data;
      const ext = data.extractedData;

      setJobData({
        title: ext.title || '',
        companyName: ext.companyName || '',
        location: ext.location || '',
        country: ext.country || '',
        workMode: ext.workMode || 'REMOTE',
        jobType: ext.jobType || 'FULL_TIME',
        minSalary: ext.minSalary ? String(ext.minSalary) : '',
        maxSalary: ext.maxSalary ? String(ext.maxSalary) : '',
        salaryCurrency: ext.salaryCurrency || 'USD',
        description: ext.description || data.rawContent || '',
        requiredSkills: ext.requiredSkills || [],
        preferredSkills: ext.preferredSkills || [],
        benefits: ext.benefits || [],
        recruiterName: ext.recruiterName || '',
        recruiterEmail: ext.recruiterEmail || '',
        deadline: ext.deadline ? ext.deadline.slice(0, 10) : '',
        sourceUrl: data.sourceUrl || '',
        rawContent: data.rawContent || '',
        contentHash: data.contentHash || '',
        isDuplicate: data.isDuplicate || false,
        expectedSalary: '',
        expectedSalaryCurrency: ext.salaryCurrency || 'USD',
        applicationStatus: 'SAVED',
        applicationNotes: '',
        portalUrl: data.sourceUrl || '',
      });

      setStep('preview');
    } catch (err: any) {
      setExtractError(err.response?.data?.message || 'Failed to extract job posting with Gemini');
    } finally {
      setIsExtracting(false);
    }
  };

  // Step 2: Save to Database
  const handleSaveJob = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: jobData.title,
        companyName: jobData.companyName,
        sourceUrl: jobData.sourceUrl || undefined,
        location: jobData.location || undefined,
        country: jobData.country || undefined,
        workMode: jobData.workMode,
        jobType: jobData.jobType,
        minSalary: jobData.minSalary ? Number(jobData.minSalary) : undefined,
        maxSalary: jobData.maxSalary ? Number(jobData.maxSalary) : undefined,
        salaryCurrency: jobData.salaryCurrency,
        description: jobData.description,
        requiredSkills: jobData.requiredSkills,
        preferredSkills: jobData.preferredSkills,
        benefits: jobData.benefits,
        recruiterName: jobData.recruiterName || undefined,
        recruiterEmail: jobData.recruiterEmail || undefined,
        deadline: jobData.deadline ? jobData.deadline : undefined,
        rawContent: jobData.rawContent,
        contentHash: jobData.contentHash,
        expectedSalary: jobData.expectedSalary ? Number(jobData.expectedSalary) : undefined,
        expectedSalaryCurrency: jobData.expectedSalaryCurrency || jobData.salaryCurrency,
        applicationStatus: jobData.applicationStatus || 'SAVED',
        applicationNotes: jobData.applicationNotes || undefined,
        portalUrl: jobData.portalUrl || undefined,
      };

      const res = await api.post('/jobs', payload);
      const savedJob = res.data.data;
      router.push(`/jobs/${savedJob.id}`);
    } catch (err: any) {
      setExtractError(err.response?.data?.message || 'Failed to save job');
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !jobData.requiredSkills.includes(newSkill.trim())) {
      setJobData({
        ...jobData,
        requiredSkills: [...jobData.requiredSkills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobData({
      ...jobData,
      requiredSkills: jobData.requiredSkills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <AppShell>
      <div className="w-full space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1B59F8]" />
            <span>AI Job Ingestion Studio</span>
          </h1>
          <p className="text-xs text-[#848A95] mt-1">
            Import job posts via URL or raw text. Google Gemini Flash automatically extracts metadata, skills, and salary.
          </p>
        </div>

        {extractError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{extractError}</span>
          </div>
        )}

        {step === 'import' ? (
          /* STEP 1: IMPORT FORM */
          <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-6 shadow-card">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#F9F9F9] border border-[#EFF0F6] w-fit">
              <button
                type="button"
                onClick={() => setImportMode('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  importMode === 'url' ? 'bg-[#1B59F8] text-white shadow-brand' : 'text-[#848A95] hover:text-[#151E23]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Job URL Scraper</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  importMode === 'text' ? 'bg-[#1B59F8] text-white shadow-brand' : 'text-[#848A95] hover:text-[#151E23]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Description Text</span>
              </button>
            </div>

            <form onSubmit={handleExtract} className="space-y-4">
              {importMode === 'url' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#151E23]">Target Job Posting URL</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-[#848A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/jobs/view/... or Greenhouse / Lever link"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none focus:ring-2 focus:ring-[#1B59F8]/20 transition-all placeholder:text-[#848A95] shadow-xs"
                    />
                  </div>
                  <p className="text-[11px] text-[#848A95]">Supports LinkedIn, Indeed, Glassdoor, Greenhouse, Lever, and custom company career pages.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#151E23]">Raw Job Description</label>
                  <textarea
                    required
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the full job post description, responsibilities, and requirements here..."
                    className="w-full p-4 rounded-2xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none focus:ring-2 focus:ring-[#1B59F8]/20 transition-all placeholder:text-[#848A95] shadow-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isExtracting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-sm font-bold shadow-brand transition-all active:scale-[0.98]"
              >
                {isExtracting ? (
                  <span>⚡ Extracting with Google Gemini Flash...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Structured Job Info</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: PREVIEW & EDIT FORM */
          <div className="space-y-6">
            {jobData.isDuplicate && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Notice: You have already ingested a matching job post with this exact description.</span>
              </div>
            )}

            <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-6 shadow-card">
              <div className="flex items-center justify-between pb-4 border-b border-[#EFF0F6]">
                <div>
                  <h2 className="text-lg font-bold text-[#151E23]">Review & Confirm Extracted Details</h2>
                  <p className="text-xs text-[#848A95]">Review Gemini's extracted fields before saving to your Job Vault.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('import')}
                  className="text-xs text-[#151E23] hover:bg-[#F2F7FF] px-3.5 py-1.5 rounded-xl border border-[#EFF0F6] font-semibold"
                >
                  ← Re-Extract
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobData.title}
                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobData.companyName}
                    onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Location</label>
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Work Mode</label>
                  <select
                    value={jobData.workMode}
                    onChange={(e) => setJobData({ ...jobData, workMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Min Salary ({jobData.salaryCurrency} / yr)</label>
                  <input
                    type="number"
                    value={jobData.minSalary}
                    onChange={(e) => setJobData({ ...jobData, minSalary: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Max Salary ({jobData.salaryCurrency} / yr)</label>
                  <input
                    type="number"
                    value={jobData.maxSalary}
                    onChange={(e) => setJobData({ ...jobData, maxSalary: e.target.value })}
                    placeholder="e.g. 80000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                {/* Recruiter / HR Contact */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Recruiter / Contact Person</label>
                  <input
                    type="text"
                    value={jobData.recruiterName}
                    onChange={(e) => setJobData({ ...jobData, recruiterName: e.target.value })}
                    placeholder="e.g. HR Team or Hiring Manager"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1B59F8]" />
                    <span>HR / Application Email (Auto-extracted)</span>
                  </label>
                  <input
                    type="email"
                    value={jobData.recruiterEmail}
                    onChange={(e) => setJobData({ ...jobData, recruiterEmail: e.target.value })}
                    placeholder="e.g. hr@company.com or jobs@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Required Skills Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#151E23]">Required Skills & Tech Stack</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {jobData.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] text-xs font-bold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-[#FF3E13]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add a required skill..."
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] flex-1 focus:border-[#1B59F8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-xs font-bold text-white shadow-brand"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Application & Target Compensation */}
              <div className="p-5 rounded-2xl bg-[#F2F7FF] border border-[#1B59F8]/20 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#1B59F8]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B59F8]">
                    Your Target Application & Compensation (Optional)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Expected Target Salary</label>
                    <input
                      type="number"
                      value={jobData.expectedSalary}
                      onChange={(e) => setJobData({ ...jobData, expectedSalary: e.target.value })}
                      placeholder="e.g. 75000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Currency</label>
                    <select
                      value={jobData.expectedSalaryCurrency}
                      onChange={(e) => setJobData({ ...jobData, expectedSalaryCurrency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="SGD">SGD (S$)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Initial Pipeline Stage</label>
                    <select
                      value={jobData.applicationStatus}
                      onChange={(e) => setJobData({ ...jobData, applicationStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-sm font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    >
                      <option value="SAVED">Saved & Matched</option>
                      <option value="APPLIED">Applied (Active)</option>
                      <option value="PHONE_SCREEN">Screening / HR</option>
                      <option value="TECHNICAL_ASSESSMENT">Technical Round</option>
                      <option value="FIRST_ROUND_INTERVIEW">Interview Round</option>
                      <option value="OFFER_RECEIVED">Offer Received 🏆</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Application Portal URL</label>
                    <input
                      type="url"
                      value={jobData.portalUrl}
                      onChange={(e) => setJobData({ ...jobData, portalUrl: e.target.value })}
                      placeholder="e.g. https://jobs.lever.co/company/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Private Notes / Strategy</label>
                    <input
                      type="text"
                      value={jobData.applicationNotes}
                      onChange={(e) => setJobData({ ...jobData, applicationNotes: e.target.value })}
                      placeholder="e.g. Target salary $80k negotiable with bonuses"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Role Description & Highlights</label>
                <textarea
                  rows={6}
                  value={jobData.description}
                  onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFF0F6]">
                <button
                  type="button"
                  onClick={() => router.push('/jobs')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving || !jobData.title || !jobData.companyName}
                  onClick={handleSaveJob}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
                >
                  {isSaving ? (
                    <span>Saving Job...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Save Job</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

