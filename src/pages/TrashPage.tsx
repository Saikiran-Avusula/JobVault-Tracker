import { useState, useEffect } from 'react'
import { RotateCcw, Trash2, Loader2 } from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { timeAgo } from '../lib/utils'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

export default function TrashPage() {
    const { applications, restoreFromTrash, purgeFromTrash, fetchApplications, loading } = useJobStore()
    const [purgeConfirmItem, setPurgeConfirmItem] = useState<{ id: string, company: string } | null>(null)

    useEffect(() => {
        fetchApplications()
    }, [fetchApplications])

    const trash = applications.filter(a => a.is_trash)

    const handleRestore = (id: string, company: string) => {
        restoreFromTrash(id)
        toast.success(`Restored ${company}`)
    }

    const handlePurge = (id: string, company: string) => {
        setPurgeConfirmItem({ id, company })
    }

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Header section with cleaner badge */}
                <div className="sticky top-0 z-30 py-4 -mx-4 px-6 md:px-0 mb-6 md:relative md:top-auto md:m-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl md:text-5xl font-black text-glass-primary tracking-tight leading-none">Trash Bin</h1>
                            <div className="px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black text-glass-primary uppercase tracking-widest leading-none">{trash.length} {trash.length === 1 ? 'Item' : 'Items'}</span>
                            </div>
                        </div>
                        <p className="text-[11px] md:text-base text-glass-secondary font-medium max-w-sm md:max-w-md leading-relaxed truncate md:whitespace-normal">
                            Deleted applications stay here until purged.
                        </p>
                    </div>
                </div>

                {loading && trash.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
                        <p className="text-glass-secondary font-bold uppercase tracking-widest text-xs">Syncing Trash...</p>
                    </div>
                ) : trash.length === 0 ? (
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-[3rem] blur opacity-20 group-hover:opacity-35 transition duration-700" style={{ background: 'var(--tint-blue)' }} />
                        <div className="relative flex flex-col items-center justify-center py-28 rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/65 border border-slate-200/70 dark:border-slate-700/60 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.14)_0%,transparent_72%)] opacity-70" />
                            <div className="w-24 h-24 rounded-[2rem] border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-800/70 flex items-center justify-center text-4xl mb-6 shadow-inner relative z-10">
                                🗑️
                            </div>
                            <h3 className="text-2xl font-black text-glass-primary tracking-tight relative z-10">Trash is empty</h3>
                            <p className="text-glass-secondary font-medium mt-2 text-sm max-w-[220px] text-center leading-relaxed relative z-10">
                                Deleted items will appear here for recovery.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trash.map(app => (
                            <div
                                key={app.id}
                                className="p-6 rounded-[2.5rem] transition-all group overflow-hidden relative bg-white/80 dark:bg-slate-900/65 border border-slate-200/70 dark:border-slate-700/60 shadow-premium hover:shadow-float"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-800/70">🏢</div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-glass-primary truncate text-base">{app.company}</h3>
                                            <p className="text-[11px] font-black text-glass-secondary uppercase tracking-widest truncate mt-0.5">{app.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
                                    <button
                                        onClick={() => handleRestore(app.id, app.company)}
                                        className="glass-button flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                        style={{ background: 'var(--tint-blue)' }}
                                    >
                                        <RotateCcw size={14} strokeWidth={3} /> Restore
                                    </button>
                                    <button
                                        onClick={() => handlePurge(app.id, app.company)}
                                        className="glass-button p-3 rounded-full text-white transition-all border border-rose-500/35 shadow-sm"
                                        style={{ background: 'var(--tint-rose)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {app.updated_at && app.updated_at !== app.applied_date ? (
                                        <p className="text-[9px] font-black text-orange-700 dark:text-orange-300 uppercase tracking-tighter flex items-center gap-1">
                                            <span className="text-xs">✏️</span> Modified {timeAgo(app.updated_at)}
                                        </p>
                                    ) : (
                                        <p className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase italic tracking-tighter">Deleted {timeAgo(app.updated_at)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={!!purgeConfirmItem}
                onClose={() => setPurgeConfirmItem(null)}
                onConfirm={() => {
                    if (purgeConfirmItem) {
                        purgeFromTrash(purgeConfirmItem.id)
                        toast.success(`${purgeConfirmItem.company} purged forever`)
                    }
                }}
                title="Permanently Delete?"
                description={`Are you sure you want to permanently delete ${purgeConfirmItem?.company}? This action is irreversible.`}
                confirmText="Purge Forever"
                type="danger"
            />
        </>
    )
}
