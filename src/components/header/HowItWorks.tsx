'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { analytics } from '@/lib/analytics';

/**
 * HowItWorks - Interactive help popup with quick start guide
 * 
 * Displays a popup with:
 * - Quick start steps for using TuxMate
 * - Info about unavailable apps
 * - Arch/AUR specific info
 * - Keyboard shortcuts
 * - Pro tips
 * 
 * @example
 * <HowItWorks />
 */
export function HowItWorks() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                popupRef.current && !popupRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const getPopupPosition = () => {
        if (!triggerRef.current) return { top: 0, left: 0 };
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 12,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - 420)),
        };
    };

    const pos = isOpen ? getPopupPosition() : { top: 0, left: 0 };

    const popup = isOpen && mounted ? (
        <div
            ref={popupRef}
            className="how-it-works-popup bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] shadow-2xl"
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                zIndex: 99999,
                borderRadius: '16px',
                width: '400px',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'min(70vh, 600px)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'popupSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
            }}
        >
            {/* Header - fixed */}
            <div className="flex items-center justify-between gap-2 p-4 pb-3 border-b border-[var(--border-primary)] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">How TuxMate Works</h3>
                        <p className="text-xs text-[var(--text-muted)]">Quick guide &amp; tips</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarGutter: 'stable' }}>
                {/* Quick Start Steps */}
                <div>
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Start</h4>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">1</div>
                            <p className="text-sm text-[var(--text-secondary)]">Select your distro from the dropdown</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">2</div>
                            <p className="text-sm text-[var(--text-secondary)]">Check the apps you want to install</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">3</div>
                            <p className="text-sm text-[var(--text-secondary)]">Copy the command or download the script</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">4</div>
                            <p className="text-sm text-[var(--text-secondary)]">Paste in terminal (<code className="text-xs bg-[var(--bg-tertiary)] px-1 py-0.5 rounded">Ctrl+Shift+V</code>) and run</p>
                        </div>
                    </div>
                </div>

                {/* Unavailable Apps */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">App Not Available?</h4>
                    <div className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
                        <p>Greyed-out apps aren&apos;t in your distro&apos;s repos. Here&apos;s what you can do:</p>
                        <ul className="space-y-2 ml-2">
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Use Flatpak/Snap:</strong> Switch to Flatpak or Snap in the distro selector for universal packages</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Download from website:</strong> Visit the app&apos;s official site and grab the <code className="bg-[var(--bg-tertiary)] px-1 rounded">.deb</code>, <code className="bg-[var(--bg-tertiary)] px-1 rounded">.rpm</code>, or <code className="bg-[var(--bg-tertiary)] px-1 rounded">.AppImage</code></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Check GitHub Releases:</strong> Many apps publish packages on their GitHub releases page</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Hover the ⓘ icon:</strong> Some unavailable apps show links to alternative download methods</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Arch & AUR */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Arch Linux &amp; AUR</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Some Arch packages are in the <strong className="text-[var(--text-secondary)]">AUR</strong> (Arch User Repository).
                        TuxMate uses <code className="bg-[var(--bg-tertiary)] px-1 rounded">yay</code> to install these.
                        If you don&apos;t have yay, check &quot;I have yay installed&quot; to skip auto-installation, or leave it unchecked to install yay first.
                    </p>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Keyboard Shortcuts</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">↑↓</kbd>
                            <span className="text-[var(--text-muted)]">Navigate apps</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Space</kbd>
                            <span className="text-[var(--text-muted)]">Toggle selection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Enter</kbd>
                            <span className="text-[var(--text-muted)]">Expand/collapse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Esc</kbd>
                            <span className="text-[var(--text-muted)]">Close popups</span>
                        </div>
                    </div>
                </div>

                {/* Pro Tips */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Pro Tips</h4>
                    <ul className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>The <strong className="text-[var(--text-secondary)]">download button</strong> gives you a full shell script with progress tracking, error handling, and a summary</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Your selections are <strong className="text-[var(--text-secondary)]">saved automatically</strong> — come back anytime to modify your setup</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.deb</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dpkg -i file.deb</code> or double-click in your file manager</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.rpm</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dnf install ./file.rpm</code> or <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo zypper install ./file.rpm</code></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Arrow pointer */}
            <div
                className="absolute w-3 h-3 bg-[var(--bg-secondary)] border-l border-t border-[var(--border-primary)] rotate-45"
                style={{ top: '-7px', left: '24px' }}
            />
        </div>
    ) : null;

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => {
                    const wasOpen = isOpen;
                    setIsOpen(!isOpen);
                    if (!wasOpen) analytics.helpOpened();
                    else analytics.helpClosed();
                }}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap">How it works?</span>
            </button>
            {mounted && typeof document !== 'undefined' && createPortal(popup, document.body)}
        </>
    );
}
