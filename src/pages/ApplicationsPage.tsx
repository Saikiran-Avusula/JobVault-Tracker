import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutGrid, List, Plus, Trash2, Calendar, FileText, Eye, Loader2, Briefcase, Target, Zap, Code
} from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { timeAgo, formatLocalTime } from '../lib/utils'
import NewJobModal from '../components/NewJobModal'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

const MOTIVATIONAL_QUOTES = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Opportunities don't happen, you create them. — Chris Grosser",
    "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
    "The future depends on what you do today. — Mahatma Gandhi",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
    "I find that the harder I work, the more luck I seem to have. — Thomas Jefferson",
    "The expert in anything was once a beginner. — Helen Hayes",
    "Dreams don't work unless you do. — John C. Maxwell",
    "Your limitation—it's only your imagination."
];

export default function ApplicationsPage() {
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [showAddModal, setShowAddModal] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [resumeToRemove, setResumeToRemove] = useState<string | null>(null)
    const { applications, searchQuery, statusFilter, setStatusFilter, moveToTrash, updateApplication, fetchApplications, loading } = useJobStore()
    const navigate = useNavigate()

    const activeApps = applications.filter(a => !a.is_trash)
    const totalApps = activeApps.length
    const activeInterviews = activeApps.filter(a => a.status === 'Interview').length
    const activeOAs = activeApps.filter(a => a.status === 'OA').length
    const responsesCount = activeApps.filter(a => ['OA', 'Interview', 'Offer', 'Rejected'].includes(a.status)).length
    const responseRate = totalApps > 0 ? Math.round((responsesCount / totalApps) * 100) : 0

    useEffect(() => {
        fetchApplications()
    }, [fetchApplications])

    const filtered = activeApps.filter(app => {
        const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.role.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading && applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Cloud...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Motivational Quotes Marquee */}
            <div className="w-full overflow-hidden bg-primary-500/5 border border-primary-500/10 rounded-2xl py-3 relative group">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F8FAFC] dark:from-[#020617] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAFC] dark:from-[#020617] to-transparent z-10" />
                <div className="animate-marquee whitespace-nowrap flex items-center">
                    {[...MOTIVATIONAL_QUOTES, ...MOTIVATIONAL_QUOTES].map((quote, i) => (
                        <div key={i} className="flex items-center">
                            <span className="mx-6 text-xs font-semibold text-primary-600 dark:text-primary-400/80 tracking-wide uppercase">
                                {quote}
                            </span>
                            <span className="text-primary-500/30 text-[10px]">✦</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">JobVault Tracker</h1>
                    <p className="text-gray-500 text-sm font-medium">Your career leads, synchronized to the cloud.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-gray-900 rounded-full border border-gray-800 shadow-sm transition-colors">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-full transition-all ${view === 'grid' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-full transition-all ${view === 'list' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all hover:scale-[1.02]"
                    >
                        <Plus size={18} /> Add Application
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Applications', value: totalApps, icon: Briefcase, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                    { label: 'Pending Online Assessments', value: activeOAs, icon: Code, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Active Interviews', value: activeInterviews, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Response Rate', value: `${responseRate}%`, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0c1020]/50 backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex items-center gap-4 group hover:border-white/10 transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {['All', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s as any)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-none outline-none ring-0
              ${statusFilter === s
                                ? 'bg-primary-500 text-white shadow-float scale-105'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Content */}
            {
                filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-3xl border border-dashed border-gray-800 transition-colors">
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-2xl mb-4">📂</div>
                        <h3 className="font-bold text-white">No applications found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try changing your filters or add a new job.</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(app => (
                            <div
                                key={app.id}
                                onClick={() => navigate(`/applications/${app.id}`)}
                                className="bg-gray-900 p-6 rounded-[2rem] border border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 active:scale-[0.98] active:bg-gray-800/80 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏢</div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{app.company}</h3>
                                            <div className="flex items-center gap-1.5">
                                                {app.resume_file_name && (
                                                    <div className="flex items-center gap-1 group/resume-badge">
                                                        <FileText size={10} className="text-primary-500" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setResumeToRemove(app.id) }}
                                                            className="p-0.5 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-colors opacity-0 group-hover/resume-badge:opacity-100"
                                                            title="Remove Resume"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {app.updated_at && app.updated_at !== app.applied_date ? 'Updated ' : 'Applied '}
                                                    {timeAgo(app.updated_at || app.applied_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusPill status={app.status} />
                                </div>

                                <p className="text-sm font-medium text-gray-400 truncate mb-4">{app.role}</p>

                                <div className="flex items-center gap-2 mb-6">
                                    <div className="px-3 py-1 bg-gray-800/50 rounded-lg border border-white/5">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                            {app.updated_at && app.updated_at !== app.applied_date ? 'Modified: ' : 'Created: '}
                                            <span className="text-gray-300">{formatLocalTime(app.updated_at || app.applied_date)}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{new Date(app.applied_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteId(app.id) }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Company & Role</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-4 text-right pr-12 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filtered.map(app => (
                                    <tr
                                        key={app.id}
                                        onClick={() => navigate(`/applications/${app.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-sm">🏢</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{app.company}</div>
                                                        {app.resume_file_name && (
                                                            <FileText size={12} className="text-primary-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">{app.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${app.status === 'Offer' ? 'bg-success-50 text-success-700' :
                                                    app.status === 'Rejected' ? 'bg-danger-50 text-danger-700' :
                                                        'bg-primary-50 dark:bg-primary-900/30 text-primary-600'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(app.applied_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 pr-6">
                                                {app.resume_file_name && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}`) }}
                                                            className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                            title="View Resume"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setResumeToRemove(app.id) }}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                            title="Remove Resume"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveToTrash(app.id, true)
                                                        toast.success(`${app.company} moved to Trash`)
                                                    }}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition-colors"
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            <NewJobModal open={showAddModal} onClose={() => setShowAddModal(false)} />

            <ConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    const app = applications.find(a => a.id === deleteId)
                    moveToTrash(deleteId!, true)
                    setDeleteId(null)
                    toast.success(`${app?.company} moved to Trash`)
                }}
                title="Move to Trash?"
                description="This application will be moved to your Trash bin. You can restore it later if needed."
                confirmText="Move to Trash"
            />
            <ConfirmModal
                open={!!resumeToRemove}
                onClose={() => setResumeToRemove(null)}
                onConfirm={() => {
                    const app = applications.find(a => a.id === resumeToRemove)
                    updateApplication(resumeToRemove!, { resume_file_name: undefined })
                    setResumeToRemove(null)
                    toast.success(`Removed resume for ${app?.company}`)
                }}
                title="Remove Resume?"
                description="This will remove the uploaded resume version for this application."
                confirmText="Remove Resume"
            />
        </div >
    )
}

function StatusPill({ status }: { status: string }) {
    const config: Record<string, { color: string; bg: string; icon: string }> = {
        'Applied': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: '📝' },
        'OA': { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: '💻' },
        'Interview': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', icon: '📅' },
        'Offer': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: '✨' },
        'Rejected': { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30', icon: '❌' },
        'Ghosted': { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', icon: '👻' },
    }

    const { color, bg, icon } = config[status] || config['Applied']

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg} ${color} border border-black/5 dark:border-white/5 shadow-sm`}>
            <span className="text-xs">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
    )
}
