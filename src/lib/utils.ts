// Utility helpers

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function timeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatLocalTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

export function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗜️'
    if (mimeType.includes('markdown') || mimeType.includes('text')) return '📃'
    if (mimeType.includes('video')) return '🎬'
    if (mimeType.includes('audio')) return '🎵'
    return '📁'
}

export function getFileColor(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '#8B5CF6'
    if (mimeType === 'application/pdf') return '#EF4444'
    if (mimeType.includes('word') || mimeType.includes('document')) return '#2563EB'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '#10B981'
    if (mimeType.includes('zip')) return '#F59E0B'
    if (mimeType.includes('markdown') || mimeType.includes('text')) return '#6B7280'
    return '#3B82F6'
}

export function clsx(...args: (string | boolean | undefined | null)[]): string {
    return args.filter(Boolean).join(' ')
}

export const FOLDER_COLORS = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#EC4899', '#06B6D4', '#6B7280',
]
