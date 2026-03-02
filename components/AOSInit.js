'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSInit() {
    useEffect(() => {
        AOS.init({
            duration: 800, // Animatsiya davomiyligi (ms)
            once: true, // Faqat bir marta animatsiya
            offset: 100, // Scroll qancha bo'lganda boshlansin
            easing: 'ease-in-out', // Smooth animatsiya
        });
    }, []);

    return null;
}
