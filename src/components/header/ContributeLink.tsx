'use client';

import { Heart } from 'lucide-react';
import { analytics } from '@/lib/analytics';

/**
 * ContributeLink - Animated link to the contribution guide
 * 
 * Features:
 * - Heart icon with color change on hover
 * - Underline animation
 * - Analytics tracking
 * 
 * @param href - Optional custom contribution URL (defaults to CONTRIBUTING.md)
 * 
 * @example
 * <ContributeLink />
 */
export function ContributeLink({ href = "https://github.com/abusoww/tuxmate/blob/main/CONTRIBUTING.md" }: { href?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contribute to TuxMate on GitHub"
            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300"
            onClick={() => analytics.contributeClicked()}
        >
            <Heart className="w-4 h-4 transition-all duration-300 group-hover:text-rose-400 group-hover:scale-110" />
            <span className="hidden sm:inline relative">
                Contribute
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--text-muted)] transition-all duration-300 group-hover:w-full" />
            </span>
        </a>
    );
}
