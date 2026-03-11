import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    FolderOpen, ChevronLeft, ChevronRight,
    Plus, Briefcase, LogOut, Trash2, Sun, Moon, Bug
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import { useThemeStore } from '../../store/useThemeStore'
import { isAdminEmail } from '../../services/issueService'
import NewJobModal from '../NewJobModal'

const NAV_ITEMS = [
    { to: '/applications', icon: FolderOpen, label: 'Applications' },
    { to: '/trash', icon: Trash2, label: 'Trash' },
    { to: '/report-issue', icon: Bug, label: 'Report Issue' },
]

export default function SideNavigation() {
    const [collapsed, setCollapsed] = useState(false)
    const [showNewJob, setShowNewJob] = useState(false)
    const { user, signOut } = useAuthStore()
    const { applications } = useJobStore()
    const { theme, toggleTheme } = useThemeStore()
    const navigate = useNavigate()
    const isAdmin = isAdminEmail(user?.email)

    const activeApplications = applications.filter(a => !a.is_trash)
    const trashedApplications = applications.filter(a => a.is_trash)
    const usedPct = Math.min((activeApplications.length / 100) * 100, 100)
    const handleLogout = () => { signOut(); navigate('/login') }

    return (
        <>
            <aside
                className={`flex flex-col h-full border-r border-white/10 transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
                style={{ backdropFilter: 'var(--glass-blur-md)', background: 'var(--glass-fill-light)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-3 py-4">
                    <div className="w-8 h-8 flex items-center justify-center text-white shadow-lg" style={{ borderRadius: 'var(--radius-md)', background: 'var(--tint-blue)' }}>
                        <Briefcase size={18} />
                    </div>
                    {!collapsed && <span className="font-bold text-glass-primary text-[15px]">JobVault Tracker</span>}
                </div>

                <div className={`px-3 mt-4 ${collapsed ? 'flex justify-center' : ''}`}>
                    {collapsed ? (
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="glass-button w-10 h-10 flex items-center justify-center text-white"
                            style={{ background: 'var(--tint-blue)' }}
                        >
                            <Plus size={16} strokeWidth={1.5} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="glass-button w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-white"
                            style={{ background: 'var(--tint-blue)' }}
                        >
                            <Plus size={15} strokeWidth={1.5} /> New Application
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 mt-3 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const isTrash = to === '/trash'
                        const isReportIssue = to === '/report-issue'
                        const hasTrash = trashedApplications.length > 0
                        const resolvedLabel = isReportIssue && isAdmin ? 'Admin Report Issues' : label

                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `glass-button cursor-pointer flex items-center gap-3 px-3 py-2 mb-0.5 text-[15px] font-medium group relative
                    ${isActive
                                        ? 'text-white'
                                        : 'text-slate-800 dark:text-slate-300'
                                    } ${!isActive && isReportIssue ? 'text-rose-600 dark:text-rose-300' : ''}
                    ${!isActive ? 'hover:bg-slate-200/50 dark:hover:bg-slate-700/35' : ''}
                    ${!isActive && !isReportIssue ? 'hover:text-slate-900 dark:hover:text-white' : ''}
                    ${!isActive && isReportIssue ? 'hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-100/60 dark:hover:bg-rose-500/15' : ''}
                    ${collapsed ? 'justify-center' : ''}`
                                }
                                style={({ isActive }) => {
                                    if (isActive) {
                                        return { background: isReportIssue ? 'var(--tint-rose)' : 'var(--tint-blue)' }
                                    }
                                    return {}
                                }}
                                title={collapsed ? resolvedLabel : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <Icon
                                                size={17}
                                                strokeWidth={1.5}
                                                className={
                                                    isActive
                                                        ? 'text-white'
                                                        : isReportIssue
                                                            ? 'text-rose-600 dark:text-rose-300'
                                                            : 'text-slate-800 dark:text-slate-300'
                                                }
                                            />
                                            {isTrash && hasTrash && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c0c0c]" />
                                            )}
                                        </div>
                                        {!collapsed && resolvedLabel}
                                    </>
                                )}
                            </NavLink>
                        )
                    })}

                    {!collapsed && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between px-3 mb-1">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Recent Applications</span>
                            </div>
                            <div className="space-y-0.5">
                                {activeApplications.slice(0, 5).map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => navigate(`/applications/${app.id}`)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/45 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                                    >
                                        <span className="w-2 h-2 rounded-full shrink-0 bg-primary-400" />
                                        <span className="truncate">{app.company}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <div className={`mt-4 px-2 ${collapsed ? 'flex justify-center' : ''}`}>
                        <button
                            onClick={toggleTheme}
                            className={`glass-button flex items-center gap-3 px-3 py-2 text-[15px] font-medium group w-full text-slate-800 dark:text-slate-200
                                ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
                        >
                            {theme === 'dark' ? (
                                <Sun size={17} strokeWidth={1.5} className="text-amber-400" />
                            ) : (
                                <Moon size={17} strokeWidth={1.5} className="text-indigo-500" />
                            )}
                            {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                        </button>
                    </div>
                </nav>

                {/* Storage + User */}
                <div className="border-t border-white/10 px-3 py-3">
                    {!collapsed && (
                        <div className="mb-3">
                            <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-400 mb-1 font-bold uppercase tracking-tighter">
                                <span>Free Tier Limit</span>
                                <span>{activeApplications.length} / 100</span>
                                </div>
                                {/* Background of the bar track */}
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-fill-dark)' }}>
                                    {/* The actual progress bar */}
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${usedPct}%`, background: 'var(--tint-blue)', boxShadow: '0 0 8px rgba(59,130,246,0.5)' }}
                                        />
                                </div>
                            </div>
                        )}
                    <div className={`flex items-center gap-2 ${collapsed ? 'justify-center flex-col gap-2' : ''}`}>
                        <div
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 flex items-center justify-center text-primary-400 text-xs font-bold shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all shadow-lg"
                            style={{ borderRadius: 'var(--radius-pill)', background: 'var(--tint-blue)' }}
                        >
                            {user?.user_metadata?.full_name
                                ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                : user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {user?.user_metadata?.full_name || 'User'}
                                </p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{user?.email}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="glass-button p-1.5 text-slate-700 dark:text-slate-300 hover:text-rose-400"
                                title="Logout"
                            >
                                <LogOut size={14} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>


                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="glass-button absolute -right-3 top-20 w-6 h-6 flex items-center justify-center shadow-sm z-10 text-slate-700 dark:text-slate-300"
                >
                    {collapsed ? <ChevronRight size={12} strokeWidth={1.5} /> : <ChevronLeft size={12} strokeWidth={1.5} />}
                </button>
            </aside>

            <NewJobModal open={showNewJob} onClose={() => setShowNewJob(false)} />
        </>
    )
}

