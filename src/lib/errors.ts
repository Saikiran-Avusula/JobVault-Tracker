import toast from 'react-hot-toast'

// ─── Error Classes ──────────────────────────────────────────

export class AppError extends Error {
    public readonly userMessage: string;
    public readonly code?: string;

    constructor(
        message: string,
        userMessage: string,
        code?: string
    ) {
        super(message)
        this.userMessage = userMessage
        this.code = code
        this.name = 'AppError'
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, message, 'VALIDATION_ERROR')
        this.name = 'ValidationError'
    }
}

export class AuthError extends AppError {
    constructor(message: string, userMessage?: string) {
        super(message, userMessage ?? 'Authentication failed. Please try again.', 'AUTH_ERROR')
        this.name = 'AuthError'
    }
}

export class NetworkError extends AppError {
    constructor(message: string) {
        super(message, 'Network error. Check your connection and try again.', 'NETWORK_ERROR')
        this.name = 'NetworkError'
    }
}

// ─── Centralized Error Handler ──────────────────────────────

/**
 * Maps any error to a user-friendly toast.
 * Returns the user-facing message for cases where callers need it.
 */
export function handleError(error: unknown): string {
    // Already an AppError — show the user message
    if (error instanceof AppError) {
        toast.error(error.userMessage)
        console.error(`[${error.code}]`, error.message)
        return error.userMessage
    }

    // Supabase errors have a `message` property
    if (error instanceof Error) {
        const msg = mapSupabaseError(error.message)
        toast.error(msg)
        console.error('[UNHANDLED]', error.message)
        return msg
    }

    // Fallback
    const fallback = 'Something went wrong. Please try again.'
    toast.error(fallback)
    console.error('[UNKNOWN]', error)
    return fallback
}

// ─── Supabase Error Mapping ─────────────────────────────────

function mapSupabaseError(message: string): string {
    const lower = message.toLowerCase()

    if (lower.includes('invalid login credentials'))
        return 'Incorrect email or password.'

    if (lower.includes('user already registered'))
        return 'An account with this email already exists.'

    if (lower.includes('email not confirmed'))
        return 'Please verify your email before signing in.'

    if (lower.includes('jwt expired') || lower.includes('token'))
        return 'Your session expired. Please sign in again.'

    if (lower.includes('row-level security') || lower.includes('rls'))
        return 'Permission denied. Please sign in again.'

    if (lower.includes('network') || lower.includes('fetch'))
        return 'Network error. Check your connection.'

    if (lower.includes('storage') || lower.includes('bucket'))
        return 'File storage error. Please try again.'

    // If nothing matches, show the original (Supabase messages are usually user-friendly)
    return message
}
