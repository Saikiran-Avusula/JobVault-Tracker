import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { issueReportSchema, issueStatusUpdateSchema, validateIssueImageFile, getFirstZodError } from '../lib/schemas'
import { AppError, ValidationError } from '../lib/errors'
import type { IssueReport } from '../types/issue'

type CreateIssueInput = z.infer<typeof issueReportSchema>
type UpdateIssueStatusInput = z.infer<typeof issueStatusUpdateSchema>

export const ADMIN_EMAIL = 'saikiranavusula89@gmail.com'

export function isAdminEmail(email?: string | null): boolean {
    return (email || '').toLowerCase() === ADMIN_EMAIL
}

export async function createIssueReport(input: CreateIssueInput): Promise<IssueReport> {
    const parsed = issueReportSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new AppError('No user session', 'Please sign in again.', 'AUTH_REQUIRED')

    const payload = {
        ...parsed.data,
        user_id: user.id,
        page_path: parsed.data.page_path || null,
        contact_email: parsed.data.contact_email || null,
        attachment_path: parsed.data.attachment_path || null,
    }

    const { data, error } = await supabase.from('issue_reports').insert([payload]).select().single()

    if (error) throw new AppError(error.message, 'Failed to submit your report.', 'ISSUE_CREATE_ERROR')

    return data as IssueReport
}

export async function fetchMyIssueReports(limit = 20): Promise<IssueReport[]> {
    const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw new AppError(error.message, 'Failed to load reports.', 'ISSUE_FETCH_ERROR')

    return (data || []) as IssueReport[]
}

export async function fetchAllIssueReports(limit = 100): Promise<IssueReport[]> {
    const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw new AppError(error.message, 'Failed to load issue reports.', 'ISSUE_FETCH_ERROR')

    return (data || []) as IssueReport[]
}

export async function updateIssueReportStatus(id: string, input: UpdateIssueStatusInput): Promise<IssueReport> {
    const parsed = issueStatusUpdateSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(getFirstZodError(parsed.error))

    const { data, error } = await supabase
        .from('issue_reports')
        .update({
            status: parsed.data.status,
            admin_message: parsed.data.admin_message || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

    if (error) throw new AppError(error.message, 'Failed to update issue status.', 'ISSUE_UPDATE_ERROR')

    return data as IssueReport
}

export async function uploadIssueAttachment(file: File): Promise<string> {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new AppError('No user session', 'Please sign in again.', 'AUTH_REQUIRED')

    const validation = validateIssueImageFile(file)
    if (!validation.success) throw new ValidationError(validation.error)

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filePath = `${user.id}/${Date.now()}-${sanitizedBaseName}.${fileExt}`

    const { error } = await supabase.storage
        .from('issue-attachments')
        .upload(filePath, file, { upsert: false })

    if (error) throw new AppError(error.message, 'Failed to upload screenshot.', 'ISSUE_ATTACHMENT_UPLOAD_ERROR')

    return filePath
}

export async function getIssueAttachmentUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from('issue-attachments')
        .createSignedUrl(path, 3600)

    if (error) throw new AppError(error.message, 'Could not load screenshot.', 'ISSUE_ATTACHMENT_ACCESS_ERROR')
    if (!data?.signedUrl) throw new AppError('No signed URL', 'Could not load screenshot.', 'ISSUE_ATTACHMENT_ACCESS_ERROR')

    return data.signedUrl
}
