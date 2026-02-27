import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    FolderOpen, ChevronLeft, ChevronRight,
    Plus, Briefcase, LogOut, Trash2
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import NewJobModal from '../NewJobModal'

const NAV_ITEMS = [
    { to: '/applications', icon: FolderOpen, label: 'Applications' },
    { to: '/trash', icon: Trash2, label: 'Trash' },
]

export default function SideNavigation() {
    const [collapsed, setCollapsed] = useState(false)
    const [showNewJob, setShowNewJob] = useState(false)
    const { user, signOut } = useAuthStore()
    const { applications } = useJobStore()
    const navigate = useNavigate()

    const activeApplications = applications.filter(a => !a.is_trash)
    const trashedApplications = applications.filter(a => a.is_trash)
    const usedPct = Math.min((activeApplications.length / 100) * 100, 100)
    const handleLogout = () => { signOut(); navigate('/login') }

    return (
        <>
            <aside
                className={`flex flex-col h-full bg-[#0c0c0c] border-r border-gray-800 transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-3 py-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                        <Briefcase size={18} />
                    </div>
                    {!collapsed && <span className="font-bold text-white text-[15px]">JobVault Tracker</span>}
                </div>

                <div className={`px-3 mt-4 ${collapsed ? 'flex justify-center' : ''}`}>
                    {collapsed ? (
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                        >
                            <Plus size={16} color="white" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 hover:scale-[1.02]"
                        >
                            <Plus size={15} /> New Application
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 mt-3 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const isTrash = to === '/trash'
                        const hasTrash = trashedApplications.length > 0

                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-colors group relative
                    ${isActive
                                        ? 'bg-primary-900/20 text-primary-400'
                                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                                    }
                    ${collapsed ? 'justify-center' : ''}`
                                }
                                title={collapsed ? label : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <Icon size={17} className={isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'} />
                                            {isTrash && hasTrash && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c0c0c]" />
                                            )}
                                        </div>
                                        {!collapsed && label}
                                    </>
                                )}
                            </NavLink>
                        )
                    })}

                    {!collapsed && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between px-3 mb-1">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Applications</span>
                            </div>
                            <div className="space-y-0.5">
                                {activeApplications.slice(0, 5).map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => navigate(`/applications/${app.id}`)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transition-colors text-left"
                                    >
                                        <span className="w-2 h-2 rounded-full shrink-0 bg-primary-400" />
                                        <span className="truncate">{app.company}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Storage + User */}
                <div className="border-t border-gray-800 px-3 py-3">
                    {!collapsed && (
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-tighter">
                                <span>Free Tier Limit</span>
                                <span>{activeApplications.length} / 100</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary-500 transition-all shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                    style={{ width: `${usedPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 ${collapsed ? 'justify-center flex-col gap-2' : ''}`}>
                        <div
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full bg-primary-900/30 flex items-center justify-center text-primary-400 text-xs font-bold shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all shadow-lg"
                        >
                            {user?.user_metadata?.full_name
                                ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                : user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                    {user?.user_metadata?.full_name || 'User'}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-rose-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
                >
                    {collapsed ? <ChevronRight size={12} className="text-gray-500" /> : <ChevronLeft size={12} className="text-gray-500" />}
                </button>
            </aside>

            <NewJobModal open={showNewJob} onClose={() => setShowNewJob(false)} />
        </>
    )
}

