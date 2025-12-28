'use client';

/**
 * LoadingSkeleton - Placeholder UI while localStorage hydrates
 * 
 * Shows animated skeleton blocks mimicking the app grid layout
 * to prevent layout shift and provide visual feedback during loading.
 */
export function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Header Skeleton */}
            <header className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            {/* Logo placeholder */}
                            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-[var(--bg-tertiary)] animate-pulse" />
                            <div className="flex flex-col gap-2">
                                <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                                <div className="h-3 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                                <div className="h-3 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-20 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                            <div className="h-10 w-28 bg-[var(--bg-tertiary)] rounded-2xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Grid Skeleton */}
            <main className="px-4 sm:px-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-8">
                        {[...Array(5)].map((_, colIdx) => (
                            <div key={colIdx} className="space-y-5">
                                {[...Array(3)].map((_, catIdx) => (
                                    <div key={catIdx} className="mb-5">
                                        {/* Category header skeleton */}
                                        <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-[var(--border-primary)]">
                                            <div className="w-3 h-3 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                                            <div className="h-3 w-20 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                                        </div>
                                        {/* App items skeleton */}
                                        {[...Array(4 + catIdx)].map((_, appIdx) => (
                                            <div
                                                key={appIdx}
                                                className="flex items-center gap-2.5 py-1.5 px-2"
                                                style={{ animationDelay: `${(colIdx * 3 + catIdx) * 50 + appIdx * 20}ms` }}
                                            >
                                                <div className="w-4 h-4 rounded border-2 border-[var(--bg-tertiary)] animate-pulse" />
                                                <div className="w-5 h-5 rounded bg-[var(--bg-tertiary)] animate-pulse" />
                                                <div
                                                    className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse"
                                                    style={{ width: `${70 + (appIdx % 3) * 10}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
                <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
                    <div className="h-10 flex-1 mr-4 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
