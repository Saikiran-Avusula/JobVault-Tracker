import { NavLink } from 'react-router-dom'
import { FolderOpen, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import NewJobModal from '../NewJobModal'

export default function BottomNavigation() {
    const [showNewJob, setShowNewJob] = useState(false)

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6">
                <div className="bg-[#0c1020]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] h-16 shadow-2xl flex items-center justify-between relative px-2">
                    <div className="flex-1 flex justify-center">
                        <NavLink
                            to="/applications"
                            className={({ isActive }) => `p-3 rounded-2xl transition-all ${isActive ? 'text-primary-400 bg-primary-400/10' : 'text-gray-500'}`}
                        >
                            <FolderOpen size={20} />
                        </NavLink>
                    </div>

                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowNewJob(true)}
                            className="w-12 h-12 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transition-transform hover:scale-110 active:scale-95"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <NavLink
                            to="/trash"
                            className={({ isActive }) => `p-3 rounded-2xl transition-all ${isActive ? 'text-rose-400 bg-rose-400/10' : 'text-gray-500'}`}
                        >
                            <Trash2 size={20} />
                        </NavLink>
                    </div>
                </div>
            </div>

            <NewJobModal open={showNewJob} onClose={() => setShowNewJob(false)} />
        </>
    )
}
