import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardDrive, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuthStore()

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !password.trim() || (isSignUp && !fullName.trim())) {
            toast.error('Please fill in all fields')
            return
        }
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                })
                if (error) throw error
                toast.success('Check your email for confirmation!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                toast.success('Welcome back! 👋')
                navigate('/')
            }
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (error) throw error
        } catch (error: any) {
            toast.error(error.message || 'Google login failed')
        }
    }

    return (
        <div className="min-h-screen flex bg-[#020617]">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="relative z-10 max-w-sm text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8">
                        <HardDrive size={36} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black mb-4">JobVault Tracker</h2>
                    <p className="text-primary-100 text-lg leading-relaxed opacity-80">
                        Securely manage your job hunt — tailored resumes, skill tracking, and trash recovery in one vault.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                        {[
                            ['🚀', 'Pipeline Stepper', 'Magnetic status path'],
                            ['🏢', 'Tailored Vault', 'Separate resumes per role'],
                            ['🗑️', 'Trash recovery', 'Never lose an application'],
                            ['📱', 'Mobile First', 'Keenly polished UI'],
                        ].map(([emoji, title, desc]) => (
                            <div key={title} className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                <div className="text-2xl mb-2">{emoji}</div>
                                <p className="font-bold text-sm">{title}</p>
                                <p className="text-xs text-primary-200 mt-0.5">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center"><HardDrive size={16} color="white" /></div>
                        <span className="font-bold text-white">JobVault Tracker</span>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">{isSignUp ? 'Create account' : 'Welcome back'}</h1>
                    <p className="text-gray-500 mb-8 font-medium">Step into your career vault</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Dana Chen"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-primary-500 transition-all outline-none ring-0"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                placeholder="dana@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-primary-500 transition-all outline-none ring-0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-primary-500 transition-all outline-none ring-0"
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-semibold mt-2 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 transition-all"
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <>{isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#020617] px-4 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-xs text-gray-400 mt-8 hover:text-gray-300 transition-colors group"
                    >
                        {isSignUp ? 'Already have an account? ' : 'Need an account? '}
                        <span className="text-white font-bold border-white/50 rounded-full border-2 px-3 py-1 group-hover:border-white transition-all ml-1 inline-block">
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
