'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  User,
  DollarSign,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  MapPin,
  Tag,
  Plus,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    minExpectedSalary: '',
    targetSalary: '',
    currency: 'USD',
    noticePeriodDays: '30',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    targetRoles: [] as string[],
    skills: [] as string[],
    workModePreferences: [] as string[],
  });

  const [newRoleInput, setNewRoleInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  // Fetch Candidate Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (profile) {
      const p = profile.candidateProfile || {};
      setFormData({
        name: profile.name || '',
        headline: p.headline || '',
        bio: p.bio || '',
        minExpectedSalary: p.minExpectedSalary !== null && p.minExpectedSalary !== undefined ? String(p.minExpectedSalary) : '',
        targetSalary: p.targetSalary !== null && p.targetSalary !== undefined ? String(p.targetSalary) : '',
        currency: p.currency || 'USD',
        noticePeriodDays: p.noticePeriodDays !== null && p.noticePeriodDays !== undefined ? String(p.noticePeriodDays) : '30',
        portfolioUrl: p.portfolioUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        githubUrl: p.githubUrl || '',
        targetRoles: p.targetRoles || [],
        skills: p.skills || [],
        workModePreferences: p.workModePreferences || ['REMOTE'],
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch('/users/profile', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccessMessage('Profile and compensation preferences saved successfully!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      name: formData.name || undefined,
      headline: formData.headline || undefined,
      bio: formData.bio || undefined,
      minExpectedSalary: formData.minExpectedSalary ? Number(formData.minExpectedSalary) : null,
      targetSalary: formData.targetSalary ? Number(formData.targetSalary) : null,
      currency: formData.currency,
      noticePeriodDays: formData.noticePeriodDays ? Number(formData.noticePeriodDays) : 30,
      portfolioUrl: formData.portfolioUrl || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      githubUrl: formData.githubUrl || undefined,
      targetRoles: formData.targetRoles,
      skills: formData.skills,
      workModePreferences: formData.workModePreferences,
    };

    updateProfileMutation.mutate(payload);
  };

  const addRole = () => {
    if (newRoleInput.trim() && !formData.targetRoles.includes(newRoleInput.trim())) {
      setFormData({
        ...formData,
        targetRoles: [...formData.targetRoles, newRoleInput.trim()],
      });
      setNewRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      targetRoles: formData.targetRoles.filter((r) => r !== role),
    });
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !formData.skills.includes(newSkillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkillInput.trim()],
      });
      setNewSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const toggleWorkMode = (mode: string) => {
    if (formData.workModePreferences.includes(mode)) {
      setFormData({
        ...formData,
        workModePreferences: formData.workModePreferences.filter((m) => m !== mode),
      });
    } else {
      setFormData({
        ...formData,
        workModePreferences: [...formData.workModePreferences, mode],
      });
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-[#1B59F8]" />
              <span>Career Settings & Compensation Preferences</span>
            </h1>
            <p className="text-xs text-[#848A95] mt-1">
              Configure your baseline target compensation, preferred roles, and profile attributes for AI match evaluation.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#2FEA9B]/15 border border-[#2FEA9B]/30 text-[#059669] text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Target Compensation Strategy */}
          <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFF0F6]">
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#151E23]">Global Target Compensation</h2>
                <p className="text-xs text-[#848A95]">
                  Used by Gemini Flash to calculate salary compatibility scores across all job posts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Minimum Acceptable Salary</label>
                <input
                  type="number"
                  value={formData.minExpectedSalary}
                  onChange={(e) => setFormData({ ...formData, minExpectedSalary: e.target.value })}
                  placeholder="e.g. 70000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Target / Ideal Salary</label>
                <input
                  type="number"
                  value={formData.targetSalary}
                  onChange={(e) => setFormData({ ...formData, targetSalary: e.target.value })}
                  placeholder="e.g. 95000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Preferred Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD (C$ - Canadian Dollar)</option>
                  <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                  <option value="AUD">AUD (A$ - Australian Dollar)</option>
                  <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Career Identity & Work Preferences */}
          <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFF0F6]">
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#151E23]">Candidate Identity & Work Preferences</h2>
                <p className="text-xs text-[#848A95]">Your primary target roles, headline, and availability</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Professional Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer • TypeScript / React / Node.js"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Notice Period (Days)</label>
                <input
                  type="number"
                  value={formData.noticePeriodDays}
                  onChange={(e) => setFormData({ ...formData, noticePeriodDays: e.target.value })}
                  placeholder="e.g. 30 (Immediate = 0)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23]">Work Mode Preferences</label>
                <div className="flex gap-2 pt-1">
                  {['REMOTE', 'HYBRID', 'ON_SITE'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleWorkMode(mode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.workModePreferences.includes(mode)
                          ? 'bg-[#1B59F8] text-white shadow-brand'
                          : 'bg-[#F9F9F9] border border-[#EFF0F6] text-[#848A95] hover:text-[#151E23]'
                      }`}
                    >
                      {mode.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Roles */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#151E23]">Target Job Roles</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.targetRoles.map((role, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] text-xs font-bold"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
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
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRole();
                    }
                  }}
                  placeholder="e.g. Senior Frontend Engineer, Staff Architect..."
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] flex-1 focus:border-[#1B59F8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addRole}
                  className="px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-xs font-bold text-white shadow-brand"
                >
                  + Add Role
                </button>
              </div>
            </div>

            {/* Core Skills */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#151E23]">Core Technical Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#2FEA9B]/15 border border-[#2FEA9B]/30 text-[#059669] text-xs font-bold"
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
                  placeholder="e.g. Next.js, PostgreSQL, Docker, TailwindCSS..."
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] flex-1 focus:border-[#1B59F8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-xs font-bold text-white shadow-brand"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Links & Portfolios */}
          <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFF0F6]">
              <div className="p-2 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#151E23]">Online Presence & Portfolios</h2>
                <p className="text-xs text-[#848A95]">Integrated into AI email generation and outreach</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23] flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23] flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-[#151E23]" />
                  <span>GitHub Profile</span>
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151E23] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#1B59F8]" />
                  <span>Portfolio Website</span>
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              {updateProfileMutation.isPending ? (
                <span>Saving Preferences...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Career Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
