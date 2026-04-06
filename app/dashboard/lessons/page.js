'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import { Play, Clock, GraduationCap, Video, ChevronDown, ChevronUp } from 'lucide-react';

const LESSONS_PER_STAGE = 15;

const stageColors = [
    { bg: '#FFE4F0', color: '#FF7EB3' },
    { bg: '#DCFCE7', color: '#16a34a' },
    { bg: '#FEF3C7', color: '#d97706' },
    { bg: '#F3E8FF', color: '#9333ea' },
    { bg: '#DBEAFE', color: '#2563eb' },
    { bg: '#FFF0F0', color: '#ef4444' },
    { bg: '#F0FDF4', color: '#15803d' },
    { bg: '#FFF7ED', color: '#ea580c' },
    { bg: '#EEF2FF', color: '#4f46e5' },
    { bg: '#FDF4FF', color: '#a21caf' },
];

export default function LessonsPage() {
    const router = useRouter();
    const { lessons, dashboard, loadingTimeout } = useData();
    const { requireSubscription } = useSubscription();
    const [openStages, setOpenStages] = useState({ 1: true });

    const stages = useMemo(() => {
        const sorted = [...lessons].sort((a, b) => {
            if ((a.level || 0) !== (b.level || 0)) return (a.level || 0) - (b.level || 0);
            return (a.order || 0) - (b.order || 0);
        });
        const stageMap = {};
        sorted.forEach((lesson, idx) => {
            const stageNum = Math.floor(idx / LESSONS_PER_STAGE) + 1;
            const globalOrder = idx + 1; // continues across all stages: 1,2...15,16...30...
            if (!stageMap[stageNum]) stageMap[stageNum] = [];
            stageMap[stageNum].push({ ...lesson, stageNum, globalOrder });
        });
        return stageMap;
    }, [lessons]);

    const totalStages = Object.keys(stages).length;

    const toggleStage = (stageNum) => {
        setOpenStages(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));
    };

    return (
        <div className="page-content">
            <Header
                showStars={true}
                stars={dashboard.totalStars}
                breadcrumbs={[
                    { label: 'Asosiy', href: '/dashboard' },
                    { label: 'Darslar', href: '/dashboard/lessons' }
                ]}
            />

            <main className="p-3">
                <div className="mb-4">
                    <h1 className="h4 fw-bold mb-1">
                        Ingliz tilini o'rganishga{' '}
                        <span style={{ color: '#FF7EB3' }}>tayyormisiz?</span>
                    </h1>
                    {lessons.length > 0 && (
                        <p className="text-muted small mb-0">
                            Jami {lessons.length} ta dars · {totalStages} ta bosqich
                        </p>
                    )}
                </div>

                <div data-tour="lessons-list">
                    {Object.keys(stages)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((stageKey) => {
                            const stageNum = Number(stageKey);
                            const stageLessons = stages[stageKey];
                            const colors = stageColors[(stageNum - 1) % stageColors.length];
                            const isOpen = !!openStages[stageNum];
                            const startLesson = (stageNum - 1) * LESSONS_PER_STAGE + 1;
                            const endLesson = startLesson + stageLessons.length - 1;

                            return (
                                <div
                                    key={stageNum}
                                    className="mb-3"
                                    style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: `1px solid ${isOpen ? colors.color + '30' : '#f1f5f9'}`,
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    {/* Stage Header */}
                                    <button
                                        onClick={() => toggleStage(stageNum)}
                                        className="w-100 d-flex align-items-center gap-3 p-3"
                                        style={{
                                            background: isOpen ? colors.bg : '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {/* Stage number badge */}
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                            style={{
                                                width: '44px', height: '44px',
                                                background: '#fff',
                                                color: colors.color,
                                                border: `2px solid ${colors.color}`,
                                                fontSize: '14px'
                                            }}
                                        >
                                            {String(stageNum).padStart(2, '0')}
                                        </div>

                                        {/* Stage info */}
                                        <div className="flex-grow-1">
                                            <p className="fw-bold mb-0" style={{ fontSize: '15px', color: '#1e293b' }}>
                                                {stageNum}-bosqich
                                            </p>
                                            <p className="mb-0" style={{ fontSize: '12px', color: colors.color, fontWeight: 600 }}>
                                                {startLesson}–{endLesson}-dars · {stageLessons.length} ta video
                                            </p>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="d-none d-md-block flex-shrink-0" style={{ width: '80px' }}>
                                            <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '2px',
                                                    width: `${(stageLessons.length / LESSONS_PER_STAGE) * 100}%`,
                                                    background: colors.color
                                                }} />
                                            </div>
                                            <p className="mb-0 mt-1 text-muted" style={{ fontSize: '11px' }}>
                                                {stageLessons.length}/{LESSONS_PER_STAGE}
                                            </p>
                                        </div>

                                        {/* Toggle icon */}
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: '32px', height: '32px', background: `${colors.color}15`, color: colors.color }}
                                        >
                                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </button>

                                    {/* Lessons grid */}
                                    {isOpen && (
                                        <div className="p-3 pt-2" style={{ background: '#fafafa' }}>
                                            <div className="row g-2">
                                                {stageLessons.map((lesson) => (
                                                    <div key={lesson._id} className="col-12 col-lg-6">
                                                        <div
                                                            onClick={() => requireSubscription(() => router.push(`/dashboard/lessons/${lesson._id}`))}
                                                            className="d-flex align-items-center gap-3 p-3 rounded-3 bg-white"
                                                            style={{
                                                                cursor: 'pointer',
                                                                border: '1px solid #f1f5f9',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.boxShadow = `0 4px 16px ${colors.color}20`;
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.borderColor = `${colors.color}40`;
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.boxShadow = '';
                                                                e.currentTarget.style.transform = '';
                                                                e.currentTarget.style.borderColor = '#f1f5f9';
                                                            }}
                                                        >
                                                            {/* Thumbnail / number */}
                                                            <div
                                                                className="rounded-3 flex-shrink-0 overflow-hidden d-flex align-items-center justify-content-center"
                                                                style={{ width: '56px', height: '56px', background: colors.bg }}
                                                            >
                                                                {lesson.thumbnail ? (
                                                                    <>
                                                                        <img
                                                                            src={lesson.thumbnail}
                                                                            alt={lesson.title}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            onError={e => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.nextSibling.style.display = 'flex';
                                                                            }}
                                                                        />
                                                                        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px', width: '100%', height: '100%' }}>
                                                                            <span className="fw-bold" style={{ fontSize: '18px', color: colors.color, lineHeight: 1 }}>{lesson.globalOrder}</span>
                                                                            <Video size={13} color={colors.color} style={{ opacity: 0.6 }} />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px' }}>
                                                                        <span className="fw-bold" style={{ fontSize: '18px', color: colors.color, lineHeight: 1 }}>{lesson.globalOrder}</span>
                                                                        <Video size={13} color={colors.color} style={{ opacity: 0.6 }} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-grow-1 min-width-0">
                                                                <p className="mb-0" style={{ fontSize: '11px', fontWeight: 700, color: colors.color }}>
                                                                    {lesson.globalOrder}-dars
                                                                </p>
                                                                <p className="fw-bold mb-0 text-truncate" style={{ fontSize: '14px', color: '#1e293b' }}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                                    <Clock size={12} />
                                                                    {lesson.duration || 5} daq
                                                                </div>
                                                            </div>

                                                            {/* Play button */}
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 play-button"
                                                                style={{
                                                                    width: '40px', height: '40px',
                                                                    background: `linear-gradient(135deg, ${colors.color}, ${colors.color}cc)`,
                                                                    boxShadow: `0 3px 10px ${colors.color}40`,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <Play size={17} fill="white" color="white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {lessons.length === 0 && (
                    <div className="text-center py-5">
                        <GraduationCap size={64} className="text-muted mb-3" />
                        <p className="text-muted">
                            {loadingTimeout ? 'Darslarni yuklashda xatolik yuz berdi' : 'Hozircha darslar yo\'q'}
                        </p>
                        {loadingTimeout && (
                            <button
                                className="btn btn-primary btn-sm rounded-pill mt-2"
                                onClick={() => window.location.reload()}
                            >
                                Qayta urinish
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
