import { useState } from 'react'
import { LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const { user, signOut } = useAuthStore()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            // 1. Get all applications with resume files
            const { data: apps } = await supabase
                .from('applications')
                .select('resume_text')
                .eq('user_id', user?.id)
                .not('resume_text', 'is', null)

            // 2. Delete all resume files from storage
            if (apps && apps.length > 0) {
                const filesToDelete = apps.map(app => app.resume_text).filter(Boolean)
                if (filesToDelete.length > 0) {
                    await supabase.storage.from('resumes').remove(filesToDelete)
                }
            }

            // 3. Delete all applications
            const { error: dataError } = await supabase
                .from('applications')
                .delete()
                .eq('user_id', user?.id)

            if (dataError) throw dataError

            // 4. Call RPC to delete auth user
            const { error: rpcError } = await supabase.rpc('delete_user')

            if (rpcError) {
                console.error("RPC Error:", rpcError)
                throw new Error("Could not delete account. Please contact support.")
            }

            // 5. Clear session
            await signOut()
            toast.success('Account deleted successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Profile</h1>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 dark:from-gray-800 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Info Card */}
                <div className="bg-white dark:bg-[#0c1020]/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 text-center shadow-premium relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-primary-500 to-primary-600 mx-auto mb-6 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-primary-500/20">
                            {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user?.user_metadata?.full_name || 'Career Seeker'}</h2>
                        <p className="text-gray-500 font-medium text-sm mb-8">{user?.email}</p>

                        <button
                            onClick={() => signOut()}
                            className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="bg-rose-50 dark:bg-rose-500/5 backdrop-blur-xl rounded-[2.5rem] border border-rose-200 dark:border-rose-500/10 p-8 shadow-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-rose-500 mb-4">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Danger Zone</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Deleting your account is permanent. All your job applications, resumes, and tracking history will be purged from the vault forever.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} />
                        Delete Account
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title="Permanently Delete Account?"
                description="This action cannot be undone. All your applications and tailored data will be permanently removed from our servers."
                confirmText={isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                type="danger"
            />
        </div>
    )
}
