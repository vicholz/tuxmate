'use client';

export function LoadingSkeleton() {
    // Matches the actual app layout roughly
    const columns = [
        [{ apps: 10 }, { apps: 12 }],
        [{ apps: 9 }, { apps: 13 }],
        [{ apps: 11 }, { apps: 11 }],
        [{ apps: 12 }, { apps: 10 }],
        [{ apps: 10 }, { apps: 12 }]
    ];

    const widths = ['55%', '72%', '45%', '82%', '60%', '48%', '78%', '65%', '88%', '42%', '70%', '58%', '68%', '52%'];

    return (
        <>
            <style jsx global>{`
                @keyframes skeletonShimmer {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                @keyframes skeletonWave {
                    0%, 100% { opacity: 0.25; }
                    50% { opacity: 0.55; }
                }
                .sk-pulse {
                    animation: skeletonShimmer 1.8s ease-in-out infinite;
                    will-change: opacity;
                }
                .sk-wave {
                    animation: skeletonWave 2s ease-in-out infinite;
                    will-change: opacity;
                }
            `}</style>

            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
                {/* Header - logo, title, controls */}
                <header className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[var(--bg-tertiary)] rounded-xl sk-pulse"
                                    style={{ animationDelay: '0s' }}
                                />
                                <div className="flex flex-col gap-2.5">
                                    <div
                                        className="h-6 w-28 bg-[var(--bg-tertiary)] rounded-md sk-pulse"
                                        style={{ animationDelay: '0.1s' }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-52 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                            style={{ animationDelay: '0.15s' }}
                                        />
                                        <span className="text-[var(--text-muted)] opacity-20 text-[10px]">•</span>
                                        <div
                                            className="h-3 w-14 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-4 w-16 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                    style={{ animationDelay: '0.25s' }}
                                />
                                <div
                                    className="h-4 w-20 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                    style={{ animationDelay: '0.3s' }}
                                />
                                <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-primary)]">
                                    <div
                                        className="w-5 h-5 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                        style={{ animationDelay: '0.35s' }}
                                    />
                                    <div
                                        className="w-5 h-5 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                        style={{ animationDelay: '0.38s' }}
                                    />
                                    <div
                                        className="h-10 bg-[var(--bg-secondary)] border-l-4 border-[var(--accent)] rounded-md flex items-center gap-2 pl-3 pr-3 sk-wave"
                                        style={{ animationDelay: '0.4s' }}
                                    >
                                        <div className="w-5 h-5 bg-[var(--bg-tertiary)] rounded" />
                                        <div className="w-14 h-3 bg-[var(--bg-tertiary)] rounded" />
                                        <div className="w-4 h-4 bg-[var(--bg-tertiary)] rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* App grid - categories and items */}
                <main className="px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6">
                            {columns.map((cats, colIdx) => (
                                <div key={colIdx}>
                                    {cats.map((cat, catIdx) => (
                                        <div key={catIdx} className="mb-5">
                                            <div
                                                className="w-full h-7 flex items-center gap-1.5 border-l-4 border-[var(--accent)] pl-2 mb-2.5 bg-[var(--bg-secondary)] sk-wave"
                                                style={{ animationDelay: `${colIdx * 0.05 + catIdx * 0.1}s` }}
                                            >
                                                <div className="w-4 h-4 bg-[var(--bg-tertiary)] rounded-sm" />
                                                <div className="w-4 h-4 bg-[var(--bg-tertiary)] rounded-sm" />
                                                <div className="flex-1 h-3 bg-[var(--bg-tertiary)] max-w-24 rounded" />
                                            </div>
                                            {[...Array(cat.apps)].map((_, i) => (
                                                <div key={i} className="flex items-center gap-2.5 py-1.5 px-2">
                                                    <div
                                                        className="w-4 h-4 rounded border-2 border-[var(--border-secondary)] sk-pulse flex-shrink-0"
                                                        style={{ animationDelay: `${colIdx * 0.03 + i * 0.02}s` }}
                                                    />
                                                    <div
                                                        className="w-5 h-5 rounded bg-[var(--bg-tertiary)] sk-pulse flex-shrink-0"
                                                        style={{ animationDelay: `${colIdx * 0.03 + i * 0.02 + 0.01}s` }}
                                                    />
                                                    <div
                                                        className="h-4 bg-[var(--bg-tertiary)] rounded sk-pulse"
                                                        style={{
                                                            width: widths[(colIdx * 3 + catIdx * 5 + i) % widths.length],
                                                            animationDelay: `${colIdx * 0.03 + i * 0.02 + 0.02}s`
                                                        }}
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
            </div>
        </>
    );
}
