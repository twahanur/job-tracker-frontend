'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building,
  Plus,
  Search,
  ExternalLink,
  Mail,
  Linkedin,
  Phone,
  Briefcase,
  Globe,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';

export default function NetworkCrmPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'companies' | 'recruiters'>('companies');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddRecruiterOpen, setIsAddRecruiterOpen] = useState(false);

  // Forms state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    websiteUrl: '',
    industry: '',
    companySize: '',
    headquarters: '',
    notes: '',
  });

  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    companyId: '',
    roleTitle: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    notes: '',
  });

  // Queries
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/crm/companies');
      return res.data.data;
    },
  });

  const { data: recruiters = [], isLoading: isLoadingRecruiters } = useQuery({
    queryKey: ['recruiters'],
    queryFn: async () => {
      const res = await api.get('/crm/recruiters');
      return res.data.data;
    },
  });

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/crm/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddCompanyOpen(false);
      setCompanyForm({
        name: '',
        websiteUrl: '',
        industry: '',
        companySize: '',
        headquarters: '',
        notes: '',
      });
    },
  });

  const createRecruiterMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/crm/recruiters', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters'] });
      setIsAddRecruiterOpen(false);
      setRecruiterForm({
        name: '',
        companyId: '',
        roleTitle: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        notes: '',
      });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crm/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const deleteRecruiterMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crm/recruiters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters'] });
    },
  });

  // Filtered lists
  const filteredCompanies = companies.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.headquarters?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecruiters = recruiters.filter((r: any) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roleTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1B59F8]" />
              <span>Target CRM & Recruiter Directory</span>
            </h1>
            <p className="text-xs text-[#848A95] mt-1">
              Maintain relationship logs with tech recruiters, hiring managers, and dream companies for personalized cold outreach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddRecruiterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recruiter</span>
            </button>
            <button
              onClick={() => setIsAddCompanyOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F2F7FF] text-[#151E23] text-xs font-bold border border-[#EFF0F6] shadow-xs transition-colors"
            >
              <Building className="w-4 h-4 text-[#1B59F8]" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EFF0F6] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'companies'
                  ? 'bg-[#1B59F8] text-white shadow-brand'
                  : 'bg-white border border-[#EFF0F6] text-[#848A95] hover:text-[#151E23]'
              }`}
            >
              Dream Companies ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recruiters'
                  ? 'bg-[#1B59F8] text-white shadow-brand'
                  : 'bg-white border border-[#EFF0F6] text-[#848A95] hover:text-[#151E23]'
              }`}
            >
              Recruiter Contacts ({recruiters.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#848A95] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'companies' ? 'Search companies...' : 'Search recruiters...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] placeholder:text-[#848A95] focus:outline-none focus:border-[#1B59F8] shadow-xs"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCompanies ? (
              <div className="col-span-full p-12 text-center text-xs text-[#848A95]">Loading companies...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-2">
                <Building className="w-8 h-8 text-[#848A95] mx-auto" />
                <p className="text-sm font-bold text-[#151E23]">No dream companies found</p>
                <p className="text-xs text-[#848A95]">Add your target firms to track contacts and open positions.</p>
              </div>
            ) : (
              filteredCompanies.map((company: any) => (
                <div
                  key={company.id}
                  className="rounded-2xl bg-white border border-[#EFF0F6] p-5 space-y-4 shadow-card hover:border-[#1B59F8]/30 hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#151E23] group-hover:text-[#1B59F8] transition-colors">
                        {company.name}
                      </h3>
                      {company.industry && (
                        <p className="text-xs text-[#848A95] font-semibold mt-0.5">{company.industry}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {company.websiteUrl && (
                        <a
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-[#F2F7FF] text-[#848A95] hover:text-[#1B59F8] transition-colors"
                          title="Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this company?')) {
                            deleteCompanyMutation.mutate(company.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#848A95] hover:text-[#FF3E13] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#848A95]">
                    {company.headquarters && (
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#151E23]">Location:</span>
                        <span>{company.headquarters}</span>
                      </p>
                    )}
                    {company.companySize && (
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#151E23]">Size:</span>
                        <span>{company.companySize} employees</span>
                      </p>
                    )}
                  </div>

                  {company.notes && (
                    <p className="text-xs text-[#4D4D4D] leading-relaxed bg-[#F9F9F9] p-3 rounded-xl border border-[#EFF0F6]">
                      {company.notes}
                    </p>
                  )}

                  <div className="pt-3 border-t border-[#EFF0F6] flex items-center justify-between text-xs font-bold">
                    <Link
                      href={`/jobs?search=${encodeURIComponent(company.name)}`}
                      className="text-[#1B59F8] hover:underline flex items-center gap-1"
                      title="View all tracked jobs for this company"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{company._count?.jobs || 0} Tracked Jobs</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('recruiters');
                        setSearchQuery(company.name);
                      }}
                      className="text-[#848A95] hover:text-[#1B59F8] transition-colors cursor-pointer"
                    >
                      {company._count?.recruiters || 0} Contacts
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recruiters Grid */}
        {activeTab === 'recruiters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingRecruiters ? (
              <div className="col-span-full p-12 text-center text-xs text-[#848A95]">Loading recruiters...</div>
            ) : filteredRecruiters.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-[#EFF0F6] shadow-card space-y-2">
                <Users className="w-8 h-8 text-[#848A95] mx-auto" />
                <p className="text-sm font-bold text-[#151E23]">No recruiters found</p>
                <p className="text-xs text-[#848A95]">Add hiring managers and recruiters to streamline cold outreach.</p>
              </div>
            ) : (
              filteredRecruiters.map((recruiter: any) => (
                <div
                  key={recruiter.id}
                  className="rounded-2xl bg-white border border-[#EFF0F6] p-5 space-y-4 shadow-card hover:border-[#1B59F8]/30 hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#151E23] group-hover:text-[#1B59F8] transition-colors">
                        {recruiter.name}
                      </h3>
                      <p className="text-xs text-[#848A95] font-semibold mt-0.5">{recruiter.roleTitle || 'Recruiter'}</p>
                      {recruiter.company?.name && (
                        <Link
                          href={`/jobs?search=${encodeURIComponent(recruiter.company.name)}`}
                          className="text-xs text-[#1B59F8] font-bold flex items-center gap-1 mt-0.5 hover:underline"
                          title="View company jobs in Job Vault"
                        >
                          <Building className="w-3 h-3 text-[#1B59F8]" />
                          <span>{recruiter.company.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Delete this recruiter contact?')) {
                          deleteRecruiterMutation.mutate(recruiter.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-[#848A95] hover:text-[#FF3E13] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {recruiter.notes && (
                    <p className="text-xs text-[#4D4D4D] leading-relaxed bg-[#F9F9F9] p-3 rounded-xl border border-[#EFF0F6]">
                      {recruiter.notes}
                    </p>
                  )}

                  <div className="pt-3 border-t border-[#EFF0F6] flex items-center justify-between text-xs">
                    {recruiter.email ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${recruiter.email}?subject=Inquiry regarding software engineering opportunities at ${recruiter.company?.name || 'your company'}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8] text-[#1B59F8] hover:text-white font-bold transition-all"
                          title="Send Email / Outreach"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Email</span>
                        </a>
                        <span className="text-[11px] text-[#848A95] truncate max-w-[120px]">{recruiter.email}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#848A95]">No email provided</span>
                    )}

                    {recruiter.linkedinUrl && (
                      <a
                        href={recruiter.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#1B59F8]/10 hover:bg-[#1B59F8] text-[#1B59F8] hover:text-white transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal: Add Company */}
        {isAddCompanyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFF0F6]">
                <h3 className="text-base font-bold text-[#151E23] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1B59F8]" />
                  <span>Add Dream Company</span>
                </h3>
                <button
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="p-1 rounded-lg text-[#848A95] hover:text-[#151E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createCompanyMutation.mutate(companyForm);
                }}
                className="space-y-3 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. Stripe"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[#151E23] font-bold">Industry</label>
                    <input
                      type="text"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      placeholder="e.g. Fintech"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#151E23] font-bold">Headquarters</label>
                    <input
                      type="text"
                      value={companyForm.headquarters}
                      onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Website URL</label>
                  <input
                    type="url"
                    value={companyForm.websiteUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                    placeholder="https://stripe.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Notes</label>
                  <textarea
                    rows={3}
                    value={companyForm.notes}
                    onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                    placeholder="Targeting Series B+ or specific engineering departments..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFF0F6]">
                  <button
                    type="button"
                    onClick={() => setIsAddCompanyOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-[#151E23] border border-[#EFF0F6] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCompanyMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] font-bold text-white shadow-brand"
                  >
                    {createCompanyMutation.isPending ? 'Saving...' : 'Add Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Recruiter */}
        {isAddRecruiterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFF0F6]">
                <h3 className="text-base font-bold text-[#151E23] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1B59F8]" />
                  <span>Add Recruiter Contact</span>
                </h3>
                <button
                  onClick={() => setIsAddRecruiterOpen(false)}
                  className="p-1 rounded-lg text-[#848A95] hover:text-[#151E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createRecruiterMutation.mutate(recruiterForm);
                }}
                className="space-y-3 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Recruiter Full Name *</label>
                  <input
                    type="text"
                    required
                    value={recruiterForm.name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Associated Company</label>
                  <select
                    value={recruiterForm.companyId}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, companyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  >
                    <option value="">-- Select Company (Optional) --</option>
                    {companies.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#151E23] font-bold">Role / Title</label>
                  <input
                    type="text"
                    value={recruiterForm.roleTitle}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, roleTitle: e.target.value })}
                    placeholder="e.g. Lead Technical Recruiter"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[#151E23] font-bold">Email</label>
                    <input
                      type="email"
                      value={recruiterForm.email}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                      placeholder="sarah@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#151E23] font-bold">LinkedIn URL</label>
                    <input
                      type="url"
                      value={recruiterForm.linkedinUrl}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFF0F6]">
                  <button
                    type="button"
                    onClick={() => setIsAddRecruiterOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-[#151E23] border border-[#EFF0F6] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createRecruiterMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] font-bold text-white shadow-brand"
                  >
                    {createRecruiterMutation.isPending ? 'Saving...' : 'Add Recruiter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
