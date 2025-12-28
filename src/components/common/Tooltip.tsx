'use client';

/**
 * Tooltip - Positioned tooltip with markdown-like formatting
 * 
 * Features:
 * - Supports inline code, bold text, and links
 * - Slide-up animation
 * - Arrow pointer
 * - Hover persistence (tooltip stays visible when hovered)
 * 
 * @param tooltip - Tooltip data (text, position, key)
 * @param onEnter - Callback when mouse enters tooltip
 * @param onLeave - Callback when mouse leaves tooltip
 * 
 * @example
 * <Tooltip
 *   tooltip={{ text: "Hello **world**", x: 100, y: 200, key: 1 }}
 *   onEnter={() => {}}
 *   onLeave={() => {}}
 * />
 */

/**
 * Renders a single line with inline formatting
 */
function renderLine(text: string) {
    // Split by code, links, and bold
    const parts = text.split(/(`[^`]+`|\[.*?\]\(.*?\)|\*\*.*?\*\*)/);
    return parts.map((part, i) => {
        // Check for inline code
        const codeMatch = part.match(/^`([^`]+)`$/);
        if (codeMatch) {
            return (
                <code key={i} className="bg-[var(--bg-primary)] px-1.5 py-0.5 rounded text-[var(--accent)] font-mono text-[10px] select-all break-all">
                    {codeMatch[1]}
                </code>
            );
        }
        // Check for bold
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
            return <strong key={i} className="font-semibold text-[var(--text-primary)]">{boldMatch[1]}</strong>;
        }
        // Check for links
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
            return (
                <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
                    className="text-[var(--accent)] underline hover:opacity-80">
                    {linkMatch[1]}
                </a>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

/**
 * Renders tooltip content with newline support
 */
function renderTooltipContent(text: string) {
    // First handle escaped newlines
    const lines = text.split(/\\n/);

    return lines.map((line, lineIdx) => (
        <span key={lineIdx}>
            {lineIdx > 0 && <br />}
            {renderLine(line)}
        </span>
    ));
}

export interface TooltipData {
    text: string;
    x: number;
    y: number;
    width?: number;
    key?: number;
}

export function Tooltip({
    tooltip,
    onEnter,
    onLeave
}: {
    tooltip: TooltipData | null;
    onEnter: () => void;
    onLeave: () => void;
}) {
    if (!tooltip) return null;

    return (
        <div
            key={tooltip.key}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="fixed px-3 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs rounded-lg shadow-xl border border-[var(--border-secondary)] max-w-[320px] leading-relaxed"
            style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 99999,
                animation: 'tooltipSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}>
            {renderTooltipContent(tooltip.text)}
            {/* Arrow pointer */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-tertiary)] border-r border-b border-[var(--border-secondary)] rotate-45"
                style={{ bottom: '-7px' }}
            />
        </div>
    );
}
