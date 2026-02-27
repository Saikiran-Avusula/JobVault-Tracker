import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ChevronLeft, Trash2,
    CalendarCheck, AlignLeft, FileText, Tag,
    Clock, Plus, Globe,
    FileEdit, Laptop, Calendar, Sparkles, Check
} from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { formatLocalTime } from '../lib/utils'
import type { JobStatus } from '../types/job'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'


const STAGES: JobStatus[] = ['Applied', 'OA', 'Interview', 'Offer']

export default function ApplicationDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { applications, loading, updateApplication, moveToTrash, uploadResume } = useJobStore()

    const app = applications.find(a => a.id === id)
    const [isEditingJD, setIsEditingJD] = useState(false)
    const [tempJd, setTempJd] = useState('')
    const [isEditingUrl, setIsEditingUrl] = useState(false)
    const [tempUrl, setTempUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [showPdfViewer, setShowPdfViewer] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showResumeConfirm, setShowResumeConfirm] = useState(false)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading application...</p>
            </div>
        )
    }

    if (!app) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <p className="text-gray-500 mb-4">Application not found</p>
                <button onClick={() => navigate('/applications')} className="px-5 py-2 rounded-full bg-primary-900/20 text-primary-400 font-bold hover:bg-primary-900/40 transition-colors">Back to Applications</button>
            </div>
        )
    }

    const currentStatus = app.status
    const currentStageIndex = STAGES.indexOf(currentStatus as any)

    const handleUpdateStatus = (status: JobStatus) => {
        if (status === app.status) return
        updateApplication(app.id, { status })
        toast.success(`Moved to ${status}`)
    }

    const handleDelete = async () => {
        await moveToTrash(app.id, true)
        navigate('/applications')
        toast.success(`Application moved to Trash`)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#020617]/95 backdrop-blur-md py-3 -mx-4 px-4 mb-4 flex items-center justify-between border-b border-gray-800/50 md:relative md:top-auto md:bg-transparent md:p-0 md:m-0 md:mb-8 md:border-none">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider bg-gray-900 border border-gray-800 text-gray-400 hover:text-primary-500 transition-all shadow-sm"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                    <Trash2 size={16} /> <span className="hidden sm:inline">Delete Application</span><span className="sm:hidden">Delete</span>
                </button>
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Move to Trash?"
                description="This application will be moved to your Trash bin. You can restore it later if needed."
                confirmText="Move to Trash"
            />

            <div className="bg-[#020617] rounded-[2.5rem] border border-gray-800/50 shadow-premium p-6 md:p-10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gray-800/40 flex items-center justify-center text-4xl md:text-5xl shadow-inner border border-gray-800 transition-transform hover:scale-105 duration-500 shrink-0">🏢</div>
                        <div className="min-w-0">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight truncate">{app.company}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 md:gap-3 mt-2">
                                <p className="text-base md:text-lg font-bold text-gray-500">{app.role}</p>
                                {app.application_url && (
                                    <>
                                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-gray-800" />
                                        <a
                                            href={app.application_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-primary-400 hover:text-primary-300 transition-colors text-sm font-bold"
                                        >
                                            <Globe size={14} />
                                            Visit Link
                                        </a>
                                    </>
                                )}
                                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-gray-800" />
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                    <Clock size={12} className="text-primary-400" />
                                    {app.updated_at && app.updated_at !== app.applied_date ? 'Modified: ' : 'Applied: '}
                                    {formatLocalTime(app.updated_at || app.applied_date)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6 overflow-hidden">
                        <div className="flex items-center gap-1.5 p-1.5 bg-gray-800/30 rounded-full border border-gray-800 overflow-x-auto max-w-full scrollbar-hide no-scrollbar">
                            {['Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'].map((s) => {
                                const isSel = currentStatus === s
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(s as any)}
                                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border-none outline-none ring-0 whitespace-nowrap
                                            ${isSel
                                                ? 'bg-gray-700 text-primary-400 shadow-float'
                                                : 'text-gray-500 hover:text-gray-200'}`}
                                    >
                                        {s}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Pipeline Stepper */}
                {currentStageIndex === -1 ? (
                    <div className="bg-[#020617] rounded-[2rem] border border-rose-500/20 shadow-premium p-5 md:p-8 flex items-center justify-center text-center">
                        <div>
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-2xl md:text-4xl mx-auto mb-4 md:mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-bounce-slow">💪</div>
                            <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3">Every "No" Brings You Closer to a "Yes"</h3>
                            <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                                Resilience is the most important skill in your career. Don't let this outcome define your journey. Take a breath, dust yourself off, and crack the next one! You've got this.
                            </p>
                            <button onClick={() => navigate('/applications')} className="mt-6 md:mt-8 px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300">
                                Find Next Opportunity
                            </button>
                        </div>
                    </div>
                ) : (
                    // Job Progress
                    <div className="bg-[#020617] rounded-[2rem] border border-gray-800/50 shadow-premium p-5 md:p-10 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                            <h3 className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em] text-gray-400">Job Progress</h3>
                            <div className="flex items-baseline gap-1 bg-primary-500/10 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-primary-500/20">
                                <span className="text-base md:text-lg font-black text-primary-400">{Math.round(((currentStageIndex + 1) / STAGES.length) * 100)}</span>
                                <span className="text-[10px] md:text-xs font-bold text-primary-500 uppercase tracking-widest">% Completed</span>
                            </div>
                        </div>

                        <div className="relative mb-6 md:mb-2 mt-4">
                            {/* Background bar */}
                            <div className="absolute top-1/2 left-2 md:left-4 right-2 md:right-4 h-1 md:h-1.5 bg-gray-800/80 -translate-y-1/2 rounded-full z-0" />
                            {/* Fill bar */}
                            <div
                                className={`absolute top-1/2 left-2 md:left-4 h-1 md:h-1.5 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out z-0
                                    ${currentStageIndex > 0 ? 'bg-gradient-to-r from-emerald-500 to-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}
                                style={{ width: `calc(${(currentStageIndex / (STAGES.length - 1)) * 100}% - 32px)` }}
                            />

                            <div className="relative flex justify-between items-center px-0 md:px-4 z-10 w-full">
                                {STAGES.map((s, idx) => {
                                    const isPast = idx < currentStageIndex
                                    const isCurr = idx === currentStageIndex

                                    // Make Offer step green if it is the current step (meaning 100% complete)
                                    const isCompletedOffer = s === 'Offer' && isCurr;

                                    const config: Record<string, { icon: any }> = {
                                        'Applied': { icon: FileEdit },
                                        'OA': { icon: Laptop },
                                        'Interview': { icon: Calendar },
                                        'Offer': { icon: isCompletedOffer ? Check : Sparkles },
                                    }
                                    const Icon = config[s].icon

                                    return (
                                        <div key={s} className="flex flex-col items-center justify-center z-10 transition-all duration-300 relative">
                                            <div
                                                className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 border-[3px] md:border-4 bg-[#020617] relative z-10
                                                    ${isCompletedOffer
                                                        ? 'border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-[3px] md:ring-4 ring-emerald-500/20 scale-110'
                                                        : isCurr
                                                            ? 'border-primary-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] ring-[3px] md:ring-4 ring-primary-500/20 scale-110'
                                                            : isPast
                                                                ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                                : 'border-gray-800 text-gray-700'}`}
                                            >
                                                <Icon className={`w-4 h-4 md:w-6 md:h-6 relative z-10 ${isCurr || isCompletedOffer ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : isPast ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                            </div>
                                            <div className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 flex justify-center w-24 md:w-32">
                                                <span className={`text-[8.5px] md:text-[11px] font-black tracking-widest transition-colors duration-300 text-center
                                                    ${isCompletedOffer ? 'text-emerald-400' : isCurr ? 'text-white' : isPast ? 'text-emerald-500' : 'text-gray-600'}`}>
                                                    {s.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        {/* JD */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <AlignLeft size={14} /> Job Description
                                </h3>
                                {isEditingJD ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEditingJD(false)}
                                            className="text-[11px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateApplication(app.id, { jd_text: tempJd })
                                                setIsEditingJD(false)
                                                toast.success('Job description updated')
                                            }}
                                            className="text-[11px] font-bold text-primary-500 hover:text-primary-400 uppercase tracking-widest bg-primary-500/10 px-3 py-1.5 rounded-full"
                                        >
                                            Done
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setTempJd(app.jd_text || '')
                                            setIsEditingJD(true)
                                        }}
                                        className="text-[11px] font-bold text-primary-500 hover:text-primary-600 uppercase tracking-widest"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {isEditingJD ? (
                                <textarea
                                    className="w-full p-5 bg-gray-900 border border-primary-500/30 rounded-2xl text-sm text-gray-300 outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-mono leading-relaxed resize-none overflow-hidden"
                                    style={{ minHeight: '250px' }}
                                    value={tempJd}
                                    onChange={(e) => setTempJd(e.target.value)}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    ref={(textarea) => {
                                        if (textarea) {
                                            textarea.style.height = 'auto';
                                            textarea.style.height = `${textarea.scrollHeight}px`;
                                        }
                                    }}
                                    placeholder="Paste job description here..."
                                />
                            ) : (
                                <div className="bg-gray-900 rounded-2xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono min-h-[200px] border border-gray-800 transition-colors break-words overflow-hidden">
                                    {app.jd_text || 'No description provided.'}
                                </div>
                            )}
                        </section>

                    </div>

                    <div className="space-y-8">
                        {/* Application URL */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Globe size={14} /> Application URL
                                </h3>
                            </div>
                            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 transition-colors">
                                {isEditingUrl ? (
                                    <div className="flex flex-col gap-3">
                                        <input
                                            autoFocus
                                            value={tempUrl}
                                            onChange={e => setTempUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setIsEditingUrl(false)}
                                                className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    updateApplication(app.id, { application_url: tempUrl.trim() || undefined })
                                                    setIsEditingUrl(false)
                                                }}
                                                className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : app.application_url ? (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-primary-900/20 flex items-center justify-center text-primary-500 shrink-0">
                                                <Globe size={20} />
                                            </div>
                                            <a
                                                href={app.application_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors truncate"
                                            >
                                                {app.application_url}
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setTempUrl(app.application_url!)
                                                setIsEditingUrl(true)
                                            }}
                                            className="text-[11px] font-bold text-gray-400 hover:text-white uppercase tracking-widest shrink-0"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400 italic">No application URL provided.</p>
                                        <button
                                            onClick={() => {
                                                setTempUrl('')
                                                setIsEditingUrl(true)
                                            }}
                                            className="text-[11px] font-bold text-primary-500 hover:text-primary-600 uppercase tracking-widest"
                                        >
                                            Add URL
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Resume */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <FileText size={14} /> Tailored Resume
                                    </h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium ml-5">Max file size: 5MB (.pdf)</p>
                                </div>
                                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[11px] font-bold cursor-pointer hover:bg-primary-100 transition-colors border border-primary-100 dark:border-primary-900/30">
                                    {isUploading ? (
                                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> Uploading...</span>
                                    ) : (
                                        <>
                                            <Plus size={12} />
                                            {app.resume_file_name ? 'Change' : 'Upload PDF'}
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                if (file.type !== 'application/pdf') {
                                                    toast.error('Please upload a PDF file')
                                                    return
                                                }
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('File size must be less than 5MB')
                                                    return
                                                }
                                                setIsUploading(true)
                                                try {
                                                    await uploadResume(app.id, file)
                                                    toast.success(`Uploaded: ${file.name}`)
                                                } catch (error) {
                                                    toast.error('Failed to upload file')
                                                } finally {
                                                    setIsUploading(false)
                                                }
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 transition-colors">
                                {app.resume_file_name ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-sm group/resume">
                                            <div className="w-10 h-10 rounded-lg bg-rose-900/20 flex items-center justify-center text-rose-500 shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{app.resume_file_name}</p>
                                                <p className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">Uploaded Resume</p>
                                            </div>
                                            <button
                                                onClick={() => setShowResumeConfirm(true)}
                                                className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover/resume:opacity-100 shrink-0"
                                                title="Remove Resume"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {app.resume_text && app.resume_text.startsWith('http') && (
                                            <button
                                                onClick={() => setShowPdfViewer(true)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-bold text-white transition-colors mt-2"
                                            >
                                                <FileText size={16} /> View Document
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No file uploaded yet. Upload the tailored resume PDF used for this role.</p>
                                )}
                            </div>
                        </section>

                        {/* Skill Gaps */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Tag size={14} /> Skill Gaps to Close
                                </h3>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 transition-colors">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {app.skill_gaps.map((skill: string, i: number) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold group border border-orange-100 dark:border-orange-800/50">
                                            {skill}
                                            <button onClick={() => updateApplication(app.id, { skill_gaps: app.skill_gaps.filter((s: string) => s !== skill) })} className="hover:text-orange-800 dark:hover:text-orange-200 transition-colors opacity-50 hover:opacity-100">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <AddSkillInput onAdd={(skill) => updateApplication(app.id, { skill_gaps: [...app.skill_gaps, skill] })} />
                                </div>
                            </div>
                        </section>

                        {/* Notes */}
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                <CalendarCheck size={14} /> Interview Notes
                            </h3>
                            <textarea
                                className="w-full p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all min-h-[150px] resize-none"
                                placeholder="Add recruiter info, questions asked, or impressions..."
                                value={app.notes}
                                onChange={(e) => updateApplication(app.id, { notes: e.target.value })}
                            />
                        </section>
                    </div>
                </div>
            </div >

            <ConfirmModal
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Move to Trash?"
                description="This application will be moved to your Trash bin. You can restore it later if needed."
                confirmText="Move to Trash"
            />

            <ConfirmModal
                open={showResumeConfirm}
                onClose={() => setShowResumeConfirm(false)}
                onConfirm={() => {
                    updateApplication(app.id, { resume_file_name: undefined, resume_text: undefined })
                    toast.success('Resume removed')
                }}
                title="Remove Resume?"
                description={`This will remove the tailored resume for ${app.company}. You can upload a new one at any time.`}
                confirmText="Remove Resume"
            />

            {/* PDF Viewer Modal */}
            {showPdfViewer && app.resume_text && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl h-[90vh] bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-900/20 flex items-center justify-center text-rose-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white truncate max-w-[300px]">{app.resume_file_name}</h2>
                                    <p className="text-xs text-gray-400">Tailored Resume for {app.company}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPdfViewer(false)}
                                className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-950 p-4">
                            <iframe
                                src={app.resume_text}
                                className="w-full h-full rounded-xl bg-white"
                                title="Resume PDF Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AddSkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
    const [val, setVal] = useState('')
    return (
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg pr-2 border border-transparent focus-within:border-gray-200 dark:focus-within:border-gray-700 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
            <input
                className="bg-transparent border-none outline-none px-3 py-1.5 text-xs w-28 text-gray-700 dark:text-gray-300"
                placeholder="Add skill..."
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onAdd(val.trim()); setVal('') } }}
            />
            <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal('') } }} className="text-gray-400 hover:text-primary-500">
                <Plus size={14} />
            </button>
        </div>
    )
}

function X({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> }
