"use client"

import { useState, useEffect, useCallback } from "react"

export function useTheme() {
    // Initial state reads from DOM to match what the inline script set
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('light') ? 'light' : 'dark';
        }
        return 'light'; // SSR default
    });
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // On mount, sync with localStorage (which should match DOM already)
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.classList.toggle('light', saved === 'light');
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('light', theme === 'light');
    }, [theme, hydrated]);

    const toggle = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return { theme, toggle };
}
