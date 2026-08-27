'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Star,
  Trash2,
  Sparkles,
  Calendar,
  Building,
  GraduationCap,
  Award,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';

export default function CvVaultPage() {
  const queryClient = useQueryClient();
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch all user CVs
  const { data: cvs = [], isLoading } = useQuery({
    queryKey: ['cvs'],
    queryFn: async () => {
      const res = await api.get('/cv');
      return res.data.data;
    },
  });

  // Set Primary CV mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (cvId: string) => {
      await api.patch(`/cv/${cvId}/primary`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Delete CV mutation
  const deleteCvMutation = useMutation({
    mutationFn: async (cvId: string) => {
      await api.delete(`/cv/${cvId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      if (selectedCvId) setSelectedCvId(null);
    },
  });

  // Handle dropzone file upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      setSelectedCvId(res.data.data.id);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload and parse CV');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Active CV selection (defaults to primary or first)
  const activeCv = selectedCvId
    ? cvs.find((c: any) => c.id === selectedCvId)
    : cvs.find((c: any) => c.isPrimary) || cvs[0];

  const latestVersion = activeCv?.versions?.[0];
  const parsed = latestVersion?.parsedData;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#151E23] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#1B59F8]" />
              <span>Smart CV Vault</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B59F8]/10 border border-[#1B59F8]/20 text-[#1B59F8] font-mono font-bold">
                Gemini Flash Parser
              </span>
            </h1>
            <p className="text-xs text-[#848A95] mt-1">
              Upload multiple resume versions. Gemini Flash parses your skills and work history once for sub-second job matching.
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-[#1B59F8] bg-[#1B59F8]/5 scale-[1.01]'
              : 'border-[#EFF0F6] hover:border-[#1B59F8]/40 bg-white hover:bg-[#F2F7FF]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#1B59F8]/10 border border-[#1B59F8]/20 flex items-center justify-center mx-auto text-[#1B59F8]">
              <UploadCloud className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#151E23]">
                {isUploading
                  ? '⚡ Extracting and parsing with Gemini Flash...'
                  : 'Drag & drop your CV or click to browse'}
              </p>
              <p className="text-xs text-[#848A95] mt-0.5">Supports PDF, DOCX, and TXT (up to 10MB)</p>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#FF3E13] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* CVs Grid and Detailed Profile View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: CV List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#848A95] px-1">
              Your Resumes ({cvs.length})
            </h3>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#848A95]">Loading CV Vault...</div>
            ) : cvs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#EFF0F6] text-center text-xs text-[#848A95]">
                No resumes uploaded yet. Upload your first CV above.
              </div>
            ) : (
              cvs.map((cv: any) => {
                const isSelected = activeCv?.id === cv.id;
                return (
                  <div
                    key={cv.id}
                    onClick={() => setSelectedCvId(cv.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#1B59F8] shadow-md shadow-[#1B59F8]/10'
                        : 'bg-white border-[#EFF0F6] hover:border-[#1B59F8]/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2.5 rounded-xl bg-[#1B59F8]/10 text-[#1B59F8] flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-[#151E23] truncate">{cv.title}</p>
                          <p className="text-[11px] text-[#848A95]">v{cv.currentVersion} • {cv.versions?.[0]?.fileName}</p>
                        </div>
                      </div>
                      {cv.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2FEA9B]/15 border border-[#2FEA9B]/30 text-[#059669] text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-[#059669]" /> Primary
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#EFF0F6] flex items-center justify-between text-xs">
                      {!cv.isPrimary ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryMutation.mutate(cv.id);
                          }}
                          className="text-xs text-[#1B59F8] hover:text-[#1442B8] font-bold"
                        >
                          Set as Primary
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#848A95]">Default for Matching</span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this CV?')) {
                            deleteCvMutation.mutate(cv.id);
                          }
                        }}
                        className="text-xs text-[#848A95] hover:text-[#FF3E13] p-1 transition-colors"
                        title="Delete CV"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Parsed Resume Details */}
          <div className="lg:col-span-8 space-y-4">
            {activeCv && parsed ? (
              <div className="rounded-2xl bg-white border border-[#EFF0F6] p-6 space-y-6 shadow-card">
                {/* Header Profile Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFF0F6]">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#151E23]">{parsed.fullName || activeCv.title}</h2>
                    <p className="text-xs text-[#1B59F8] font-bold mt-0.5">{parsed.headline || 'Candidate Profile'}</p>
                    <p className="text-xs text-[#848A95] mt-1">{parsed.location || 'Location Not Specified'} • {parsed.email || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-xl bg-[#F9F9F9] border border-[#EFF0F6] text-[#4D4D4D] font-bold">
                      Version {activeCv.currentVersion}
                    </span>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-[#1B59F8] hover:bg-[#1442B8] text-white text-xs font-bold shadow-brand transition-all"
                      title="Match this CV with opportunities in Job Vault"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Match With Jobs</span>
                    </Link>
                  </div>
                </div>

                {/* Summary */}
                {parsed.summary && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#848A95] mb-1.5">Summary</h4>
                    <p className="text-xs text-[#4D4D4D] leading-relaxed bg-[#F9F9F9] p-4 rounded-2xl border border-[#EFF0F6]">
                      {parsed.summary}
                    </p>
                  </div>
                )}

                {/* Extracted Skills */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#848A95] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B59F8]" />
                    <span>Primary Skills & Tech Stack ({parsed.primarySkills?.length || 0}) • Click to find jobs</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.primarySkills?.map((skill: string, i: number) => (
                      <Link
                        key={i}
                        href={`/jobs?search=${encodeURIComponent(skill)}`}
                        className="px-3 py-1 rounded-xl bg-[#1B59F8]/10 hover:bg-[#1B59F8]/20 border border-[#1B59F8]/20 text-[#1B59F8] text-xs font-bold transition-colors cursor-pointer"
                        title={`Search jobs requiring ${skill}`}
                      >
                        {skill}
                      </Link>
                    ))}
                    {parsed.toolsAndFrameworks?.map((tool: string, i: number) => (
                      <Link
                        key={i}
                        href={`/jobs?search=${encodeURIComponent(tool)}`}
                        className="px-3 py-1 rounded-xl bg-[#F9F9F9] hover:bg-[#F2F7FF] border border-[#EFF0F6] text-[#4D4D4D] hover:text-[#1B59F8] text-xs font-medium transition-colors cursor-pointer"
                        title={`Search jobs requiring ${tool}`}
                      >
                        {tool}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                {parsed.experience && parsed.experience.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#848A95] mb-3 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#1B59F8]" />
                      <span>Experience Timeline</span>
                    </h4>
                    <div className="space-y-3">
                      {parsed.experience.map((exp: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-[#151E23]">{exp.role}</p>
                            <span className="text-[11px] text-[#848A95] font-mono font-semibold">
                              {exp.startDate || 'Past'} - {exp.isCurrent ? 'Present' : exp.endDate || 'Past'}
                            </span>
                          </div>
                          <p className="text-xs text-[#1B59F8] font-bold">{exp.company}</p>
                          {exp.description && <p className="text-xs text-[#848A95] mt-1">{exp.description}</p>}
                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-[#4D4D4D] space-y-0.5 mt-1">
                              {exp.highlights.map((hl: string, j: number) => (
                                <li key={j}>{hl}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {parsed.education && parsed.education.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#848A95] mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Education</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parsed.education.map((edu: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EFF0F6] text-xs">
                          <p className="font-bold text-[#151E23]">{edu.degree}</p>
                          <p className="text-[#059669] font-bold mt-0.5">{edu.institution}</p>
                          {edu.fieldOfStudy && <p className="text-[#848A95] mt-0.5">{edu.fieldOfStudy}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-[#EFF0F6] text-center space-y-2 shadow-card">
                <FileText className="w-10 h-10 text-[#848A95] mx-auto" />
                <p className="text-sm font-bold text-[#151E23]">Select a CV to view parsed intelligence</p>
                <p className="text-xs text-[#848A95]">Parsed skills, roles, and dates will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

