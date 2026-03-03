import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    loading: boolean
    setUser: (user: User | null) => void
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user, loading: false }),
    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
    },
}))

// Listen to auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setUser(session?.user ?? null)
})
