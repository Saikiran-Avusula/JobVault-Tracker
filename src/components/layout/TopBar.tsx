import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Sun, Moon, Menu, User, LogOut, FolderOpen, Trash2, Plus, Bug } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import { useThemeStore } from '../../store/useThemeStore'
import { getUserAvatarUrl, getUserDisplayName, getUserInitials } from '../../lib/userProfile'
import NewJobModal from '../NewJobModal'

export default function TopBar() {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [showNewJobModal, setShowNewJobModal] = useState(false)
    const [touchStart, setTouchStart] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { setSearchQuery } = useJobStore()
    const { user, signOut } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore()
    const avatarUrl = getUserAvatarUrl(user)
    const displayName = getUserDisplayName(user)
    const userInitials = getUserInitials(user)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
            if (e.key === 'Escape') {
                inputRef.current?.blur()
                setMenuOpen(false)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const handleSearch = (value: string) => {
        setQuery(value)
        setSearchQuery(value)
    }

    const clearSearch = () => {
        setQuery('')
        setSearchQuery('')
    }

    const handleLogout = () => {
        signOut()
        navigate('/login')
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX
        if (touchStart - touchEnd > 50) {
            setMenuOpen(false)
        }
    }

    return (
        <>
            <header className="h-16 md:h-20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0 gap-3" style={{ background: 'var(--glass-fill-light)' }}>
                {/* Hamburger — mobile only */}
                <button
                    onClick={() => setMenuOpen(true)}
                    className="glass-button md:hidden p-2 -ml-1 text-gray-700 dark:text-white shrink-0"
                >
                    <Menu size={22} strokeWidth={1.5} />
                </button>

                {/* Search Container */}
                <div className="flex-1 max-w-2xl">
                    <div className={`relative flex items-center transition-all duration-300 group
                        ${focused ? 'scale-[1.02] md:scale-100' : ''}`}>
                        <div className={`glass-input absolute inset-0 transition-all duration-300 
                            ${focused ? 'ring-2 ring-primary-500/30' : ''}`} />

                        <Search
                            size={18}
                            strokeWidth={1.5}
                            className={`relative ml-4 transition-colors duration-300 
                                ${focused ? 'text-primary-500' : 'text-gray-500 dark:text-white'}`}
                        />

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="Search applications..."
                            className="relative flex-1 py-3 px-3 bg-transparent text-sm font-medium text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:ring-0"
                        />

                        {query && (
                            <button
                                onClick={clearSearch}
                                className="relative mr-3 p-1 rounded-lg border border-rose-400/30 text-rose-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors"
                            >
                                <X size={14} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop-only actions */}
                <div className="hidden md:flex items-center gap-3 ml-4">
                    <div className="h-8 w-px" style={{ background: 'var(--glass-fill-medium)' }} />
                    <button
                        onClick={toggleTheme}
                        className="glass-button p-2.5 text-gray-700 dark:text-white"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} className="text-amber-400" /> : <Moon size={18} strokeWidth={1.5} className="text-indigo-500" />}
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0 overflow-hidden"
                        style={{ borderRadius: 'var(--radius-pill)', background: 'var(--tint-blue)' }}
                    >
                        {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : userInitials}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {menuOpen && (
                <div
                    className="glass-modal-overlay md:hidden fixed inset-0 z-50 animate-in fade-in duration-200"
                    onClick={() => setMenuOpen(false)}
                    style={{ background: 'rgba(2, 6, 23, 0.38)', backdropFilter: 'blur(8px)' }}
                >
                    {/* Drawer Panel */}
                    <div
                        className="glass-modal absolute top-0 left-0 h-full w-72 flex flex-col animate-in slide-in-from-left duration-300 overflow-hidden border-r border-white/10 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(18px)',
                            WebkitBackdropFilter: 'blur(18px)',
                        }}
                    >
                        {/* User Header */}
                        <div className="p-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Menu</h3>
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="p-1.5 rounded-lg border border-rose-400/30 text-rose-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors"
                                >
                                    <X size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center text-white font-black text-sm shadow-lg overflow-hidden" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--tint-blue)' }}>
                                    {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : userInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-glass-primary truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-white truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                            <button
                                onClick={() => { navigate('/applications'); setMenuOpen(false) }}
                                className="glass-button w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-glass-primary"
                            >
                                <FolderOpen size={20} strokeWidth={1.5} className="text-primary-400" />
                                Applications
                            </button>

                            <button
                                onClick={() => { setShowNewJobModal(true); setMenuOpen(false) }}
                                className="glass-button w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white"
                                style={{ background: 'var(--tint-blue)' }}
                            >
                                <Plus size={20} strokeWidth={1.5} />
                                Add Application
                            </button>

                            <button
                                onClick={() => { navigate('/trash'); setMenuOpen(false) }}
                                className="glass-button w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-glass-primary"
                            >
                                <Trash2 size={20} strokeWidth={1.5} className="text-rose-400" />
                                Trash
                            </button>

                            <div className="h-px bg-white/10 my-3" />

                            <button
                                onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-glass-primary hover:bg-white/5 transition-colors"
                            >
                                <User size={18} strokeWidth={1.5} className="text-gray-500 dark:text-white" />
                                Profile Settings
                            </button>

                            <button
                                onClick={() => { navigate('/report-issue'); setMenuOpen(false) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            >
                                <Bug size={18} strokeWidth={1.5} className="text-rose-600 dark:text-rose-300" />
                                Report Issue
                            </button>

                            <button
                                onClick={() => { toggleTheme(); setMenuOpen(false) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-glass-primary hover:bg-white/5 transition-colors"
                            >
                                {theme === 'dark'
                                    ? <Sun size={18} strokeWidth={1.5} className="text-amber-400" />
                                    : <Moon size={18} strokeWidth={1.5} className="text-indigo-500" />}
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        </nav>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 shrink-0">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut size={18} strokeWidth={1.5} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NewJobModal open={showNewJobModal} onClose={() => setShowNewJobModal(false)} />
        </>
    )
}
