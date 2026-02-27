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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0c1020] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
                <div className={`w-20 h-20 ${type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'} rounded-3xl flex items-center justify-center mb-6 mx-auto border border-white/5`}>
                    {type === 'danger' ? <Trash2 size={36} /> : <AlertCircle size={36} />}
                </div>

                <h3 className="text-2xl font-black text-white text-center mb-2 tracking-tight">{title}</h3>
                <p className="text-gray-500 font-medium text-center text-sm mb-8 px-4 leading-relaxed">
                    {description}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-full text-xs font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`flex-1 px-6 py-3 rounded-full text-xs font-black text-white ${type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'} shadow-xl transition-all uppercase tracking-widest`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
