'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Copy, ChevronUp, X, Download } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { AurBar } from './AurBar';

/**
 * CommandFooter - Fixed bottom bar with command output
 * 
 * Features:
 * - Command preview with copy button
 * - Download button for shell script
 * - Slide-up drawer for full command view
 * - AUR bar for Arch with yay status
 * - Mobile responsive (bottom sheet) and desktop (centered modal)
 * 
 * @param command - Generated install command
 * @param selectedCount - Number of selected apps
 * @param selectedDistro - Currently selected distro ID
 * @param selectedApps - Set of selected app IDs
 * @param hasAurPackages - Whether any AUR packages are selected
 * @param aurAppNames - Array of AUR app names
 * @param hasYayInstalled - Whether yay is installed
 * @param setHasYayInstalled - Callback to update yay status
 * 
 * @example
 * <CommandFooter
 *   command={generatedCommand}
 *   selectedCount={selectedApps.size}
 *   selectedDistro="arch"
 *   selectedApps={selectedApps}
 *   hasAurPackages={true}
 *   aurAppNames={["Discord"]}
 *   hasYayInstalled={false}
 *   setHasYayInstalled={setHasYay}
 * />
 */
export function CommandFooter({
    command,
    selectedCount,
    selectedDistro,
    selectedApps,
    hasAurPackages,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled
}: {
    command: string;
    selectedCount: number;
    selectedDistro: DistroId;
    selectedApps: Set<string>;
    hasAurPackages: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
}) {
    const [copied, setCopied] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);

    const closeDrawer = useCallback(() => {
        setDrawerClosing(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setDrawerClosing(false);
        }, 250);
    }, []);

    // Close drawer on Escape key
    useEffect(() => {
        if (!drawerOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [drawerOpen, closeDrawer]);

    const handleCopy = async () => {
        if (selectedCount === 0) return;
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setShowCopyTooltip(true);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.commandCopied(distroName, selectedCount);
        setTimeout(() => {
            setCopied(false);
            setShowCopyTooltip(false);
        }, 3000);
    };

    const handleDownload = () => {
        if (selectedCount === 0) return;
        const script = generateInstallScript({
            distroId: selectedDistro,
            selectedAppIds: selectedApps,
        });
        const blob = new Blob([script], { type: 'text/x-shellscript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuxmate-${selectedDistro}.sh`;
        a.click();
        // Delay revoke to ensure download starts (click is async)
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.scriptDownloaded(distroName, selectedCount);
    };

    const showAurBar = selectedDistro === 'arch' && hasAurPackages;

    return (
        <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: 10 }}>
            {/* AUR Bar - seamlessly stacked above command bar with slide animation */}
            <div
                className="grid transition-all duration-300 ease-out"
                style={{
                    gridTemplateRows: showAurBar ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.3s ease-out'
                }}
            >
                <div className="overflow-hidden">
                    <AurBar
                        aurAppNames={aurAppNames}
                        hasYayInstalled={hasYayInstalled}
                        setHasYayInstalled={setHasYayInstalled}
                    />
                </div>
            </div>

            {/* Command Bar - Compact */}
            <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border-primary)]" style={{ transition: 'background-color 0.5s, border-color 0.5s' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-[var(--text-muted)] whitespace-nowrap tabular-nums hidden sm:block font-medium min-w-[20px]" style={{ transition: 'color 0.5s' }}>{selectedCount}</span>
                        <div
                            className="flex-1 min-w-0 bg-[var(--bg-tertiary)] rounded-lg font-mono text-sm cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group overflow-hidden"
                            style={{ transition: 'background-color 0.5s' }}
                            onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                        >
                            <div className="flex items-start gap-3 px-4 pt-3 pb-1">
                                <div className="flex-1 min-w-0 overflow-x-auto command-scroll">
                                    <code className={`whitespace-nowrap ${selectedCount > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`} style={{ transition: 'color 0.5s' }}>{command}</code>
                                </div>
                                {selectedCount > 0 && (
                                    <div className="shrink-0 w-6 h-6 rounded-md bg-[var(--bg-hover)] group-hover:bg-[var(--accent)]/20 flex items-center justify-center transition-all">
                                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Download Button with Tooltip */}
                        <div className="relative flex items-center"
                            onMouseEnter={() => selectedCount > 0 && setShowDownloadTooltip(true)}
                            onMouseLeave={() => setShowDownloadTooltip(false)}
                        >
                            <button onClick={handleDownload} disabled={selectedCount === 0}
                                className={`h-11 w-11 sm:w-auto sm:px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 outline-none ${selectedCount > 0 ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`} style={{ transition: 'background-color 0.5s, color 0.5s' }}>
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Download</span>
                            </button>
                            {showDownloadTooltip && (
                                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm rounded-lg shadow-xl border border-[var(--border-secondary)] whitespace-nowrap"
                                    style={{ animation: 'tooltipSlideUp 0.3s ease-out forwards' }}>
                                    Download install script
                                    <div className="absolute right-4 translate-x-1/2 w-2.5 h-2.5 bg-[var(--bg-tertiary)] border-r border-b border-[var(--border-secondary)] rotate-45" style={{ bottom: '-6px' }} />
                                </div>
                            )}
                        </div>
                        {/* Copy Button with Tooltip */}
                        <div className="relative flex items-center">
                            <button onClick={handleCopy} disabled={selectedCount === 0}
                                className={`h-11 px-5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 outline-none ${selectedCount > 0 ? (copied ? 'bg-emerald-600 text-white' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90') : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            {showCopyTooltip && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap"
                                    style={{ animation: 'tooltipSlideUp 0.3s ease-out forwards' }}>
                                    Paste this in your terminal!
                                    <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-600 rotate-45" style={{ bottom: '-5px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-up Drawer */}
            {drawerOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={closeDrawer}
                        aria-hidden="true"
                        style={{ animation: drawerClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.2s ease-out' }}
                    />
                    {/* Drawer - Mobile: bottom sheet, Desktop: centered modal */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="drawer-title"
                        className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl
                            bottom-0 left-0 right-0 rounded-t-2xl
                            md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-[90vw]"
                        style={{
                            animation: drawerClosing ? 'slideDown 0.25s ease-in forwards' : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            maxHeight: '80vh'
                        }}
                    >
                        {/* Drawer Handle - mobile only */}
                        <div className="flex justify-center pt-3 pb-2 md:hidden">
                            <button
                                className="w-12 h-1.5 bg-[var(--text-muted)]/40 rounded-full cursor-pointer hover:bg-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]"
                                onClick={closeDrawer}
                                aria-label="Close drawer"
                            />
                        </div>

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 pb-3 md:pt-4 border-b border-[var(--border-primary)]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <span className="text-emerald-500 font-bold text-sm">$</span>
                                </div>
                                <div>
                                    <h3 id="drawer-title" className="text-sm font-semibold text-[var(--text-primary)]">Terminal Command</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{selectedCount} app{selectedCount !== 1 ? 's' : ''} • Press Esc to close</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                aria-label="Close drawer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Command Content - Terminal style */}
                        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                {/* Terminal header with action buttons on desktop */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        <span className="ml-2 text-xs text-[var(--text-muted)]">bash</span>
                                    </div>
                                    {/* Desktop inline actions */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <button
                                            onClick={handleDownload}
                                            className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-medium"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => { handleCopy(); setTimeout(closeDrawer, 3000); }}
                                            className={`h-7 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                                }`}
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                {/* Terminal content */}
                                <div className="p-4 font-mono text-sm overflow-x-auto">
                                    <div className="flex gap-2">
                                        <span className="text-emerald-400 select-none shrink-0">$</span>
                                        <code className="text-gray-300 break-all whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>
                                            {command}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions - mobile only (stacked) */}
                        <div className="md:hidden flex flex-col items-stretch gap-3 px-4 py-4 border-t border-[var(--border-primary)]">
                            <button
                                onClick={handleDownload}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                aria-label="Download install script"
                            >
                                <Download className="w-5 h-5" />
                                Download Script
                            </button>
                            <button
                                onClick={() => { handleCopy(); setTimeout(closeDrawer, 3000); }}
                                className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-xl font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${copied
                                    ? 'bg-emerald-600 text-white focus:ring-emerald-500'
                                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 focus:ring-[var(--accent)]'
                                    }`}
                                aria-label={copied ? 'Command copied to clipboard' : 'Copy command to clipboard'}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Command'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
