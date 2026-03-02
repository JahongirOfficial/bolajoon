'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PopTheBalloonRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to test page if no lessonId provided
        router.replace('/games/pop-the-balloon/test');
    }, [router]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#87CEEB' }}>
            <div className="text-center">
                <div className="spinner-border text-white" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
                <p className="text-white mt-3 fw-semibold">O'yin yuklanmoqda...</p>
            </div>
        </div>
    );
}
