import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import SideNavigation from './SideNavigation'
import TopBar from './TopBar'
import BottomNavigation from './BottomNavigation'
import { HardDrive } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import '../../store/useThemeStore' // Import to activate theme subscription
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../ErrorBoundary'

export default function AppLayout() {
    const { user, loading } = useAuthStore()
    const { fetchApplications } = useJobStore()
    const userId = user?.id

    useEffect(() => {
        if (!userId) return
        fetchApplications().catch(() => {
            // Keep layout stable; route-level pages handle data errors.
        })
    }, [userId, fetchApplications])

    if (loading) {
        return (
            <div className="h-screen bg-white dark:bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center animate-pulse">
                        <HardDrive className="w-6 h-6 text-primary-500" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium animate-pulse">Syncing with vault...</p>
                </div>
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />

    return (
        <ErrorBoundary>
            <div className="app-shell flex h-screen overflow-hidden transition-all duration-500">
                {/* Desktop SideNav */}
                <div className="hidden md:flex relative">
                    <SideNavigation />
                </div>

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden text-gray-100">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto px-3 pt-0 pb-24 md:px-8 md:pb-10">
                        <div className="content-shell">
                            <Outlet />
                        </div>
                    </main>
                </div>

                {/* Mobile Bottom Navigation */}
                <BottomNavigation />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' },
                        success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                    }}
                />
            </div>
        </ErrorBoundary>
    )
}
