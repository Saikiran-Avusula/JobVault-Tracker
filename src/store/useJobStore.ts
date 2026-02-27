import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { JobApplication, JobStatus } from '../types/job'

interface JobState {
    applications: JobApplication[]
    loading: boolean
    searchQuery: string
    statusFilter: JobStatus | 'All'

    // Actions
    fetchApplications: () => Promise<void>
    addApplication: (app: Omit<JobApplication, 'id' | 'user_id' | 'updated_at'>) => Promise<void>
    updateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>
    moveToTrash: (id: string, isTrash: boolean) => Promise<void>
    restoreFromTrash: (id: string) => Promise<void>
    purgeFromTrash: (id: string) => Promise<void>
    setSearchQuery: (q: string) => void
    setStatusFilter: (filter: JobStatus | 'All') => void
    uploadResume: (id: string, file: File) => Promise<string | null>
}

export const useJobStore = create<JobState>()((set, get) => ({
    applications: [],
    loading: true,
    searchQuery: '',
    statusFilter: 'All',

    fetchApplications: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Error fetching:', error)
            set({ loading: false })
            return
        }

        set({ applications: data as JobApplication[], loading: false })
    },

    addApplication: async (appData) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('applications')
            .insert([{ ...appData, user_id: user.id }])
            .select()
            .single()

        if (error) {
            console.error('Error adding:', error)
            throw error
        }

        set((state) => ({ applications: [data as JobApplication, ...state.applications] }))
    },

    updateApplication: async (id, updates) => {
        const { data, error } = await supabase
            .from('applications')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating:', error)
            throw error
        }

        set((state) => ({
            applications: state.applications.map((app) =>
                app.id === id ? (data as JobApplication) : app
            ),
        }))
    },

    moveToTrash: async (id, isTrash) => {
        const { error } = await supabase
            .from('applications')
            .update({ is_trash: isTrash, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            console.error('Error moving to trash:', error)
            throw error
        }

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
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error purging:', error)
            throw error
        }

        set((state) => ({
            applications: state.applications.filter(app => app.id !== id)
        }))
    },

    uploadResume: async (id, file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${id}-${Math.random()}.${fileExt}`
        const filePath = `applications/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Error uploading resume:', uploadError)
            throw uploadError
        }

        const { data } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath)

        await get().updateApplication(id, {
            resume_file_name: file.name,
            resume_text: data.publicUrl // Store the public URL in resume_text for now
        })

        return data.publicUrl
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setStatusFilter: (filter) => set({ statusFilter: filter }),
}))
