'use client';

import { useState } from 'react';

/**
 * AppIcon - Application icon with lazy loading and fallback
 * 
 * Displays the app's icon from URL, with graceful fallback
 * to the first letter of the app name in a colored square.
 * 
 * @param url - URL to the app icon image
 * @param name - Name of the app (used for fallback)
 * 
 * @example
 * <AppIcon url="/icons/firefox.svg" name="Firefox" />
 */
export function AppIcon({ url, name }: { url: string; name: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="w-4 h-4 rounded bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold">
                {name[0]}
            </div>
        );
    }

    return (
        <img
            src={url}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="w-4 h-4 object-contain opacity-75"
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}
