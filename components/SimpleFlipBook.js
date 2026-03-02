'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

export default function SimpleFlipBook({ pdfUrl }) {
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const iframeRef = useState(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const zoomIn = () => {
        setScale(prev => Math.min(2.0, prev + 0.2));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(0.5, prev - 0.2));
    };

    const toggleFullscreen = () => {
        const elem = document.getElementById('pdf-container');
        if (!document.fullscreenElement) {
            elem?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handlePageChange = (direction) => {
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 600);
    };

    return (
        <div 
            id="pdf-container"
            className="d-flex flex-column h-100 bg-light position-relative"
        >
            {/* Controls */}
            <div className="bg-white border-bottom p-2 d-flex align-items-center justify-content-between gap-2">
                {/* Page Navigation Info */}
                <div className="d-flex align-items-center gap-2">
                    <div className="px-2 px-md-3 py-1 bg-light rounded-pill">
                        <span className="small fw-semibold">
                            📖 {isMobile ? '' : 'Kitobcha'}
                        </span>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="d-flex align-items-center gap-1 gap-md-2">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="btn btn-sm btn-outline-secondary rounded-circle p-1 p-md-2"
                        style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px' }}
                        title="Kichraytirish"
                    >
                        <ZoomOut size={isMobile ? 16 : 18} />
                    </button>
                    
                    <span className="small fw-semibold px-1 px-md-2" style={{ minWidth: isMobile ? '40px' : '50px', textAlign: 'center' }}>
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={zoomIn}
                        disabled={scale >= 2.0}
                        className="btn btn-sm btn-outline-secondary rounded-circle p-1 p-md-2"
                        style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px' }}
                        title="Kattalashtirish"
                    >
                        <ZoomIn size={isMobile ? 16 : 18} />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="btn btn-sm btn-outline-secondary rounded-circle p-1 p-md-2"
                        style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px' }}
                        title="To'liq ekran"
                    >
                        {isFullscreen ? <Minimize2 size={isMobile ? 16 : 18} /> : <Maximize2 size={isMobile ? 16 : 18} />}
                    </button>
                </div>
            </div>

            {/* PDF Viewer with Flip Animation */}
            <div className="flex-grow-1 overflow-hidden d-flex align-items-center justify-content-center p-2 p-md-3">
                <div 
                    className={`position-relative w-100 h-100 ${isFlipping ? 'flipping' : ''}`}
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                        className="w-100 h-100 border-0 rounded-2 rounded-md-3 shadow-lg"
                        title="Bolajon Darsligi"
                        style={{
                            backgroundColor: 'white',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    />
                </div>
            </div>

            {/* Flip Animation CSS */}
            <style jsx>{`
                .flipping {
                    animation: pageFlip 0.6s ease-in-out;
                }

                @keyframes pageFlip {
                    0% {
                        transform: scale(${scale}) rotateY(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(${scale * 0.95}) rotateY(-15deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(${scale}) rotateY(0deg);
                        opacity: 1;
                    }
                }

                iframe {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }

                iframe:hover {
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    iframe {
                        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                    }
                }
            `}</style>
        </div>
    );
}
