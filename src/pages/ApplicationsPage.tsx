import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutGrid, List, Plus, Trash2, Calendar, FileText, Eye, Briefcase, Target, Code, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { timeAgo, formatLocalTime } from '../lib/utils'
import NewJobModal from '../components/NewJobModal'
import ConfirmModal from '../components/ConfirmModal'
import { StatsCardSkeleton, ApplicationCardSkeleton } from '../components/ui/Skeleton'
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
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
    const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const { applications, searchQuery, statusFilter, setStatusFilter, moveToTrash, updateApplication, fetchApplications, loading, currentPage, totalPages, setPage } = useJobStore()
    const navigate = useNavigate()

    const activeApps = applications.filter(a => !a.is_trash)
    const totalApps = activeApps.length
    const activeInterviews = activeApps.filter(a => a.status === 'Interview').length
    const activeOAs = activeApps.filter(a => a.status === 'OA').length
    const needsFollowUp = activeApps.filter(a => {
        if (!a.follow_up_date) return false
        return new Date(a.follow_up_date) <= new Date()
    }).length


    useEffect(() => {
        fetchApplications()
    }, [fetchApplications])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const filtered = activeApps.filter(app => {
        const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.role.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
        let comparison = 0
        if (sortBy === 'date') {
            comparison = new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
        } else if (sortBy === 'company') {
            comparison = a.company.localeCompare(b.company)
        } else if (sortBy === 'status') {
            comparison = a.status.localeCompare(b.status)
        }
        return sortOrder === 'asc' ? comparison : -comparison
    })

    const handleSort = (column: 'date' | 'company' | 'status') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
    }

    if (loading && applications.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <ApplicationCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Motivational Quote Strip */}
            <div className="relative w-full bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-primary-500/10 border border-primary-500/20 rounded-2xl md:rounded-3xl py-4 md:py-6 px-4 md:px-8 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent animate-pulse" />
                <button
                    onClick={() => setCurrentQuoteIndex((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length)}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-primary-600 dark:text-primary-400 hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <ChevronLeft size={16} className="md:hidden" />
                    <ChevronLeft size={20} className="hidden md:block" />
                </button>
                <div className="relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-2xl md:text-3xl">💡</span>
                        <span className="text-[10px] md:text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Daily Motivation</span>
                    </div>
                    <div className="h-px md:h-8 w-full md:w-px bg-primary-500/20" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 leading-relaxed transition-all duration-500 animate-in fade-in slide-in-from-bottom-2" key={currentQuoteIndex}>
                            {MOTIVATIONAL_QUOTES[currentQuoteIndex]}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-primary-600 dark:text-primary-400 hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <ChevronRight size={16} className="md:hidden" />
                    <ChevronRight size={20} className="hidden md:block" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">JobVault Tracker</h1>
                    <p className="text-gray-500 text-sm font-medium">Your career leads, synchronized to the cloud.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-full transition-all ${view === 'grid' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-full transition-all ${view === 'list' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
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

            {/* Stats Bar — compact on mobile, spacious on desktop */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[
                    { label: 'Applications', value: totalApps, icon: Briefcase, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                    { label: 'Pending OAs', value: activeOAs, icon: Code, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Interviews', value: activeInterviews, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0c1020]/50 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-gray-200 dark:border-white/5 p-3 md:p-6 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4 text-center md:text-left group hover:border-gray-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none">
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shrink-0`}>
                            <stat.icon size={18} className="md:hidden" />
                            <stat.icon size={24} className="hidden md:block" />
                        </div>
                        <div>
                            <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                            <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-wider md:tracking-widest mt-0.5 md:mt-1.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {needsFollowUp > 0 && (
                <div className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <Bell size={20} className="text-orange-500 animate-pulse" />
                    <div>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-100">{needsFollowUp} application{needsFollowUp > 1 ? 's' : ''} need follow-up</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Check your applications below</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {['All', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s as any)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-none outline-none ring-0
              ${statusFilter === s
                                ? 'bg-primary-500 text-white shadow-float scale-105'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Content */}
            {
                sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-100 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 transition-colors">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl mb-4">📂</div>
                        <h3 className="font-bold text-gray-900 dark:text-white">No applications found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try changing your filters or add a new job.</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sorted.map(app => (
                            <div
                                key={app.id}
                                onClick={() => navigate(`/applications/${app.id}`)}
                                className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-card dark:shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 active:scale-[0.98] active:bg-gray-50 dark:active:bg-gray-800/80 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏢</div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{app.company}</h3>
                                            <div className="flex items-center gap-1.5">
                                                {app.follow_up_date && new Date(app.follow_up_date) <= new Date() && (
                                                    <Bell size={10} className="text-orange-500 animate-pulse" />
                                                )}
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
                                    {app.updated_at && app.updated_at !== app.applied_date ? (
                                        <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20 shadow-sm">
                                            <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                                                <span className="text-xs">✏️</span>
                                                Modified: <span className="text-orange-700 dark:text-orange-300">{formatLocalTime(app.updated_at)}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20 shadow-sm">
                                            <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                                                <span className="text-xs">✨</span>
                                                Created: <span className="text-emerald-700 dark:text-emerald-300">{formatLocalTime(app.applied_date)}</span>
                                            </p>
                                        </div>
                                    )}
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
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border-b-2 border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 transition-colors" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                Status
                                                {sortBy === 'status' && <span className="text-primary-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 transition-colors" onClick={() => handleSort('company')}>
                                            <div className="flex items-center gap-2">
                                                Company & Role
                                                {sortBy === 'company' && <span className="text-primary-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 transition-colors" onClick={() => handleSort('date')}>
                                            <div className="flex items-center gap-2">
                                                Applied
                                                {sortBy === 'date' && <span className="text-primary-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                        <th className="px-6 py-4 text-right pr-8 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {sorted.map(app => (
                                        <tr
                                            key={app.id}
                                            onClick={() => navigate(`/applications/${app.id}`)}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-all group"
                                        >
                                            <td className="px-6 py-4">
                                                <StatusPill status={app.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🏢</div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{app.company}</div>
                                                            {app.resume_file_name && (
                                                                <FileText size={12} className="text-primary-500" title="Resume uploaded" />
                                                            )}
                                                            {app.follow_up_date && new Date(app.follow_up_date) <= new Date() && (
                                                                <Bell size={12} className="text-orange-500 animate-pulse" title="Follow-up needed" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{app.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{app.location || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{timeAgo(app.applied_date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.updated_at && app.updated_at !== app.applied_date ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{new Date(app.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{timeAgo(app.updated_at)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    {app.resume_file_name && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}`) }}
                                                            className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            moveToTrash(app.id, true)
                                                            toast.success(`${app.company} moved to Trash`)
                                                        }}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                                        title="Move to Trash"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setPage(page)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    currentPage === page
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

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
