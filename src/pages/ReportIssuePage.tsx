import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bug, ExternalLink, ImagePlus, Loader2, MessageSquareText, Send, ShieldCheck } from 'lucide-react'
import {
    ADMIN_EMAIL,
    createIssueReport,
    fetchAllIssueReports,
    fetchMyIssueReports,
    getIssueAttachmentUrl,
    isAdminEmail,
    updateIssueReportStatus,
    uploadIssueAttachment,
} from '../services/issueService'
import type { IssueArea, IssueReport, IssueSeverity, IssueStatus } from '../types/issue'
import { useAuthStore } from '../store/useAuthStore'
import { handleError } from '../lib/errors'
import toast from 'react-hot-toast'

const AREA_OPTIONS: { label: string; value: IssueArea }[] = [
    { label: 'UI', value: 'ui' },
    { label: 'Backend', value: 'backend' },
    { label: 'Database', value: 'database' },
    { label: 'Feature', value: 'feature_request' },
    { label: 'Other', value: 'other' },
]

const SEVERITY_OPTIONS: { label: string; value: IssueSeverity }[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
]

const STATUS_OPTIONS: { label: string; value: IssueStatus }[] = [
    { label: 'Open', value: 'open' },
    { label: 'Progress', value: 'in_progress' },
    { label: 'Review', value: 'in_review' },
    { label: 'Resolved', value: 'resolved' },
]

const STATUS_STYLES: Record<IssueStatus, string> = {
    open: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    in_progress: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    in_review: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    resolved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
}

const AREA_STYLES: Record<IssueArea, string> = {
    ui: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
    backend: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
    database: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
    feature_request: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
    other: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
}

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
    low: 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-white',
    medium: 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-white',
    high: 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-white',
}

type AdminDraft = {
    status: IssueStatus
    admin_message: string
}

function getStatusLabel(status: IssueStatus) {
    return STATUS_OPTIONS.find((option) => option.value === status)?.label || status
}

const SELECT_CLASSNAME = 'glass-input w-full px-4 py-3 text-sm text-black dark:text-glass-primary bg-white dark:bg-slate-900 appearance-none'
const FIELD_CLASSNAME = 'glass-input w-full px-4 py-3 text-sm text-black dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white/70 dark:bg-transparent'

export default function ReportIssuePage() {
    const location = useLocation()
    const { user } = useAuthStore()
    const isAdmin = isAdminEmail(user?.email)

    const [submitting, setSubmitting] = useState(false)
    const [loadingReports, setLoadingReports] = useState(true)
    const [savingReportId, setSavingReportId] = useState<string | null>(null)
    const [reports, setReports] = useState<IssueReport[]>([])
    const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({})
    const [adminDrafts, setAdminDrafts] = useState<Record<string, AdminDraft>>({})

    const [area, setArea] = useState<IssueArea>('ui')
    const [severity, setSeverity] = useState<IssueSeverity>('medium')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [contactEmail, setContactEmail] = useState(user?.email || '')
    const [pagePath, setPagePath] = useState(location.pathname)
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
    const [fileInputKey, setFileInputKey] = useState(0)

    const headingText = useMemo(
        () =>
            isAdmin
                ? 'Admin issue console for user-reported application problems.'
                : 'Share the exact problem you hit in the application. The admin can track it by your user ID, review proof images, and update the resolution status.',
        [isAdmin]
    )

    useEffect(() => {
        setPagePath(location.pathname)
    }, [location.pathname])

    useEffect(() => {
        setContactEmail(user?.email || '')
    }, [user?.email])

    useEffect(() => {
        const loadReports = async () => {
            setLoadingReports(true)
            try {
                const data = isAdmin ? await fetchAllIssueReports(100) : await fetchMyIssueReports(25)
                setReports(data)
                setAdminDrafts((prev) => {
                    const next = { ...prev }
                    data.forEach((report) => {
                        next[report.id] = next[report.id] || {
                            status: report.status,
                            admin_message: report.admin_message || '',
                        }
                    })
                    return next
                })
            } catch (error) {
                handleError(error)
            } finally {
                setLoadingReports(false)
            }
        }

        loadReports()
    }, [isAdmin])

    useEffect(() => {
        const reportsWithAttachments = reports.filter((report) => report.attachment_path)
        if (reportsWithAttachments.length === 0) {
            setAttachmentUrls({})
            return
        }

        let cancelled = false

        const loadAttachmentUrls = async () => {
            const entries = await Promise.all(
                reportsWithAttachments.map(async (report) => {
                    try {
                        const url = await getIssueAttachmentUrl(report.attachment_path as string)
                        return [report.id, url] as const
                    } catch {
                        return [report.id, ''] as const
                    }
                })
            )

            if (!cancelled) {
                setAttachmentUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))))
            }
        }

        loadAttachmentUrls()

        return () => {
            cancelled = true
        }
    }, [reports])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)

        try {
            let attachmentPath = ''

            if (attachmentFile) {
                attachmentPath = await uploadIssueAttachment(attachmentFile)
            }

            const created = await createIssueReport({
                area,
                severity,
                title,
                description,
                contact_email: contactEmail,
                page_path: pagePath,
                attachment_path: attachmentPath,
            })

            setReports((prev) => [created, ...prev])
            setAdminDrafts((prev) => ({
                ...prev,
                [created.id]: {
                    status: created.status,
                    admin_message: created.admin_message || '',
                },
            }))
            setTitle('')
            setDescription('')
            setAttachmentFile(null)
            setFileInputKey((prev) => prev + 1)
            toast.success('Issue submitted. The admin can now track and update it.')
        } catch (error) {
            handleError(error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAdminSave = async (report: IssueReport) => {
        const draft = adminDrafts[report.id] || { status: report.status, admin_message: report.admin_message || '' }
        setSavingReportId(report.id)

        try {
            const updated = await updateIssueReportStatus(report.id, draft)
            setReports((prev) => prev.map((item) => (item.id === report.id ? updated : item)))
            setAdminDrafts((prev) => ({
                ...prev,
                [report.id]: {
                    status: updated.status,
                    admin_message: updated.admin_message || '',
                },
            }))
            toast.success('Issue status updated.')
        } catch (error) {
            handleError(error)
        } finally {
            setSavingReportId(null)
        }
    }

    const visibleReports = isAdmin
        ? reports.filter((report) => report.user_id !== user?.id)
        : reports.slice(0, 25)

    return (
        <div className="space-y-6 pb-20">
            <div className="glass-panel flex items-start gap-4 p-5 md:p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 shrink-0">
                    {isAdmin ? <ShieldCheck size={22} /> : <Bug size={22} />}
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-glass-primary tracking-tight">
                        {isAdmin ? 'Admin Report Issues' : 'Report Issue'}
                    </h1>
                    <p className="text-sm text-gray-700 dark:text-white">{headingText}</p>
                    {!isAdmin && <p className="text-xs text-gray-500 dark:text-white mt-1">Admin contact: {ADMIN_EMAIL}</p>}
                </div>
            </div>

            {!isAdmin && (
                <form onSubmit={handleSubmit} className="glass-panel p-5 md:p-8 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-glass-primary">Submit a Bug Report</h2>
                            <p className="text-sm text-gray-700 dark:text-white">Include the issue details, affected page, and an optional screenshot proof.</p>
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] font-black text-gray-500 dark:text-white break-all">
                            {user?.id ? `User ID: ${user.id}` : 'Signed out'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Area</span>
                            <select
                                value={area}
                                onChange={(e) => setArea(e.target.value as IssueArea)}
                                className={SELECT_CLASSNAME}
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
                                className={SELECT_CLASSNAME}
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
                            className={FIELD_CLASSNAME}
                        />
                    </label>

                    <label className="space-y-1 block">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Steps to reproduce, expected behavior, actual behavior, and impact"
                            className={`${FIELD_CLASSNAME} min-h-[160px] resize-y`}
                        />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-1 block">
                            <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Contact Email</span>
                            <input
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={FIELD_CLASSNAME}
                            />
                        </label>
                        <label className="space-y-1 block">
                            <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Page Path</span>
                            <input
                                value={pagePath}
                                onChange={(e) => setPagePath(e.target.value)}
                                placeholder="/applications"
                                className={FIELD_CLASSNAME}
                            />
                        </label>
                    </div>

                    <label className="space-y-2 block">
                        <span className="text-xs font-bold uppercase tracking-widest text-glass-tertiary">Screenshot Proof</span>
                        <div className="glass-panel p-4 border border-dashed border-white/15">
                            <label className="flex items-center gap-2 text-sm font-semibold text-black dark:text-glass-primary cursor-pointer w-fit">
                                <ImagePlus size={16} />
                                <span>Upload image</span>
                                <input
                                    key={fileInputKey}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            <p className="text-xs text-gray-500 dark:text-white mt-2">
                                Optional. PNG, JPG, JPEG, or WEBP up to 5MB.
                            </p>
                            {attachmentFile && (
                                <p className="text-xs text-gray-700 dark:text-white mt-2">
                                    Selected: {attachmentFile.name}
                                </p>
                            )}
                        </div>
                    </label>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="glass-button w-full sm:w-auto px-5 py-2.5 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            style={{ background: 'var(--tint-blue)' }}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Submit Report
                        </button>
                    </div>
                </form>
            )}

            <section className="glass-panel p-5 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-black text-glass-primary">
                            {isAdmin ? 'Admin Report Issues' : 'Your Recent Reports'}
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-white">
                            {isAdmin
                                ? 'Track affected users, review screenshots, and move issues through the workflow.'
                                : 'Track admin progress on the bugs you reported.'}
                        </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.25em] font-black text-gray-500 dark:text-white">
                        {visibleReports.length} report{visibleReports.length === 1 ? '' : 's'}
                    </span>
                </div>

                {loadingReports ? (
                    <div className="py-8 flex items-center gap-2 text-gray-500 dark:text-white">
                        <Loader2 size={16} className="animate-spin" /> Loading reports...
                    </div>
                ) : visibleReports.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-white">{isAdmin ? 'No user reports yet.' : 'No reports yet.'}</p>
                ) : (
                    <div className="space-y-4">
                        {visibleReports.map((report) => {
                            const draft = adminDrafts[report.id] || {
                                status: report.status,
                                admin_message: report.admin_message || '',
                            }

                            return (
                                <div key={report.id} className="glass-panel p-4 md:p-5 space-y-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {!isAdmin && (
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full ${AREA_STYLES[report.area]}`}>
                                                        {report.area}
                                                    </span>
                                                )}
                                                {!isAdmin && (
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full ${SEVERITY_STYLES[report.severity]}`}>
                                                        {report.severity}
                                                    </span>
                                                )}
                                                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full ${STATUS_STYLES[report.status]}`}>
                                                    {getStatusLabel(report.status)}
                                                </span>
                                            </div>
                                            <p className="text-base font-bold text-glass-primary">{report.title}</p>
                                            <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">{report.description}</p>
                                        </div>

                                        <div className="w-full md:w-auto md:min-w-[220px] text-left md:text-right text-[11px] text-gray-500 dark:text-white space-y-1 break-words rounded-2xl md:rounded-none bg-black/[0.03] dark:bg-white/[0.03] p-3 md:p-0">
                                            <p>Created: {new Date(report.created_at).toLocaleString()}</p>
                                            <p>Updated: {new Date(report.updated_at).toLocaleString()}</p>
                                            <p>User ID: {report.user_id}</p>
                                            {report.contact_email && <p>Reporter Email: {report.contact_email}</p>}
                                            {report.page_path && <p>Page: {report.page_path}</p>}
                                        </div>
                                    </div>

                                    {report.attachment_path && attachmentUrls[report.id] && (
                                        <div className="space-y-2">
                                            <p className="text-xs uppercase tracking-widest font-black text-gray-500 dark:text-white">Screenshot Proof</p>
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start">
                                                <img
                                                    src={attachmentUrls[report.id]}
                                                    alt={`Issue attachment for ${report.title}`}
                                                    className="w-full max-w-md rounded-2xl border border-white/10 object-cover"
                                                />
                                                <a
                                                    href={attachmentUrls[report.id]}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="glass-button px-3 py-2 text-sm text-black dark:text-glass-primary inline-flex items-center justify-center gap-2 w-full md:w-fit"
                                                >
                                                    <ExternalLink size={14} />
                                                    Open Full Image
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {!isAdmin && report.admin_message && (
                                        <div className="glass-panel p-4 border border-emerald-500/10">
                                            <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-glass-primary">
                                                <MessageSquareText size={15} />
                                                Team Reply
                                            </div>
                                            <p className="text-sm text-black dark:text-white mt-2 whitespace-pre-wrap">{report.admin_message}</p>
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4 items-start">
                                                <label className="space-y-1">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white">Status</span>
                                                    <select
                                                        value={draft.status}
                                                        onChange={(e) =>
                                                            setAdminDrafts((prev) => ({
                                                                ...prev,
                                                                [report.id]: {
                                                                    ...draft,
                                                                    status: e.target.value as IssueStatus,
                                                                },
                                                            }))
                                                        }
                                                        className={SELECT_CLASSNAME}
                                                    >
                                                        {STATUS_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <label className="space-y-1 block">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white">Admin Reply</span>
                                                    <textarea
                                                        value={draft.admin_message}
                                                        onChange={(e) =>
                                                            setAdminDrafts((prev) => ({
                                                                ...prev,
                                                                [report.id]: {
                                                                    ...draft,
                                                                    admin_message: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                        placeholder="Add progress or resolution notes."
                                                        className="glass-input w-full px-4 py-3 text-sm text-black dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[110px] resize-y bg-white/70 dark:bg-transparent"
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdminSave(report)}
                                                    disabled={savingReportId === report.id}
                                                    className="glass-button w-full sm:w-auto px-5 py-3 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[140px]"
                                                    style={{ background: 'var(--tint-blue)' }}
                                                >
                                                    {savingReportId === report.id ? <Loader2 size={16} className="animate-spin" /> : null}
                                                    Save Update
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
