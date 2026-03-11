import { useMemo, useState } from 'react'
import { CalendarDays, Copy, LogOut, Mail, ShieldCheck, Trash2, UserRound, AlertTriangle, Code2, Heart, Linkedin, Globe, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import { deleteAccount } from '../services/authService'
import { handleError } from '../lib/errors'
import { formatLocalTime } from '../lib/utils'
import { getUserAvatarUrl, getUserDisplayName, getUserInitials } from '../lib/userProfile'

const developerLinks = [
    {
        icon: Linkedin,
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/sai-kiran-avusula-096655290/',
        detail: 'Professional profile',
        iconClass: 'text-sky-700 dark:text-sky-300',
        bgClass: 'bg-sky-500/10',
    },
    {
        icon: Globe,
        label: 'Portfolio',
        href: 'https://saikiran-portfolio-psi.vercel.app/',
        detail: 'Projects and work',
        iconClass: 'text-violet-700 dark:text-violet-300',
        bgClass: 'bg-violet-500/10',
    },
    {
        icon: MessageCircle,
        label: 'WhatsApp',
        href: 'https://wa.me/919866337106',
        detail: '+91 9866337106',
        iconClass: 'text-emerald-700 dark:text-emerald-300',
        bgClass: 'bg-emerald-500/10',
    },
    {
        icon: Mail,
        label: 'Email',
        href: 'mailto:saikiranavusula89@gmail.com',
        detail: 'saikiranavusula89@gmail.com',
        iconClass: 'text-rose-700 dark:text-rose-300',
        bgClass: 'bg-rose-500/10',
    },
]

export default function ProfilePage() {
    const { user, signOut } = useAuthStore()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const displayName = useMemo(() => getUserDisplayName(user), [user])
    const avatarUrl = useMemo(() => getUserAvatarUrl(user), [user])
    const initials = useMemo(() => getUserInitials(user), [user])
    const provider = useMemo(() => {
        const providerName = user?.app_metadata?.provider
        if (!providerName) return 'Email'
        return String(providerName).charAt(0).toUpperCase() + String(providerName).slice(1)
    }, [user?.app_metadata?.provider])

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteAccount()
            toast.success('Account deleted successfully')
        } catch (error) {
            handleError(error)
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const copyUserId = async () => {
        if (!user?.id) return
        try {
            await navigator.clipboard.writeText(user.id)
            toast.success('User ID copied')
        } catch {
            toast.error('Could not copy User ID')
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4 mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Profile</h1>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 dark:from-gray-800 to-transparent" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8">
                <div className="bg-white dark:bg-[#0c1020]/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 shadow-premium relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-80" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex flex-col items-center text-center gap-6">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-24 h-24 rounded-[2rem] object-cover border border-white/20 shadow-lg"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-primary-500/20">
                                    {initials}
                                </div>
                            )}

                            <div className="min-w-0 flex flex-col items-center">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{displayName}</h2>
                                <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mt-1 break-all">{user?.email}</p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                    <span className="px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-300 text-[11px] font-black uppercase tracking-[0.2em]">
                                        {provider}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em]">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-5">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-glass-tertiary">
                                    <ShieldCheck size={14} />
                                    Account ID
                                </div>
                                <p className="mt-3 text-sm font-semibold text-black dark:text-white break-all">{user?.id || 'Not available'}</p>
                                <button
                                    onClick={copyUserId}
                                    className="mt-4 glass-button px-3 py-2 text-xs font-bold text-gray-900 dark:text-white inline-flex items-center gap-2"
                                >
                                    <Copy size={12} />
                                    Copy User ID
                                </button>
                            </div>

                            <div className="glass-panel p-5">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-glass-tertiary">
                                    <UserRound size={14} />
                                    Session Info
                                </div>
                                <div className="mt-3 space-y-2 text-sm text-black dark:text-white">
                                    <p><span className="text-gray-500 dark:text-glass-tertiary mr-2">Provider:</span>{provider}</p>
                                    <p><span className="text-gray-500 dark:text-glass-tertiary mr-2">Email:</span>{user?.email || 'Not available'}</p>
                                </div>
                            </div>

                            <div className="glass-panel p-5">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-glass-tertiary">
                                    <CalendarDays size={14} />
                                    Joined
                                </div>
                                <p className="mt-3 text-sm font-semibold text-black dark:text-white">
                                    {user?.created_at ? formatLocalTime(user.created_at) : 'Not available'}
                                </p>
                            </div>

                            <div className="glass-panel p-5">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-glass-tertiary">
                                    <Mail size={14} />
                                    Last Sign In
                                </div>
                                <p className="mt-3 text-sm font-semibold text-black dark:text-white">
                                    {user?.last_sign_in_at ? formatLocalTime(user.last_sign_in_at) : 'Not available'}
                                </p>
                            </div>
                        </div>

                        <div className="glass-panel p-5 md:p-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-glass-tertiary">
                                <Code2 size={14} />
                                Developer Connect
                            </div>
                            <h3 className="mt-3 text-xl font-black text-black dark:text-white">Saikiran Avusula</h3>
                            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                Developed with <Heart size={14} className="fill-current text-rose-500 dark:text-rose-300" /> for job seekers
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Need help, feedback, or want to connect about the app? Reach out here after logging in.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                {developerLinks.map(({ icon: Icon, label, href, detail, iconClass, bgClass }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={`${label}: ${detail}`}
                                        aria-label={`${label}: ${detail}`}
                                        className={`w-12 h-12 rounded-2xl border border-gray-200 dark:border-white/10 ${bgClass} ${iconClass} flex items-center justify-center transition-all hover:scale-105 hover:border-primary-300 dark:hover:border-white/20`}
                                    >
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="bg-rose-50 dark:bg-rose-500/5 backdrop-blur-xl rounded-[2.5rem] border border-rose-200 dark:border-rose-500/10 p-8 shadow-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-rose-500 mb-4">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Danger Zone</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            Deleting your account is permanent. All your job applications, resumes, issue reports, and tracking history will be removed.
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
                confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                type="danger"
            />
        </div>
    )
}
