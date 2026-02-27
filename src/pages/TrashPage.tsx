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
                <div className="sticky top-0 z-30 bg-[#020617]/95 backdrop-blur-md py-4 -mx-4 px-6 md:px-0 mb-6 border-b border-gray-800/50 md:relative md:top-auto md:bg-transparent md:border-none md:m-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">Trash Bin</h1>
                            <div className="bg-gray-800/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{trash.length} {trash.length === 1 ? 'Item' : 'Items'}</span>
                            </div>
                        </div>
                        <p className="text-[11px] md:text-base text-gray-500 font-medium max-w-sm md:max-w-md leading-relaxed truncate md:whitespace-normal">
                            Deleted applications stay here until purged.
                        </p>
                    </div>
                </div>

                {loading && trash.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Trash...</p>
                    </div>
                ) : trash.length === 0 ? (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative flex flex-col items-center justify-center py-28 bg-[#020617] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0.2)_0%,transparent_70%)] opacity-50" />
                            <div className="w-24 h-24 bg-gray-900/50 rounded-[2rem] border border-white/5 flex items-center justify-center text-4xl mb-6 shadow-inner relative z-10">
                                🗑️
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight relative z-10">Trash is empty</h3>
                            <p className="text-gray-500 font-medium mt-2 text-sm max-w-[200px] text-center leading-relaxed relative z-10">
                                Deleted items will appear here for recovery.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trash.map(app => (
                            <div
                                key={app.id}
                                className="bg-[#0c1020]/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-premium hover:shadow-float transition-all group overflow-hidden relative"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner border border-white/5">🏢</div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white truncate text-base">{app.company}</h3>
                                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest truncate mt-0.5">{app.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => handleRestore(app.id, app.company)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <RotateCcw size={14} strokeWidth={3} /> Restore
                                    </button>
                                    <button
                                        onClick={() => handlePurge(app.id, app.company)}
                                        className="p-3 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[9px] font-black text-gray-500 uppercase italic tracking-tighter">Deleted {timeAgo(app.updated_at)}</p>
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
