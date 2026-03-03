import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
    theme: 'light' | 'dark'
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'jobvault-theme',
        }
    )
)

// Reactively sync theme class on <html>
const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
    } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
    }
}

// Apply on initial load
applyTheme(useThemeStore.getState().theme)

// Subscribe to changes
useThemeStore.subscribe((state) => applyTheme(state.theme))
