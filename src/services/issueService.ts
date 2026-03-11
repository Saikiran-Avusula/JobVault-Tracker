import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { issueReportSchema, getFirstZodError } from '../lib/schemas'
import { AppError, ValidationError } from '../lib/errors'
import type { IssueReport } from '../types/issue'

type CreateIssueInput = z.infer<typeof issueReportSchema>

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
