import type { User } from '@supabase/supabase-js'

function getMetadata(user: User | null | undefined): Record<string, unknown> {
    return (user?.user_metadata as Record<string, unknown> | undefined) || {}
}

export function getUserAvatarUrl(user: User | null | undefined): string {
    const metadata = getMetadata(user)
    return String(metadata.avatar_url || metadata.picture || metadata.photo_url || '')
}

export function getUserDisplayName(user: User | null | undefined): string {
    const metadata = getMetadata(user)
    return String(metadata.full_name || metadata.name || user?.email || 'User')
}

export function getUserInitials(user: User | null | undefined): string {
    const displayName = getUserDisplayName(user).trim()
    if (displayName) {
        return displayName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
    }

    return user?.email?.[0]?.toUpperCase() || 'U'
}
