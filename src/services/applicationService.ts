import { supabase } from '../lib/supabase'
import { createApplicationSchema, updateApplicationSchema, validateResumeFile, getFirstZodError } from '../lib/schemas'
import { AppError, ValidationError } from '../lib/errors'
import type { JobApplication } from '../types/job'
import { z } from 'zod'

// ─── Types ──────────────────────────────────────────────────

type CreateInput = z.infer<typeof createApplicationSchema>
type UpdateInput = z.infer<typeof updateApplicationSchema>

// ─── Queries ────────────────────────────────────────────────

export async function fetchApplications(): Promise<JobApplication[]> {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) throw new AppError(error.message, 'Failed to load applications.', 'FETCH_ERROR')
    return data as JobApplication[]
}

// ─── Mutations ──────────────────────────────────────────────

export async function createApplication(input: CreateInput): Promise<JobApplication> {
    // Validate
    const parsed = createApplicationSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError('No user session', 'Please sign in again.', 'AUTH_REQUIRED')

    // Clean optional URL
    const cleanData = {
        ...parsed.data,
        application_url: parsed.data.application_url || undefined,
        user_id: user.id,
    }

    const { data, error } = await supabase
        .from('applications')
        .insert([cleanData])
        .select()
        .single()

    if (error) throw new AppError(error.message, 'Failed to save application.', 'INSERT_ERROR')
    return data as JobApplication
}

export async function updateApplication(id: string, input: UpdateInput): Promise<JobApplication> {
    const parsed = updateApplicationSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    const { data, error } = await supabase
        .from('applications')
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw new AppError(error.message, 'Failed to update application.', 'UPDATE_ERROR')
    return data as JobApplication
}

export async function moveToTrash(id: string, isTrash: boolean): Promise<void> {
    const { error } = await supabase
        .from('applications')
        .update({ is_trash: isTrash, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new AppError(error.message, `Failed to ${isTrash ? 'trash' : 'restore'} application.`, 'TRASH_ERROR')
}

export async function purgeApplication(id: string): Promise<void> {
    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

    if (error) throw new AppError(error.message, 'Failed to permanently delete.', 'PURGE_ERROR')
}

// ─── File Upload ────────────────────────────────────────────

export async function uploadResume(applicationId: string, file: File): Promise<string> {
    // 0. Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError('No user session', 'Please sign in again.', 'AUTH_REQUIRED')

    // 1. Validate file
    const validation = validateResumeFile(file)
    if (!validation.success) throw new ValidationError(validation.error)

    // 2. Upload to Supabase Storage (Path must start with user.id for RLS)
    const fileExt = file.name.split('.').pop()
    const fileName = `${applicationId}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}` // Required by RLS policy

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

    if (uploadError) throw new AppError(uploadError.message, 'Failed to upload file.', 'UPLOAD_ERROR')

    // 3. Get public URL
    const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

    // 4. Update the application record
    await updateApplication(applicationId, {
        resume_file_name: file.name,
        resume_text: data.publicUrl,
    })

    return data.publicUrl
}

export async function getResumeUrl(path: string): Promise<string> {
    // Extract the relative storage path from a full public URL if needed
    // Supabase public URLs look like: .../storage/v1/object/public/resumes/USER_ID/FILE_NAME
    let relativePath = path
    if (path.includes('/resumes/')) {
        relativePath = path.split('/resumes/').pop() || path
    }

    // Try signed URL first (works for private buckets)
    try {
        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(relativePath, 3600) // 1 hour expiry
        if (!error && data?.signedUrl) return data.signedUrl
    } catch {
        // Signed URL failed — bucket is likely public, fall through
    }

    // Fallback: if the stored path is already a full URL, use it directly
    if (path.startsWith('http')) return path

    // Last resort: construct a fresh public URL
    const { data } = supabase.storage.from('resumes').getPublicUrl(relativePath)
    return data.publicUrl
}

export async function removeResume(applicationId: string, resumeUrl?: string): Promise<void> {
    // 1. Delete the file from storage if URL exists
    if (resumeUrl && resumeUrl.includes('/resumes/')) {
        const relativePath = resumeUrl.split('/resumes/').pop()
        if (relativePath) {
            await supabase.storage.from('resumes').remove([relativePath])
        }
    }

    // 2. Clear the resume fields in the database (bypass Zod — null is not a valid string)
    const { error } = await supabase
        .from('applications')
        .update({
            resume_file_name: null,
            resume_text: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

    if (error) throw new AppError(error.message, 'Failed to remove resume.', 'REMOVE_RESUME_ERROR')
}
