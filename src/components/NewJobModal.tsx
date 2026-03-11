import { useState, useRef } from 'react'
import { X, Briefcase, Globe, AlignLeft, FileText, Calendar, Save, Bookmark } from 'lucide-react'
import { useJobStore } from '../store/useJobStore'
import { useTemplateStore } from '../store/useTemplateStore'
import { validateResumeFile } from '../lib/schemas'
import { handleError } from '../lib/errors'
import toast from 'react-hot-toast'

interface Props { open: boolean; onClose: () => void }

function getDefaultFormData() {
    const today = new Date()
    const followUp = new Date(today)
    followUp.setDate(today.getDate() + 7)

    return {
        company: '',
        role: '',
        location: '',
        status: 'Applied' as const,
        applied_date: today.toISOString().split('T')[0],
        follow_up_date: followUp.toISOString().split('T')[0],
        jd_text: '',
        notes: '',
        application_url: '',
    }
}

export default function NewJobModal({ open, onClose }: Props) {
    const { addApplication } = useJobStore()
    const { templates, addTemplate } = useTemplateStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [showSaveTemplate, setShowSaveTemplate] = useState(false)
    const [templateName, setTemplateName] = useState('')
    const [formData, setFormData] = useState(getDefaultFormData)

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
        setFormData(getDefaultFormData())
        setSelectedFile(null)
        setShowSaveTemplate(false)
        setTemplateName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSaveTemplate = () => {
        if (!templateName.trim()) {
            toast.error('Template name is required')
            return
        }
        addTemplate(templateName, formData.jd_text, formData.notes, [])
        toast.success(`Template "${templateName}" saved!`)
        setShowSaveTemplate(false)
        setTemplateName('')
    }

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setFormData(prev => ({
                ...prev,
                jd_text: template.jd_text,
                notes: template.notes
            }))
            toast.success(`Loaded template "${template.name}"`)
        }
    }

    if (!open) return null

    return (
        <div className="glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ animationTimingFunction: 'var(--ease-spring)' }}>
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-primary-400" style={{ borderRadius: 'var(--radius-md)' }}>
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-glass-primary">New Application</h2>
                            <p className="text-xs text-gray-500 dark:text-white">Add a new job to your vault</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg border border-rose-400/30 text-rose-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-0 flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                        {templates.length > 0 && (
                            <div className="flex items-center gap-2 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                                <Bookmark size={16} className="text-primary-500" />
                                <select
                                    onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-medium text-gray-700 dark:text-white outline-none cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="">Load from template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe size={12} /> Company Name
                                </label>
                                <input
                                    required
                                    className="glass-input w-full px-4 py-2.5 text-sm text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    placeholder="e.g. Google"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase size={12} /> Job Role
                                </label>
                                <input
                                    required
                                    className="glass-input w-full px-4 py-2.5 text-sm text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    placeholder="e.g. Frontend Engineer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                📍 Location
                            </label>
                            <input
                                className="glass-input w-full px-4 py-2.5 text-sm text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                placeholder="e.g. San Francisco, CA or Remote"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={12} /> Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    className="glass-input w-full px-4 py-2.5 text-sm text-gray-900 dark:text-glass-primary"
                                    value={formData.follow_up_date}
                                    onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Globe size={12} /> Application URL (Optional)
                            </label>
                            <input
                                className="glass-input w-full px-4 py-2.5 text-sm text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                placeholder="https://..."
                                value={formData.application_url}
                                onChange={e => setFormData({ ...formData, application_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <AlignLeft size={12} /> Job Description
                            </label>
                            <div className="flex items-center justify-between mb-1">
                                <span></span>
                                <button
                                    type="button"
                                    onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                                    className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                >
                                    <Save size={12} /> Save as Template
                                </button>
                            </div>
                            <textarea
                                className="glass-input w-full px-4 py-3 text-sm text-gray-900 dark:text-glass-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 h-40 resize-none"
                                placeholder="Paste the JD here..."
                                value={formData.jd_text}
                                onChange={e => setFormData({ ...formData, jd_text: e.target.value })}
                            />
                        </div>

                        {showSaveTemplate && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <input
                                    type="text"
                                    placeholder="Template name..."
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-sm outline-none dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveTemplate}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        )}

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
                                            <p className="text-[10px] text-gray-600 dark:text-white font-medium">
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
                                        className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                        {selectedFile ? 'Change' : 'Browse'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass-button px-6 py-2.5 text-sm font-bold text-gray-800 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="glass-button px-10 py-2.5 text-sm font-bold text-white"
                            style={{ background: 'var(--tint-blue)' }}
                        >
                            Add to Vault
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
