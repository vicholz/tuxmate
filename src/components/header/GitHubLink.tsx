'use client';

import { Github } from 'lucide-react';
import { analytics } from '@/lib/analytics';

/**
 * GitHubLink - Animated link to the GitHub repository
 * 
 * Features:
 * - Icon rotation on hover
 * - Underline animation
 * - Analytics tracking
 * 
 * @param href - Optional custom GitHub URL (defaults to TuxMate repo)
 * 
 * @example
 * <GitHubLink />
 * <GitHubLink href="https://github.com/user/other-repo" />
 */
export function GitHubLink({ href = "https://github.com/abusoww/tuxmate" }: { href?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300"
            title="View on GitHub"
            onClick={() => analytics.githubClicked()}
        >
            <Github className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            <span className="hidden sm:inline relative">
                GitHub
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--text-muted)] transition-all duration-300 group-hover:w-full" />
            </span>
        </a>
    );
}
