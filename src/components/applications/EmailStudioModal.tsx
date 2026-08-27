'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  X,
  Mail,
  Copy,
  Check,
  Send,
  RotateCw,
  FileText,
  Clock,
  CheckCircle2,
  Sliders,
  MessageSquare,
  Zap,
  Briefcase,
  Code2,
  Coffee,
  Rocket,
  Target,
  Wand2,
} from 'lucide-react';
import api from '@/lib/api';

interface EmailStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const TONE_PRESETS = [
  {
    id: 'PROFESSIONAL',
    label: 'Professional',
    icon: Briefcase,
    description: 'Formal, polite, structured corporate outreach',
  },
  {
    id: 'CONFIDENT_IMPACT',
    label: 'Confident & Impact',
    icon: Zap,
    description: 'Metrics-driven, bold value proposition',
  },
  {
    id: 'SHORT_PUNCHY',
    label: 'Short & Punchy',
    icon: Target,
    description: 'Under 120 words, fast mobile reading',
  },
  {
    id: 'TECHNICAL_DEEP',
    label: 'Technical Deep-Dive',
    icon: Code2,
    description: 'Architecture, stack details, system design',
  },
  {
    id: 'CASUAL_FRIENDLY',
    label: 'Casual & Startup',
    icon: Coffee,
    description: 'Warm, conversational, approachable tone',
  },
  {
    id: 'ENTHUSIASTIC',
    label: 'Passionate / Mission',
    icon: Rocket,
    description: 'High energy, eager for company product',
  },
];

const SUGGESTION_CHIPS = [
  'Available to join immediately',
  'Focus primarily on Python & FastAPI',
  'Keep it strictly under 3 short paragraphs',
  'Highlight multi-tenant architecture experience',
  'Request a brief 10-minute intro call',
];

export function EmailStudioModal({ isOpen, onClose, application }: EmailStudioModalProps) {
  const queryClient = useQueryClient();

  const [emailType, setEmailType] = useState<
    'COLD_APPLICATION' | 'FOLLOW_UP_1' | 'FOLLOW_UP_2' | 'THANK_YOU_POST_INTERVIEW' | 'OFFER_NEGOTIATION'
  >('COLD_APPLICATION');
  
  const [selectedTone, setSelectedTone] = useState('PROFESSIONAL');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [recruiterName, setRecruiterName] = useState(
    application?.job?.recruiter?.name ||
      (application?.job?.company?.name ? `${application.job.company.name} Hiring Team` : '')
  );
  const [recipientEmail, setRecipientEmail] = useState(application?.job?.recruiter?.email || '');

  const [subject, setSubject] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Sync recipient details when application changes
  React.useEffect(() => {
    if (application?.job?.recruiter?.email) {
      setRecipientEmail(application.job.recruiter.email);
    }
    if (application?.job?.recruiter?.name) {
      setRecruiterName(application.job.recruiter.name);
    }
  }, [application]);

  // Generate Email mutation
  const generateMutation = useMutation({
    mutationFn: async (overrideInstructions?: string) => {
      const res = await api.post(`/applications/${application.id}/emails/generate`, {
        type: emailType,
        tone: selectedTone,
        customInstructions: overrideInstructions || customInstructions || undefined,
        recruiterName: recruiterName || undefined,
        recipientEmail: recipientEmail || undefined,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setSubject(data.subject);
      setBodyMarkdown(data.bodyMarkdown);
      setCurrentDraftId(data.id);
      if (data.recipientEmail && !recipientEmail) {
        setRecipientEmail(data.recipientEmail);
      }
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  // Save / Mark Sent mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (status: 'DRAFT' | 'SENT') => {
      if (!currentDraftId) return;
      await api.patch(`/applications/emails/${currentDraftId}`, {
        recipientName: recruiterName,
        recipientEmail,
        subject,
        bodyMarkdown,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    },
  });

  const handleOpenEmailClient = () => {
    if (!recipientEmail && !confirm('No recipient email specified. Open email client anyway?')) {
      return;
    }
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyMarkdown)}`;
    window.open(mailtoUrl, '_blank');
    saveDraftMutation.mutate('SENT');
  };

  const addSuggestion = (chip: string) => {
    setCustomInstructions((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  const handleQuickRefine = (instruction: string) => {
    const combined = customInstructions ? `${customInstructions}. Also: ${instruction}` : instruction;
    generateMutation.mutate(combined);
  };

  if (!isOpen || !application) return null;

  const copyToClipboard = (text: string, isSubject: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSubject) {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-[#EFF0F6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EFF0F6] flex items-center justify-between bg-[#F9F9F9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151E23] flex items-center gap-2">
                <span>AI Outreach & Cold Email Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B59F8]/10 text-[#1B59F8] font-mono font-bold">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-[#848A95] mt-0.5">
                {application.job?.title} @ {application.job?.company?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EFF0F6] text-[#848A95] hover:text-[#151E23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tone / Mood Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#151E23] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1B59F8]" />
              <span>Select Email Tone & Mood</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONE_PRESETS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#1B59F8]/10 border-[#1B59F8] text-[#1B59F8] shadow-xs'
                        : 'bg-white border-[#EFF0F6] text-[#151E23] hover:border-[#1B59F8]/30 hover:bg-[#F9F9F9]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? 'text-[#1B59F8]' : 'text-[#848A95]'}`} />
                    <div>
                      <p className="text-xs font-bold leading-tight">{t.label}</p>
                      <p className="text-[10px] text-[#848A95] line-clamp-1 mt-0.5">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9F9F9] p-4 rounded-2xl border border-[#EFF0F6]">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#151E23]">Email Objective</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
              >
                <option value="COLD_APPLICATION">Cold Application / Pitch</option>
                <option value="FOLLOW_UP_1">7-Day Follow-Up</option>
                <option value="FOLLOW_UP_2">14-Day Status Check</option>
                <option value="THANK_YOU_POST_INTERVIEW">Post-Interview Thank You</option>
                <option value="OFFER_NEGOTIATION">Offer Negotiation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#151E23]">Recruiter Name</label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Hiring Team"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#151E23] flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#1B59F8]" />
                <span>To: HR / Recipient</span>
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. hr@company.com"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] focus:border-[#1B59F8] focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Custom User Instructions (আমি যা চাই) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#151E23] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#1B59F8]" />
                <span>Custom Instructions / আমি যেমন চাই (Optional)</span>
              </label>
              <span className="text-[11px] text-[#848A95]">Tailor specific points for AI</span>
            </div>

            <textarea
              rows={2}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Mention I can start on-site immediately in Kawran Bazar, emphasize my FastAPI background, keep it friendly and short..."
              className="w-full p-3 rounded-xl bg-white border border-[#EFF0F6] text-xs text-[#151E23] placeholder:text-[#848A95] focus:border-[#1B59F8] focus:outline-none"
            />

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addSuggestion(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F2F7FF] hover:bg-[#1B59F8]/10 text-[#1B59F8] font-semibold border border-[#EFF0F6] transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Button */}
          <div>
            <button
              type="button"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1B59F8] hover:bg-[#1442B8] disabled:opacity-50 text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
            >
              <Sparkles className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              <span>
                {generateMutation.isPending
                  ? 'Generating Custom Email with Gemini...'
                  : subject
                  ? 'Regenerate Email with Selected Tone'
                  : 'Generate Personalized Email'}
              </span>
            </button>
          </div>

          {/* Generated Subject & Body */}
          {subject || bodyMarkdown ? (
            <div className="space-y-4 pt-1 border-t border-[#EFF0F6]">
              {/* Quick AI Refine Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[11px] font-bold text-[#848A95] flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-[#1B59F8]" />
                  <span>Quick Refine:</span>
                </span>
                <button
                  type="button"
                  disabled={generateMutation.isPending}
                  onClick={() => handleQuickRefine('Make it more concise and under 100 words')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F7FF] text-[#151E23] border border-[#EFF0F6] font-semibold"
                >
                  ✂️ Make Shorter
                </button>
                <button
                  type="button"
                  disabled={generateMutation.isPending}
                  onClick={() => handleQuickRefine('Focus heavily on core technical skills and architecture')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F7FF] text-[#151E23] border border-[#EFF0F6] font-semibold"
                >
                  💻 More Technical
                </button>
                <button
                  type="button"
                  disabled={generateMutation.isPending}
                  onClick={() => handleQuickRefine('Add a strong closing asking for a 10-minute Google Meet')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F7FF] text-[#151E23] border border-[#EFF0F6] font-semibold"
                >
                  📅 Add Meeting Request
                </button>
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#151E23]">Subject Line</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(subject, true)}
                    className="text-xs text-[#1B59F8] hover:text-[#1442B8] flex items-center gap-1 font-bold"
                  >
                    {copiedSubject ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSubject ? 'Copied!' : 'Copy Subject'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EFF0F6] text-xs font-semibold text-[#151E23] focus:border-[#1B59F8] focus:outline-none"
                />
              </div>

              {/* Email Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#151E23]">Message Body</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bodyMarkdown, false)}
                    className="text-xs text-[#1B59F8] hover:text-[#1442B8] flex items-center gap-1 font-bold"
                  >
                    {copiedBody ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBody ? 'Copied!' : 'Copy Body'}</span>
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={bodyMarkdown}
                  onChange={(e) => setBodyMarkdown(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] text-xs text-[#151E23] font-sans leading-relaxed focus:border-[#1B59F8] focus:outline-none whitespace-pre-wrap"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] text-center space-y-2">
              <Mail className="w-8 h-8 text-[#848A95] mx-auto" />
              <p className="text-xs font-bold text-[#151E23]">No email draft generated yet</p>
              <p className="text-[11px] text-[#848A95] max-w-sm mx-auto">
                Choose your preferred tone above, add any special requests, and click &ldquo;Generate Personalized Email&rdquo; to build your tailored message.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EFF0F6] bg-[#F9F9F9] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-[#151E23] text-xs font-bold border border-[#EFF0F6]"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {currentDraftId && (
              <>
                <button
                  type="button"
                  disabled={saveDraftMutation.isPending}
                  onClick={() => saveDraftMutation.mutate('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-xs font-bold text-[#151E23] border border-[#EFF0F6]"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={saveDraftMutation.isPending}
                  onClick={() => saveDraftMutation.mutate('SENT')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F7FF] text-[#151E23] text-xs font-bold border border-[#EFF0F6]"
                >
                  Mark as Sent
                </button>

                <button
                  type="button"
                  disabled={saveDraftMutation.isPending}
                  onClick={handleOpenEmailClient}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Email Client {recipientEmail ? `(${recipientEmail})` : ''}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
