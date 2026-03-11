import { Trash2, AlertCircle } from 'lucide-react'

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText: string
    type?: 'danger' | 'warning'
}

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    type = 'danger'
}: Props) {
    if (!open) return null

    return (
        <div className="glass-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-modal w-full max-w-md p-8 animate-in zoom-in-95 duration-200" style={{ animationTimingFunction: 'var(--ease-spring)' }}>
                <div className={`w-20 h-20 ${type === 'danger' ? 'text-rose-500' : 'text-amber-500'} flex items-center justify-center mb-6 mx-auto`} style={{ borderRadius: 'var(--radius-xl)' }}>
                    {type === 'danger' ? <Trash2 size={36} /> : <AlertCircle size={36} />}
                </div>

                <h3 className="text-2xl font-black text-glass-primary text-center mb-2 tracking-tight">{title}</h3>
                <p className="text-glass-secondary font-medium text-center text-sm mb-8 px-4 leading-relaxed">
                    {description}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="glass-button flex-1 px-6 py-3 text-xs font-black text-glass-secondary uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`glass-button flex-1 px-6 py-3 text-xs font-black text-white uppercase tracking-widest ${type === 'danger' ? 'bg-rose-500/80' : 'bg-primary-500/80'}`}
                        style={{ background: type === 'danger' ? 'var(--tint-rose)' : 'var(--tint-blue)' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
