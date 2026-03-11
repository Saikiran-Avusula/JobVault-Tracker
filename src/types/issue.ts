export type IssueArea = 'ui' | 'backend' | 'database' | 'feature_request' | 'other'
export type IssueSeverity = 'low' | 'medium' | 'high'
export type IssueStatus = 'open' | 'in_progress' | 'in_review' | 'resolved'

export interface IssueReport {
    id: string
    user_id: string
    area: IssueArea
    severity: IssueSeverity
    title: string
    description: string
    page_path: string | null
    contact_email: string | null
    attachment_path: string | null
    status: IssueStatus
    admin_message: string | null
    created_at: string
    updated_at: string
}
