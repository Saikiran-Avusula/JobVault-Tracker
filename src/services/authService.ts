import { supabase } from '../lib/supabase'
import { loginSchema, signUpSchema, getFirstZodError } from '../lib/schemas'
import { AuthError, ValidationError, AppError } from '../lib/errors'

export async function signInWithEmail(email: string, password: string) {
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    })

    if (error) throw new AuthError(error.message)
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
    const parsed = signUpSchema.safeParse({ email, password, fullName })
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { full_name: parsed.data.fullName } },
    })

    if (error) throw new AuthError(error.message)
}

export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    })

    if (error) throw new AuthError(error.message, 'Google login failed. Please try again.')
}

export async function deleteAccount(): Promise<void> {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new AuthError('No active session')

    const { data: apps, error: fetchError } = await supabase
        .from('applications')
        .select('resume_text')
        .eq('user_id', user.id)
        .not('resume_text', 'is', null)

    if (fetchError) throw new AppError(fetchError.message, 'Failed to load account files.', 'FETCH_FILES_ERROR')

    const filePaths = (apps || [])
        .map((app) => app.resume_text as string | null)
        .filter((value): value is string => Boolean(value))
        .map((value) => (value.includes('/resumes/') ? value.split('/resumes/').pop() || '' : value))
        .filter(Boolean)

    if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from('resumes').remove(filePaths)
        if (storageError) throw new AppError(storageError.message, 'Failed to delete account files.', 'DELETE_FILES_ERROR')
    }

    const { error: dataError } = await supabase.from('applications').delete().eq('user_id', user.id)

    if (dataError) throw new AppError(dataError.message, 'Failed to delete your data.', 'DELETE_DATA_ERROR')

    const { error: rpcError } = await supabase.rpc('delete_user')
    if (rpcError) {
        console.warn('RPC delete_user not available:', rpcError.message)
    }

    await supabase.auth.signOut()
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new AuthError(error.message, 'Failed to sign out.')
}
