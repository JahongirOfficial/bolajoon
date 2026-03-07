'use client';

/**
 * PageTracker
 * Silently tracks page visits, time spent, and exit pages.
 * Sends data to /api/analytics — no UI, no impact on users.
 * Skips /admin/* routes automatically.
 */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function getSessionId() {
    try {
        let id = sessionStorage.getItem('_sid');
        if (!id) {
            id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
            sessionStorage.setItem('_sid', id);
        }
        return id;
    } catch {
        return 'unknown';
    }
}

function isFirstInSession() {
    try {
        const first = !sessionStorage.getItem('_sv');
        if (first) sessionStorage.setItem('_sv', '1');
        return first;
    } catch {
        return false;
    }
}

function sendView(payload) {
    try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics', blob);
    } catch {
        // sendBeacon not available (e.g. old browser) — silently ignore
    }
}

export default function PageTracker() {
    const pathname = usePathname();
    const { user } = useAuth();
    const enterTimeRef = useRef(Date.now());
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        // Never track admin pages
        if (pathname.startsWith('/admin')) return;

        const sessionId = getSessionId();
        const isEntry = isFirstInSession();
        enterTimeRef.current = Date.now();

        // Capture pathname for cleanup closure
        const currentPage = pathname;

        const sendExit = (isExit) => {
            const timeSpent = Math.round((Date.now() - enterTimeRef.current) / 1000);
            sendView({
                sessionId,
                page: currentPage,
                timeSpent,
                isEntry,
                isExit,
                userId: userRef.current?._id || null,
            });
        };

        const handleUnload = () => sendExit(true);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            // Navigation to another page — record time spent (not an exit from site)
            sendExit(false);
        };
    }, [pathname]);

    return null;
}
