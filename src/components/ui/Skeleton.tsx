import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800/50",
                className
            )}
            {...props}
        />
    )
}

export function ApplicationCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#0c1020]/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-premium space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 flex-1 rounded-full" />
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#0c1020]/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
        </div>
    )
}
