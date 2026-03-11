import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bug, Send, Loader2 } from 'lucide-react'
import { createIssueReport, fetchMyIssueReports } from '../services/issueService'
import type { IssueArea, IssueReport, IssueSeverity } from '../types/issue'
import { useAuthStore } from '../store/useAuthStore'
import { handleError } from '../lib/errors'
import toast from 'react-hot-toast'

const AREA_OPTIONS: { label: string; value: IssueArea }[] = [
    { label: 'UI', value: 'ui' },
    { label: 'Backend', value: 'backend' },
    { label: 'Database', value: 'database' },
    { label: 'Feature Request', value: 'feature_request' },
    { label: 'Other', value: 'other' },
]

const SEVERITY_OPTIONS: { label: string; value: IssueSeverity }[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
]

export default function ReportIssuePage() {
    const location = useLocation()
    const { user } = useAuthStore()

    const [submitting, setSubmitting] = useState(false)
    const [loadingReports, setLoadingReports] = useState(true)
    const [reports, setReports] = useState<IssueReport[]>([])

    const [area, setArea] = useState<IssueArea>('ui')
    const [severity, setSeverity] = useState<IssueSeverity>('medium')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [contactEmail, setContactEmail] = useState(user?.email || '')
    const [pagePath, setPagePath] = useState(location.pathname)

    useEffect(() => {
        setPagePath(location.pathname)
    }, [location.pathname])

    useEffect(() => {
        const loadReports = async () => {
            setLoadingReports(true)
            try {
                const data = await fetchMyIssueReports(25)
                setReports(data)
            } catch (error) {
                handleError(error)
            } finally {
                setLoadingReports(false)
            }
        }

        loadReports()
    }, [])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)

        try {
            const created = await createIssueReport({
                area,
                severity,
                title,
                description,
                contact_email: contactEmail,
                page_path: pagePath,
            })

            setReports((prev) => [created, ...prev])
            setTitle('')
            setDescription('')
            toast.success('Issue submitted. Thanks for the report.')
        } catch (error) {
            handleError(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="glass-panel flex items-start gap-4 p-5 md:p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 shrink-0">
                    <Bug size={22} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-glass-primary tracking-tight">Report Issue</h1>
                    <p className="text-sm text-glass-secondary">Share bugs or feature requests. This helps us prioritize fixes for the community.</p>
                    <p className="text-xs text-glass-tertiary mt-1">Urgent support: saikiranavusula@89gmail.com</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-5 md:p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Area</span>
                        <select
                            value={area}
                            onChange={(e) => setArea(e.target.value as IssueArea)}
                            className="glass-input w-full px-4 py-3 text-sm text-glass-primary"
                        >
                            {AREA_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Severity</span>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                            className="glass-input w-full px-4 py-3 text-sm text-glass-primary"
                        >
                            {SEVERITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="space-y-1 block">
                    <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Title</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short summary of the issue"
                        className="glass-input w-full px-4 py-3 text-sm text-glass-primary"
                    />
                </label>

                <label className="space-y-1 block">
                    <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Description</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Steps to reproduce, expected behavior, and actual behavior"
                        className="glass-input w-full px-4 py-3 text-sm text-glass-primary min-h-[160px] resize-y"
                    />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1 block">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Contact Email</span>
                        <input
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="glass-input w-full px-4 py-3 text-sm text-glass-primary"
                        />
                    </label>
                    <label className="space-y-1 block">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Page Path</span>
                        <input
                            value={pagePath}
                            onChange={(e) => setPagePath(e.target.value)}
                            placeholder="/applications"
                            className="glass-input w-full px-4 py-3 text-sm text-glass-primary"
                        />
                    </label>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="glass-button px-5 py-2.5 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        style={{ background: 'var(--tint-blue)' }}
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Submit Report
                    </button>
                </div>
            </form>

            <section className="glass-panel p-5 md:p-8">
                <h2 className="text-xl font-black text-glass-primary mb-4">Your Recent Reports</h2>

                {loadingReports ? (
                    <div className="py-8 flex items-center gap-2 text-glass-tertiary">
                        <Loader2 size={16} className="animate-spin" /> Loading reports...
                    </div>
                ) : reports.length === 0 ? (
                    <p className="text-sm text-glass-tertiary">No reports yet.</p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div key={report.id} className="glass-panel p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full bg-primary-500/10 text-primary-500">{report.area}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{report.severity}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">{report.status}</span>
                                </div>
                                <p className="text-sm font-bold text-glass-primary">{report.title}</p>
                                <p className="text-xs text-glass-secondary mt-1 line-clamp-2">{report.description}</p>
                                <p className="text-[11px] text-glass-tertiary mt-2">{new Date(report.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
