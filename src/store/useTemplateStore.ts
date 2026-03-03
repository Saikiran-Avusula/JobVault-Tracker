import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApplicationTemplate } from '../types/job'

interface TemplateState {
    templates: ApplicationTemplate[]
    addTemplate: (name: string, jd_text: string, notes: string, skill_gaps: string[]) => void
    deleteTemplate: (id: string) => void
    getTemplate: (id: string) => ApplicationTemplate | undefined
}

export const useTemplateStore = create<TemplateState>()(
    persist(
        (set, get) => ({
            templates: [],
            
            addTemplate: (name, jd_text, notes, skill_gaps) => {
                const template: ApplicationTemplate = {
                    id: crypto.randomUUID(),
                    name,
                    jd_text,
                    notes,
                    skill_gaps,
                    created_at: new Date().toISOString(),
                }
                set((state) => ({ templates: [...state.templates, template] }))
            },
            
            deleteTemplate: (id) => {
                set((state) => ({ templates: state.templates.filter(t => t.id !== id) }))
            },
            
            getTemplate: (id) => {
                return get().templates.find(t => t.id === id)
            },
        }),
        {
            name: 'jobvault-templates',
        }
    )
)
