'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Hash, ShoppingCart, User, Balloon, ShoppingBasket, PersonStanding } from 'lucide-react';

export default function GamesTestPage() {
    const router = useRouter();
    const [selectedGame, setSelectedGame] = useState('');

    const games = [
        { 
            id: 'vocabulary', 
            name: "Lug'at o'yini", 
            icon: BookOpen,
            iconColor: '#3B82F6',
            description: "So'zlar va rasmlarni o'rganish",
            path: '/games/vocabulary/test',
            needsLesson: true
        },
        { 
            id: 'catch-the-number', 
            name: 'Catch the Number', 
            icon: Hash,
            iconColor: '#10B981',
            description: "Raqamlarni ushlash o'yini",
            path: '/games/catch-the-number/test',
            needsLesson: true
        },
        { 
            id: 'shopping-basket', 
            name: 'Shopping Basket', 
            icon: ShoppingCart,
            iconColor: '#F59E0B',
            description: "Xarid savati o'yini",
            path: '/games/shopping-basket/test',
            needsLesson: true
        },
        { 
            id: 'build-the-body', 
            name: 'Build the Body', 
            icon: User,
            iconColor: '#8B5CF6',
            description: "Tana a'zolarini o'rganish",
            path: '/games/build-the-body/test',
            needsLesson: true
        },
        { 
            id: 'pop-the-balloon', 
            name: 'Sharni yorish', 
            icon: Balloon,
            iconColor: '#EC4899',
            description: "Sharlarni yorish o'yini",
            path: '/games/pop-the-balloon/test',
            needsLesson: true
        },
        { 
            id: 'drop-to-basket', 
            name: 'Savatga tashlash', 
            icon: ShoppingBasket,
            iconColor: '#EF4444',
            description: "Narsalarni savatga tashlash",
            path: '/games/drop-to-basket/test',
            needsLesson: true
        },
        { 
            id: 'movements', 
            name: "Fe'llarni o'rganish", 
            icon: PersonStanding,
            iconColor: '#06B6D4',
            description: "Harakat fe'llarini o'rganish",
            path: '/games/movements',
            needsLesson: false
        }
    ];

    const handlePlayGame = (game) => {
        router.push(game.path);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-5">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Link 
                        href="/admin" 
                        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '44px', height: '44px', border: '1px solid #e5e7eb' }}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="h2 fw-bold mb-1" style={{ color: '#1d1d1f', letterSpacing: '-0.5px' }}>
                            O'yinlarni test qilish
                        </h1>
                        <p className="mb-0" style={{ color: '#6b7280', fontSize: '15px' }}>
                            O'yinlarni sinab ko'ring va qanday ishlashini tekshiring
                        </p>
                    </div>
                </div>

                {/* Info Alert - Modern Design */}
                <div 
                    className="rounded-4 p-4 d-flex align-items-start gap-3"
                    style={{
                        background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                        border: '1px solid #BFDBFE'
                    }}
                >
                    <div 
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#3B82F6',
                            color: 'white'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>info</span>
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1" style={{ color: '#1e40af', fontSize: '15px' }}>Test rejimi</h6>
                        <p className="mb-0" style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6' }}>
                            Bu yerda barcha o'yinlarni sinab ko'rishingiz mumkin. Ba'zi o'yinlar test ma'lumotlari bilan ishlaydi.
                        </p>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="row g-4">
                {games.map((game, index) => (
                    <div key={game.id} className="col-12 col-md-6 col-lg-4">
                        <div 
                            className="card border-0 rounded-4 h-100 position-relative overflow-hidden"
                            style={{ 
                                backgroundColor: 'white',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            }}
                        >
                            {/* Gradient Background Accent */}
                            <div 
                                className="position-absolute top-0 start-0 w-100"
                                style={{
                                    height: '4px',
                                    background: `linear-gradient(90deg, ${game.iconColor}, ${game.iconColor}dd)`
                                }}
                            />

                            <div className="card-body p-4 d-flex flex-column">
                                {/* Icon Container with Gradient Background */}
                                <div 
                                    className="rounded-4 d-flex align-items-center justify-content-center mb-3 mx-auto position-relative"
                                    style={{ 
                                        width: '90px', 
                                        height: '90px',
                                        background: `linear-gradient(135deg, ${game.iconColor}15, ${game.iconColor}05)`,
                                        border: `2px solid ${game.iconColor}20`
                                    }}
                                >
                                    <game.icon size={44} style={{ color: game.iconColor }} strokeWidth={2} />
                                    
                                    {/* Decorative circle */}
                                    <div 
                                        className="position-absolute rounded-circle"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: game.iconColor,
                                            opacity: 0.1,
                                            top: '-5px',
                                            right: '-5px'
                                        }}
                                    />
                                </div>

                                {/* Game Info */}
                                <div className="text-center mb-3 flex-grow-1">
                                    <h5 className="fw-bold mb-2" style={{ color: '#1d1d1f', fontSize: '18px', lineHeight: '1.3' }}>
                                        {game.name}
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                        {game.description}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                {game.needsLesson && (
                                    <div className="text-center mb-3">
                                        <span 
                                            className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
                                            style={{
                                                backgroundColor: '#FEF3C7',
                                                color: '#92400E',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                border: '1px solid #FDE68A'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>science</span>
                                            Test ma'lumotlari
                                        </span>
                                    </div>
                                )}

                                {/* Play Button with Gradient */}
                                <button
                                    onClick={() => handlePlayGame(game)}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 border-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${game.iconColor}, ${game.iconColor}dd)`,
                                        color: 'white',
                                        padding: '12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                        boxShadow: `0 4px 12px ${game.iconColor}30`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.boxShadow = `0 6px 20px ${game.iconColor}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${game.iconColor}30`;
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                                    O'ynash
                                </button>
                            </div>

                            {/* Decorative corner element */}
                            <div 
                                className="position-absolute rounded-circle"
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    backgroundColor: game.iconColor,
                                    opacity: 0.03,
                                    bottom: '-30px',
                                    right: '-30px',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section - Modern Design */}
            <div 
                className="card border-0 rounded-4 mt-5"
                style={{ 
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB'
                }}
            >
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <div 
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#3B82F6',
                                color: 'white'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
                        </div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: '16px', color: '#1d1d1f' }}>Yordam</h6>
                    </div>
                    
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div 
                                className="d-flex gap-3 p-3 rounded-3"
                                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                            >
                                <div 
                                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#DCFCE7',
                                        color: '#16A34A'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1" style={{ fontSize: '14px', color: '#1d1d1f' }}>
                                        To'liq ishlaydi
                                    </p>
                                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                        O'yin to'liq ishlab chiqilgan va test qilishga tayyor
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div 
                                className="d-flex gap-3 p-3 rounded-3"
                                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                            >
                                <div 
                                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#FEF3C7',
                                        color: '#92400E'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>science</span>
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1" style={{ fontSize: '14px', color: '#1d1d1f' }}>
                                        Test ma'lumotlari
                                    </p>
                                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                        O'yin test ma'lumotlari bilan ishlaydi
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
