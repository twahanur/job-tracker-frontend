'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Tag,
  Kanban,
  FileText,
} from 'lucide-react';
import api from '@/lib/api';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export function EditJobModal({ isOpen, onClose, job }: EditJobModalProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'job' | 'application' | 'skills'>('job');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    workMode: 'REMOTE',
    jobType: 'FULL_TIME',
    minSalary: '',
    maxSalary: '',
    salaryCurrency: 'USD',
    deadline: '',
    description: '',
    requiredSkills: [] as string[],
    recruiterName: '',
    recruiterEmail: '',
    // Application specific
    expectedSalary: '',
    expectedSalaryCurrency: 'USD',
    applicationStatus: 'SAVED',
    portalUrl: '',
    applicationNotes: '',
  });

  const [newSkillInput, setNewSkillInput] = useState('');

  // Sync form data with incoming job prop
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        companyName: job.company?.name || '',
        location: job.location || '',
        workMode: job.workMode || 'REMOTE',
        jobType: job.jobType || 'FULL_TIME',
        minSalary: job.minSalary !== null && job.minSalary !== undefined ? String(job.minSalary) : '',
        maxSalary: job.maxSalary !== null && job.maxSalary !== undefined ? String(job.maxSalary) : '',
        salaryCurrency: job.salaryCurrency || 'USD',
        deadline: job.deadline ? job.deadline.slice(0, 10) : '',
        description: job.description || '',
        requiredSkills: job.requiredSkills || [],
        recruiterName: job.recruiter?.name || '',
        recruiterEmail: job.recruiter?.email || '',
        expectedSalary:
          job.application?.expectedSalary !== null && job.application?.expectedSalary !== undefined
            ? String(job.application.expectedSalary)
            : '',
        expectedSalaryCurrency: job.application?.salaryCurrency || job.salaryCurrency || 'USD',
        applicationStatus: job.application?.status || 'SAVED',
        portalUrl: job.application?.portalUrl || job.sourceUrl || '',
        applicationNotes: job.application?.applicationNotes || '',
      });
      setErrorMessage(null);
    }
  }, [job, isOpen]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch(`/jobs/${job.id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', job.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['recruiters'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update job details');
    },
  });

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      title: formData.title,
      companyName: formData.companyName,
      location: formData.location || undefined,
      workMode: formData.workMode,
      jobType: formData.jobType,
      minSalary: formData.minSalary ? Number(formData.minSalary) : null,
      maxSalary: formData.maxSalary ? Number(formData.maxSalary) : null,
      salaryCurrency: formData.salaryCurrency,
      deadline: formData.deadline || null,
      description: formData.description,
      requiredSkills: formData.requiredSkills,
      recruiterName: formData.recruiterName || undefined,
      recruiterEmail: formData.recruiterEmail || undefined,
      // Application metadata
      expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : null,
      expectedSalaryCurrency: formData.expectedSalaryCurrency,
      applicationStatus: formData.applicationStatus,
      portalUrl: formData.portalUrl || undefined,
      applicationNotes: formData.applicationNotes || undefined,
    };

    updateMutation.mutate(payload);
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !formData.requiredSkills.includes(newSkillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkillInput.trim()],
      });
      setNewSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#EFF0F6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#EFF0F6] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1B59F8]/10 text-[#1B59F8]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#151E23]">Edit Job & Application Details</h2>
              <p className="text-xs text-[#848A95]">
                Update job properties, target expected salary, stage, and contact info
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#848A95] hover:text-[#151E23] hover:bg-[#F2F7FF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EFF0F6] px-6 bg-[#F9F9F9]">
          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'job'
                ? 'border-[#1B59F8] text-[#1B59F8] bg-white'
                : 'border-transparent text-[#848A95] hover:text-[#151E23]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Job Properties</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('application')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'application'
                ? 'border-[#1B59F8] text-[#1B59F8] bg-white'
                : 'border-transparent text-[#848A95] hover:text-[#151E23]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Expected Salary & Application</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'border-[#1B59F8] text-[#1B59F8] bg-white'
                : 'border-transparent text-[#848A95] hover:text-[#151E23]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Skills & Description</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: JOB PROPERTIES */}
          {activeTab === 'job' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. New York, NY / Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Posted Compensation Range */}
              <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#848A95] block">
                  Company Posted Salary Range
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#848A95]">Min Salary</label>
                    <input
                      type="number"
                      value={formData.minSalary}
                      onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                      placeholder="e.g. 60000"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#848A95]">Max Salary</label>
                    <input
                      type="number"
                      value={formData.maxSalary}
                      onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                      placeholder="e.g. 90000"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#848A95]">Currency</label>
                    <select
                      value={formData.salaryCurrency}
                      onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
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
                </div>
              </div>

              {/* Recruiter Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Recruiter / Contact Name</label>
                  <input
                    type="text"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Recruiter Email</label>
                  <input
                    type="email"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    placeholder="e.g. recruiter@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATION & EXPECTED SALARY */}
          {activeTab === 'application' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#F2F7FF] border border-[#1B59F8]/20 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#1B59F8]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B59F8]">
                    Your Target Application & Compensation Strategy
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Your Expected Salary</label>
                    <input
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      placeholder="e.g. 85000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151E23]">Currency</label>
                    <select
                      value={formData.expectedSalaryCurrency}
                      onChange={(e) => setFormData({ ...formData, expectedSalaryCurrency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
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
                    <label className="text-xs font-bold text-[#151E23]">Application Stage</label>
                    <select
                      value={formData.applicationStatus}
                      onChange={(e) => setFormData({ ...formData, applicationStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    >
                      <option value="SAVED">Saved & Matched</option>
                      <option value="APPLIED">Applied</option>
                      <option value="PHONE_SCREEN">Screening / HR</option>
                      <option value="TECHNICAL_ASSESSMENT">Technical Round</option>
                      <option value="FIRST_ROUND_INTERVIEW">Final Interview</option>
                      <option value="OFFER_RECEIVED">Offer Received 🏆</option>
                      <option value="OFFER_ACCEPTED">Offer Accepted ✅</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Application Portal URL</label>
                  <input
                    type="url"
                    value={formData.portalUrl}
                    onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                    placeholder="https://company.greenhouse.io/applications/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#151E23]">Application Notes & Negotiation Strategy</label>
                  <textarea
                    rows={3}
                    value={formData.applicationNotes}
                    onChange={(e) => setFormData({ ...formData, applicationNotes: e.target.value })}
                    placeholder="Notes regarding referrals, tailored points, interview schedule, or salary negotiation leverage..."
                    className="w-full p-3 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS & DESCRIPTION */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#151E23]">Required Skills & Tech Stack</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.requiredSkills.map((skill, i) => (
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
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add a required skill (e.g. Next.js, Docker, NestJS)..."
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Role Description & Requirements</label>
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EFF0F6] sticky bottom-0 bg-white">
            <div className="text-[11px] text-[#848A95]">
              Changes will immediately update AI match analysis and Kanban pipeline.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending || !formData.title || !formData.companyName}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
              >
                {updateMutation.isPending ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
