'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trophy, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GameOverModal({ won, score, total, onRestart, nextGameUrl }) {
    const [show, setShow] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const router = useRouter();
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const backUrl = nextGameUrl || '/dashboard/games';

    useEffect(() => {
        setTimeout(() => setShow(true), 100);
    }, []);

    // G'alaba bo'lganda 3 soniya keyin avtomatik o'tish
    useEffect(() => {
        if (!won) return;
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push(backUrl);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [won, backUrl, router]);

    return (
        <div 
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden"
            style={{ 
                background: won 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green gradient for success
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue gradient for try again
                transition: 'all 0.3s ease'
            }}
        >
            {/* Animated background circles */}
            <div 
                className="position-absolute rounded-circle"
                style={{
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    top: '-150px',
                    right: '-150px',
                    animation: 'float 8s ease-in-out infinite'
                }}
            />
            <div 
                className="position-absolute rounded-circle"
                style={{
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    bottom: '-100px',
                    left: '-100px',
                    animation: 'float 10s ease-in-out infinite reverse'
                }}
            />
            <div 
                className="position-absolute rounded-circle"
                style={{
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    top: '50%',
                    left: '10%',
                    animation: 'float 12s ease-in-out infinite'
                }}
            />

            {/* Main Card */}
            <div 
                className="card border-0 shadow-lg text-center position-relative"
                style={{ 
                    maxWidth: 420,
                    borderRadius: '32px',
                    transform: show ? 'scale(1)' : 'scale(0.8)',
                    opacity: show ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                <div className="card-body p-4">
                    {/* Icon/Emoji with animation */}
                    <div 
                        className="mb-3"
                        style={{
                            animation: won ? 'bounce 1s ease-in-out infinite' : 'pulse 2s ease-in-out infinite'
                        }}
                    >
                        {won ? (
                            <div className="position-relative d-inline-block">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                    style={{
                                        width: '90px',
                                        height: '90px',
                                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <Trophy size={48} className="text-success" strokeWidth={2.5} />
                                </div>
                                <div 
                                    className="position-absolute"
                                    style={{
                                        top: '0',
                                        right: '0',
                                        animation: 'sparkle 1.5s ease-in-out infinite'
                                    }}
                                >
                                    <Star size={24} className="text-warning" fill="currentColor" />
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <TrendingUp size={48} className="text-primary" strokeWidth={2.5} />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 
                        className="fw-bold mb-2"
                        style={{ 
                            fontSize: '1.8rem',
                            color: won ? '#16a34a' : '#2563eb',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        {won ? 'Ajoyib!' : 'Yaxshi harakat!'}
                    </h1>

                    <p 
                        className="mb-3"
                        style={{ 
                            fontSize: '0.95rem',
                            color: '#6b7280'
                        }}
                    >
                        {won 
                            ? "Siz barcha savollarga to'g'ri javob berdingiz!" 
                            : "Qayta urinib ko'ring, siz albatta muvaffaqiyatga erishasiz!"}
                    </p>

                    {/* Score Display */}
                    {score !== undefined && total !== undefined && (
                        <div className="mb-3">
                            <div 
                                className="row g-2 mx-auto"
                                style={{ maxWidth: '350px' }}
                            >
                                <div className="col-6">
                                    <div 
                                        className="p-3 rounded-4 h-100"
                                        style={{ 
                                            background: won 
                                                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                                                : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                            border: won 
                                                ? '2px solid #86efac'
                                                : '2px solid #93c5fd'
                                        }}
                                    >
                                        <div 
                                            className="fw-bold mb-1"
                                            style={{ 
                                                fontSize: '1.8rem',
                                                color: won ? '#16a34a' : '#2563eb',
                                                lineHeight: 1
                                            }}
                                        >
                                            {score}/{total}
                                        </div>
                                        <small 
                                            className="fw-semibold"
                                            style={{ 
                                                color: won ? '#166534' : '#1e40af',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            To'g'ri javoblar
                                        </small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div 
                                        className="p-3 rounded-4 h-100"
                                        style={{ 
                                            background: won 
                                                ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                                                : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                            border: won 
                                                ? '2px solid #fde047'
                                                : '2px solid #a5b4fc'
                                        }}
                                    >
                                        <div 
                                            className="fw-bold mb-1"
                                            style={{ 
                                                fontSize: '1.8rem',
                                                color: won ? '#d97706' : '#4f46e5',
                                                lineHeight: 1
                                            }}
                                        >
                                            {percentage}%
                                        </div>
                                        <small 
                                            className="fw-semibold"
                                            style={{ 
                                                color: won ? '#92400e' : '#3730a3',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Natija
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <button 
                            onClick={onRestart} 
                            className="btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            style={{
                                background: 'white',
                                color: won ? '#16a34a' : '#2563eb',
                                border: won ? '2px solid #16a34a' : '2px solid #2563eb',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = won 
                                    ? '0 8px 24px rgba(16, 185, 129, 0.3)'
                                    : '0 8px 24px rgba(37, 99, 235, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            <RotateCcw size={18} strokeWidth={2.5} />
                            Qayta urinish
                        </button>
                        <Link
                            href={backUrl}
                            className="btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm text-white text-decoration-none"
                            style={{
                                background: won
                                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = won
                                    ? '0 8px 24px rgba(16, 185, 129, 0.4)'
                                    : '0 8px 24px rgba(37, 99, 235, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            {won ? `Keyingisi (${countdown}s)` : 'Keyingisi'}
                            <ArrowRight size={18} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-30px) rotate(10deg);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-15px) scale(1.05);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                @keyframes sparkle {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.3) rotate(180deg);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}
