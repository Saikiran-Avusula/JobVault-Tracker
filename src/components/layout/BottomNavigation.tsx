import { NavLink } from 'react-router-dom'
import { FolderOpen, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import NewJobModal from '../NewJobModal'
import { useJobStore } from '../../store/useJobStore'

export default function BottomNavigation() {
    const [showNewJob, setShowNewJob] = useState(false)
    const { applications } = useJobStore()
    const hasTrash = applications.some(a => a.is_trash)

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
                <div className="bg-white/90 dark:bg-[#0c1020]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] h-16 shadow-2xl flex items-center justify-around relative px-2">
                    <NavLink
                        to="/applications"
                        className={({ isActive }) => `p-3 rounded-2xl transition-all ${isActive ? 'text-primary-400 bg-primary-400/10' : 'text-gray-500'}`}
                    >
                        <FolderOpen size={22} />
                    </NavLink>

                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="w-13 h-13 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transition-transform hover:scale-110 active:scale-95"
                        >
                            <Plus size={26} strokeWidth={3} />
                        </button>
                    </div>

                    <NavLink
                        to="/trash"
                        className={({ isActive }) => `p-3 rounded-2xl transition-all relative ${isActive ? 'text-rose-400 bg-rose-400/10' : 'text-gray-500'}`}
                    >
                        <Trash2 size={22} />
                        {hasTrash && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c1020]" />
                        )}
                    </NavLink>
                </div>
            </div>

            <NewJobModal open={showNewJob} onClose={() => setShowNewJob(false)} />
        </>
    )
}
