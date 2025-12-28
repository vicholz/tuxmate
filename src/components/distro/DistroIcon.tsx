'use client';

import { useState } from 'react';

/**
 * DistroIcon - Distribution icon with fallback
 * 
 * Displays the distro's icon from URL, with graceful fallback
 * to the first letter of the distro name in a colored circle.
 * 
 * @param url - URL to the distro icon image
 * @param name - Name of the distro (used for fallback)
 * @param size - Icon size in pixels (default: 20)
 * 
 * @example
 * <DistroIcon url="/icons/ubuntu.svg" name="Ubuntu" />
 * <DistroIcon url="/icons/fedora.svg" name="Fedora" size={24} />
 */
export function DistroIcon({ url, name, size = 20 }: { url: string; name: string; size?: number }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div
                className="rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white"
                style={{ width: size, height: size }}
            >
                {name[0]}
            </div>
        );
    }

    return (
        <img
            src={url}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            className="object-contain"
            style={{ width: size, height: size }}
            onError={() => setError(true)}
        />
    );
}
