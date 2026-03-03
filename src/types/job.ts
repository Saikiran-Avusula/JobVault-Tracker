export type JobStatus = 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

export interface JobApplication {
    id: string;
    user_id: string;
    company: string;
    role: string;
    location?: string;
    status: JobStatus;
    applied_date: string;
    follow_up_date?: string;
    jd_text: string | null;
    resume_text: string | null;
    resume_file_name?: string | null;
    skill_gaps: string[];
    notes: string;
    application_url?: string;
    updated_at: string;
    is_trash: boolean;
}

export interface ApplicationTemplate {
    id: string;
    name: string;
    jd_text: string;
    notes: string;
    skill_gaps: string[];
    created_at: string;
}
