import { z } from 'zod'

// ─── Application Schemas ────────────────────────────────────

export const createApplicationSchema = z.object({
    company: z
        .string()
        .trim()
        .min(1, 'Company name is required')
        .max(100, 'Company name is too long'),
    role: z
        .string()
        .trim()
        .min(1, 'Role is required')
        .max(100, 'Role is too long'),
    application_url: z
        .string()
        .trim()
        .url('Enter a valid URL')
        .optional()
        .or(z.literal('')),
    jd_text: z
        .string()
        .max(10_000, 'Description is too long')
        .default(''),
    status: z.enum(['Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted']).default('Applied'),
    applied_date: z.string().default(() => new Date().toISOString()),
    follow_up_date: z.string().optional(),
    notes: z.string().max(5_000).default(''),
    skill_gaps: z.array(z.string().trim().max(50)).default([]),
    is_trash: z.boolean().default(false),
    resume_text: z.string().default(''),
    resume_file_name: z.string().optional(),
})

export const updateApplicationSchema = createApplicationSchema.partial()

// ─── Auth Schemas ───────────────────────────────────────────

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = loginSchema.extend({
    fullName: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(80, 'Name is too long'),
})

// ─── File Validation ────────────────────────────────────────

const MAX_RESUME_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_RESUME_TYPES = ['application/pdf']

export function validateResumeFile(file: File): { success: true } | { success: false; error: string } {
    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
        return { success: false, error: 'Only PDF files are allowed' }
    }
    if (file.size > MAX_RESUME_SIZE) {
        return { success: false, error: 'File size must be less than 5MB' }
    }
    return { success: true }
}

// ─── Helpers ────────────────────────────────────────────────

/** Extract the first error message from a ZodError */
export function getFirstZodError(error: z.ZodError): string {
    return error.issues[0]?.message ?? 'Invalid input'
}
