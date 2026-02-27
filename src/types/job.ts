export type JobStatus = 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

export interface JobApplication {
    id: string;
    user_id: string;
    company: string;
    role: string;
    status: JobStatus;
    applied_date: string; // ISO
    follow_up_date?: string; // ISO
    jd_text: string;
    resume_text: string;
    resume_file_name?: string;
    skill_gaps: string[];
    notes: string;
    application_url?: string;
    updated_at: string;
    is_trash: boolean;
}

export interface ActivityLog {
    id: string;
    jobId: string;
    action: string;
    timestamp: string;
}
