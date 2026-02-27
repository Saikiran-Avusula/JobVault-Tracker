import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'

export default function TopBar() {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { setSearchQuery } = useJobStore()
    const { user } = useAuthStore()

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
            if (e.key === 'Escape') inputRef.current?.blur()
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

    return (
        <header className="h-20 bg-[#020617]/80 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-4 md:px-8 shrink-0 transition-all z-40 sticky top-0">
            {/* Search Container */}
            <div className="flex-1 max-w-2xl mx-auto md:mx-0">
                <div className={`relative flex items-center transition-all duration-300 group
                    ${focused
                        ? 'scale-[1.02] md:scale-100'
                        : ''}`}>
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 
                        ${focused
                            ? 'bg-gray-800 shadow-float ring-1 ring-primary-500/20'
                            : 'bg-gray-800/40'}`} />

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
                        placeholder="Search your applications..."
                        className="relative flex-1 py-3 px-3 bg-transparent text-sm font-medium text-gray-200 placeholder-gray-500 border-none outline-none focus:ring-0"
                    />

                    {query && (
                        <button
                            onClick={clearSearch}
                            className="relative mr-3 p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-4">
                <div className="hidden md:block h-8 w-px bg-gray-800" />
                <button
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform shrink-0"
                >
                    {user?.user_metadata?.full_name
                        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        : user?.email?.[0].toUpperCase() || 'U'}
                </button>
            </div>
        </header>
    )
}
