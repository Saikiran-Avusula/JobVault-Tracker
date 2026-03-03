import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Sun, Moon, Menu, User, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import { useThemeStore } from '../../store/useThemeStore'

export default function TopBar() {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { setSearchQuery } = useJobStore()
    const { user, signOut } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore()

    // Close menu on route change
    useEffect(() => { setMenuOpen(false) }, [])

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

    const userInitials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0].toUpperCase() || 'U'

    return (
        <>
            <header className="h-16 md:h-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between px-4 md:px-8 shrink-0 transition-all z-40 sticky top-0 gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={() => setMenuOpen(true)}
                    className="md:hidden p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                >
                    <Menu size={22} />
                </button>

                {/* Search Container */}
                <div className="flex-1 max-w-2xl">
                    <div className={`relative flex items-center transition-all duration-300 group
                        ${focused ? 'scale-[1.02] md:scale-100' : ''}`}>
                        <div className={`absolute inset-0 rounded-full transition-all duration-300 
                            ${focused
                                ? 'bg-gray-100 dark:bg-gray-800 shadow-float ring-1 ring-primary-500/20'
                                : 'bg-gray-100/60 dark:bg-gray-800/40'}`} />

                        <Search
                            size={18}
                            className={`relative ml-4 transition-colors duration-300 
                                ${focused ? 'text-primary-500' : 'text-gray-500'}`}
                        />

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="Search applications..."
                            className="relative flex-1 py-3 px-3 bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:ring-0"
                        />

                        {query && (
                            <button
                                onClick={clearSearch}
                                className="relative mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop-only actions */}
                <div className="hidden md:flex items-center gap-3 ml-4">
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform shrink-0"
                    >
                        {userInitials}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {menuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setMenuOpen(false)}
                >
                    {/* Drawer Panel */}
                    <div
                        className="absolute top-0 left-0 h-full w-72 bg-white dark:bg-[#0c0c14] border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* User Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-primary-500/20">
                                    {userInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {user?.user_metadata?.full_name || 'User'}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 p-3 space-y-1">
                            <button
                                onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                            >
                                <User size={18} className="text-gray-400" />
                                Profile Settings
                                <ChevronRight size={14} className="ml-auto text-gray-300" />
                            </button>

                            <button
                                onClick={() => { toggleTheme(); setMenuOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                            >
                                {theme === 'dark'
                                    ? <Sun size={18} className="text-amber-400" />
                                    : <Moon size={18} className="text-indigo-500" />}
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        </nav>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
