'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  DollarSign,
  Kanban,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building,
  Briefcase,
} from 'lucide-react';
import api from '@/lib/api';

interface EditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export function EditApplicationModal({ isOpen, onClose, application }: EditApplicationModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    status: 'SAVED',
    expectedSalary: '',
    salaryCurrency: 'USD',
    portalUrl: '',
    applicationNotes: '',
  });

  useEffect(() => {
    if (application) {
      setFormData({
        status: application.status || 'SAVED',
        expectedSalary:
          application.expectedSalary !== null && application.expectedSalary !== undefined
            ? String(application.expectedSalary)
            : '',
        salaryCurrency: application.salaryCurrency || 'USD',
        portalUrl: application.portalUrl || application.job?.sourceUrl || '',
        applicationNotes: application.applicationNotes || '',
      });
      setErrorMessage(null);
    }
  }, [application, isOpen]);

  const updateDetailsMutation = useMutation({
    mutationFn: async (payload: any) => {
      // If status changed, update status first or update details
      if (payload.status && payload.status !== application.status) {
        await api.patch(`/applications/${application.id}/status`, {
          status: payload.status,
          notes: payload.applicationNotes || undefined,
        });
      }
      const res = await api.patch(`/applications/${application.id}`, {
        expectedSalary: payload.expectedSalary ? Number(payload.expectedSalary) : null,
        salaryCurrency: payload.salaryCurrency,
        portalUrl: payload.portalUrl || undefined,
        applicationNotes: payload.applicationNotes || undefined,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job', application?.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update application details');
    },
  });

  if (!isOpen || !application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    updateDetailsMutation.mutate({
      status: formData.status,
      expectedSalary: formData.expectedSalary,
      salaryCurrency: formData.salaryCurrency,
      portalUrl: formData.portalUrl,
      applicationNotes: formData.applicationNotes,
    });
  };

  const job = application.job;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EFF0F6] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#EFF0F6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1B59F8]/10 text-[#1B59F8]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#151E23]">Expected Salary & Stage</h2>
              <p className="text-xs text-[#848A95] truncate max-w-xs">
                {job?.title} • {job?.company?.name || 'Company'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151E23]">Expected Target Salary</label>
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
                value={formData.salaryCurrency}
                onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#151E23]">Pipeline Stage</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
            >
              <option value="SAVED">Saved & Matched</option>
              <option value="APPLIED">Applied</option>
              <option value="PHONE_SCREEN">Screening / HR Phone Call</option>
              <option value="TECHNICAL_ASSESSMENT">Technical Assessment</option>
              <option value="FIRST_ROUND_INTERVIEW">Final Round Interview</option>
              <option value="OFFER_RECEIVED">Offer Received 🏆</option>
              <option value="OFFER_ACCEPTED">Offer Accepted ✅</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
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
            <label className="text-xs font-bold text-[#151E23]">Application Notes</label>
            <textarea
              rows={3}
              value={formData.applicationNotes}
              onChange={(e) => setFormData({ ...formData, applicationNotes: e.target.value })}
              placeholder="Notes on referral, recruiter discussions, or interview takeaways..."
              className="w-full p-3 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFF0F6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateDetailsMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              {updateDetailsMutation.isPending ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
