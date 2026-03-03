import { useState, useRef } from 'react'
import { X, Briefcase, Globe, AlignLeft, FileText } from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { validateResumeFile } from '../lib/schemas'
import { handleError } from '../lib/errors'
import toast from 'react-hot-toast'

interface Props { open: boolean; onClose: () => void }

export default function NewJobModal({ open, onClose }: Props) {
    const { addApplication } = useJobStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        status: 'Applied' as const,
        applied_date: new Date().toISOString().split('T')[0],
        jd_text: '',
        notes: '',
        application_url: ''
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validation = validateResumeFile(file)
            if (!validation.success) {
                toast.error(validation.error)
                if (fileInputRef.current) fileInputRef.current.value = ''
                return
            }
            setSelectedFile(file)
            toast.success(`Selected resume: ${file.name}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // 1. Create the application record
            const created = await addApplication({
                ...formData,
                resume_text: '', // Placeholder, will be updated if file is uploaded
                skill_gaps: [],
                is_trash: false
            })

            // 2. Upload file if selected
            if (selectedFile) {
                await useJobStore.getState().uploadResume(created.id, selectedFile)
            }

            toast.success(`Application for ${formData.company} added!`)
            onClose()
            reset()
        } catch (error) {
            handleError(error)
        }
    }

    const reset = () => {
        setFormData({
            company: '',
            role: '',
            status: 'Applied',
            applied_date: new Date().toISOString().split('T')[0],
            jd_text: '',
            notes: '',
            application_url: ''
        })
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Application</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Add a new job to your vault</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-0 flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe size={12} /> Company Name
                                </label>
                                <input
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g. Google"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase size={12} /> Job Role
                                </label>
                                <input
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g. Frontend Engineer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Globe size={12} /> Application URL (Optional)
                            </label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                                placeholder="https://..."
                                value={formData.application_url}
                                onChange={e => setFormData({ ...formData, application_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlignLeft size={12} /> Job Description
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all h-40 resize-none dark:text-white"
                                placeholder="Paste the JD here..."
                                value={formData.jd_text}
                                onChange={e => setFormData({ ...formData, jd_text: e.target.value })}
                            />
                        </div>

                        {/* Resume Selection */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary-500">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Upload Tailored Resume</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                {selectedFile?.name || 'Select the PDF version sent for this role'}
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="resume-upload"
                                        className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                        {selectedFile ? 'Change' : 'Browse'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 transition-colors flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-2.5 rounded-full bg-primary-500 text-white text-sm font-bold shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all hover:scale-[1.02]"
                        >
                            Add to Vault
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
