export type IssueArea = 'ui' | 'backend' | 'database' | 'feature_request' | 'other'
export type IssueSeverity = 'low' | 'medium' | 'high'

export interface IssueReport {
    id: string
    user_id: string
    area: IssueArea
    severity: IssueSeverity
    title: string
    description: string
    page_path: string | null
    contact_email: string | null
    status: 'open' | 'in_review' | 'resolved'
    created_at: string
}
