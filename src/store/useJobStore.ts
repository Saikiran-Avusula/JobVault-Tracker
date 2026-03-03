import { create } from 'zustand'
import * as appService from '../services/applicationService'
import type { JobApplication, JobStatus } from '../types/job'

interface JobState {
    applications: JobApplication[]
    loading: boolean
    searchQuery: string
    statusFilter: JobStatus | 'All'

    fetchApplications: () => Promise<void>
    addApplication: (app: Parameters<typeof appService.createApplication>[0]) => Promise<JobApplication>
    updateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>
    moveToTrash: (id: string, isTrash: boolean) => Promise<void>
    restoreFromTrash: (id: string) => Promise<void>
    purgeFromTrash: (id: string) => Promise<void>
    uploadResume: (id: string, file: File) => Promise<string | null>
    removeResume: (id: string, resumeUrl?: string) => Promise<void>
    setSearchQuery: (q: string) => void
    setStatusFilter: (filter: JobStatus | 'All') => void
}

export const useJobStore = create<JobState>()((set, get) => ({
    applications: [],
    loading: true,
    searchQuery: '',
    statusFilter: 'All',

    fetchApplications: async () => {
        set({ loading: true })
        try {
            const data = await appService.fetchApplications()
            set({ applications: data, loading: false })
        } catch {
            set({ loading: false })
            throw undefined // re-throw so callers can use handleError
        }
    },

    addApplication: async (appData) => {
        const created = await appService.createApplication(appData)
        set((state) => ({ applications: [created, ...state.applications] }))
        return created
    },

    updateApplication: async (id, updates) => {
        const updated = await appService.updateApplication(id, updates)
        set((state) => ({
            applications: state.applications.map((app) =>
                app.id === id ? updated : app
            ),
        }))
    },

    moveToTrash: async (id, isTrash) => {
        await appService.moveToTrash(id, isTrash)
        set((state) => ({
            applications: state.applications.map((app) =>
                app.id === id ? { ...app, is_trash: isTrash } : app
            ),
        }))
    },

    restoreFromTrash: async (id) => {
        await get().moveToTrash(id, false)
    },

    purgeFromTrash: async (id) => {
        await appService.purgeApplication(id)
        set((state) => ({
            applications: state.applications.filter(app => app.id !== id)
        }))
    },

    uploadResume: async (id, file) => {
        const url = await appService.uploadResume(id, file)
        // Refresh the local application record
        const updated = get().applications.map(app =>
            app.id === id
                ? { ...app, resume_file_name: file.name, resume_text: url }
                : app
        )
        set({ applications: updated })
        return url
    },

    removeResume: async (id, resumeUrl) => {
        await appService.removeResume(id, resumeUrl)
        const updated = get().applications.map(app =>
            app.id === id
                ? { ...app, resume_file_name: undefined, resume_text: '' }
                : app
        )
        set({ applications: updated })
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setStatusFilter: (filter) => set({ statusFilter: filter }),
}))
