'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, Star, TrendingUp, Activity, Award, BarChart2, RefreshCw } from 'lucide-react';

export default function AdminStatisticsPage() {
    const { getAuthHeader } = useAuth();
    const [data, setData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch('/api/admin/statistics', { headers: getAuthHeader() }),
                fetch('/api/admin/users', { headers: getAuthHeader() })
            ]);
            const statsData = await statsRes.json();
            const usersData = await usersRes.json();
            if (statsData.success) setData(statsData);
            if (usersData.success) setUsers(usersData.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats = data?.stats || {};
    const weeklyData = data?.weeklyData || [];
    const topTeachers = data?.topTeachers || [];
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    const now = new Date();
    const teachers = users.filter(u => u.role !== 'admin');
    const activeCount = teachers.filter(u => u.subscriptionStatus === 'active').length;
    const trialCount = teachers.filter(u => u.subscriptionStatus === 'trial').length;
    const expiredCount = teachers.filter(u => u.subscriptionStatus === 'expired').length;

    // Monthly registrations (last 6 months)
    const monthlyRegs = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const count = teachers.filter(u => {
            const created = new Date(u.createdAt);
            return created >= d && created < next;
        }).length;
        return {
            label: d.toLocaleDateString('uz-UZ', { month: 'short' }),
            count
        };
    });
    const maxMonthly = Math.max(...monthlyRegs.map(m => m.count), 1);

    const overviewCards = [
        { label: "O'qituvchilar", value: stats.totalTeachers || teachers.length, icon: Users, color: '#2b8cee', bg: '#dbeafe', sub: `+${teachers.filter(u => new Date(u.createdAt) >= new Date(now.getFullYear(), now.getMonth(), 1)).length} bu oy` },
        { label: "O'quvchilar", value: stats.totalStudents || 0, icon: Users, color: '#16a34a', bg: '#dcfce7', sub: `~${stats.averageStudentsPerTeacher || 0} / o'qituvchi` },
        { label: 'Faol darslar', value: stats.activeLessons || 0, icon: BookOpen, color: '#9333ea', bg: '#f3e8ff', sub: `Jami: ${stats.totalLessons || 0}` },
        { label: 'Jami yulduzlar', value: stats.totalStars || 0, icon: Star, color: '#d97706', bg: '#fef3c7', sub: `${stats.totalProgress || 0} yakunlangan` },
    ];

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-3 small">Yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Statistika</h1>
                    <p className="text-muted mb-0">Platforma tahlili</p>
                </div>
                <button onClick={fetchAll} className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2" disabled={loading}>
                    <RefreshCw size={16} />
                    Yangilash
                </button>
            </div>

            {/* Overview Cards */}
            <div className="row g-3 mb-4">
                {overviewCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: card.bg }}>
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="rounded-3 p-2 bg-white">
                                            <Icon size={20} style={{ color: card.color }} />
                                        </div>
                                        <span className="small text-muted">{card.sub}</span>
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.75rem', color: card.color }}>
                                        {card.value.toLocaleString()}
                                    </div>
                                    <div className="small fw-medium" style={{ color: card.color, opacity: 0.8 }}>{card.label}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="row g-4 mb-4">
                {/* Weekly Activity Bar Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Activity size={20} className="text-primary" />
                                <h3 className="h5 fw-bold mb-0">Haftalik faollik</h3>
                                <span className="badge bg-primary bg-opacity-10 text-primary ms-auto">Oxirgi 7 kun</span>
                            </div>
                            <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '180px' }}>
                                {weeklyData.map((item, i) => (
                                    <div key={i} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                                        <span className="small fw-bold" style={{ color: '#2b8cee', fontSize: '11px' }}>{item.count}</span>
                                        <div className="w-100 rounded-3 position-relative" style={{ backgroundColor: '#f1f5f9', height: '150px' }}>
                                            <div
                                                className="w-100 rounded-3 position-absolute bottom-0"
                                                style={{
                                                    height: `${(item.count / maxCount) * 100}%`,
                                                    minHeight: item.count > 0 ? '6px' : '0',
                                                    background: i === weeklyData.length - 1
                                                        ? 'linear-gradient(180deg, #2b8cee, #1d6db8)'
                                                        : '#bfdbfe',
                                                    transition: 'height 0.5s ease'
                                                }}
                                            />
                                        </div>
                                        <span className="small fw-semibold" style={{ fontSize: '11px', color: i === weeklyData.length - 1 ? '#2b8cee' : '#94a3b8' }}>
                                            {item.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-muted small mt-3 mb-0 text-center">Yakunlangan darslar soni</p>
                        </div>
                    </div>
                </div>

                {/* Subscription Status */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <TrendingUp size={20} className="text-primary" />
                                <h3 className="h5 fw-bold mb-0">Obuna holati</h3>
                            </div>
                            {/* Donut-style progress bars */}
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { label: 'Faol obuna', count: activeCount, total: teachers.length, color: '#16a34a', bg: '#dcfce7' },
                                    { label: 'Sinov (trial)', count: trialCount, total: teachers.length, color: '#2b8cee', bg: '#dbeafe' },
                                    { label: 'Tugagan', count: expiredCount, total: teachers.length, color: '#dc2626', bg: '#fee2e2' },
                                ].map((item, i) => {
                                    const pct = teachers.length > 0 ? Math.round((item.count / teachers.length) * 100) : 0;
                                    return (
                                        <div key={i}>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="small fw-medium">{item.label}</span>
                                                <span className="small fw-bold" style={{ color: item.color }}>{item.count} ({pct}%)</span>
                                            </div>
                                            <div className="rounded-pill" style={{ height: '8px', backgroundColor: '#f1f5f9' }}>
                                                <div
                                                    className="rounded-pill h-100"
                                                    style={{ width: `${pct}%`, backgroundColor: item.color, transition: 'width 0.6s ease' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr className="my-3" />

                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between small">
                                    <span className="text-muted">Jami darslar</span>
                                    <span className="fw-bold">{stats.totalLessons || 0}</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span className="text-muted">Yakunlangan</span>
                                    <span className="fw-bold text-success">{stats.totalProgress || 0}</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span className="text-muted">Sovg'alar</span>
                                    <span className="fw-bold text-warning">{stats.totalRewards || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Registrations */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <BarChart2 size={20} className="text-success" />
                        <h3 className="h5 fw-bold mb-0">Oylik ro'yxatlar</h3>
                        <span className="badge bg-success bg-opacity-10 text-success ms-auto">Oxirgi 6 oy</span>
                    </div>
                    <div className="d-flex align-items-end justify-content-between gap-3" style={{ height: '140px' }}>
                        {monthlyRegs.map((item, i) => (
                            <div key={i} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                                <span className="small fw-bold text-success" style={{ fontSize: '11px' }}>{item.count}</span>
                                <div className="w-100 rounded-3 position-relative" style={{ backgroundColor: '#f1f5f9', height: '110px' }}>
                                    <div
                                        className="w-100 rounded-3 position-absolute bottom-0"
                                        style={{
                                            height: `${(item.count / maxMonthly) * 100}%`,
                                            minHeight: item.count > 0 ? '6px' : '0',
                                            background: i === monthlyRegs.length - 1
                                                ? 'linear-gradient(180deg, #16a34a, #15803d)'
                                                : '#bbf7d0'
                                        }}
                                    />
                                </div>
                                <span className="small" style={{ fontSize: '11px', color: '#94a3b8' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Teachers */}
            {topTeachers.length > 0 && (
                <div className="card border-0 rounded-4 shadow-sm">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Award size={20} className="text-warning" />
                            <h3 className="h5 fw-bold mb-0">Top o'qituvchilar</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-3 py-3" style={{ width: 50 }}>#</th>
                                        <th className="border-0 py-3">O'qituvchi</th>
                                        <th className="border-0 py-3 text-center">O'quvchilar</th>
                                        <th className="border-0 py-3 text-center">Yulduzlar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTeachers.map((teacher, i) => (
                                        <tr key={i}>
                                            <td className="ps-3 py-3">
                                                <span className={`badge rounded-pill ${i === 0 ? 'bg-warning text-dark' : i === 1 ? 'bg-secondary' : i === 2 ? 'bg-danger' : 'bg-light text-dark'}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle flex-shrink-0"
                                                        style={{
                                                            width: 32, height: 32,
                                                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=2b8cee&color=fff&size=32')`,
                                                            backgroundSize: 'cover'
                                                        }}
                                                    />
                                                    <span className="fw-semibold">{teacher.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="badge bg-primary rounded-pill">{teacher.studentCount}</span>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="d-flex align-items-center justify-content-center gap-1">
                                                    <span className="material-symbols-outlined text-warning" style={{ fontSize: '16px' }}>star</span>
                                                    <span className="fw-semibold">{teacher.totalStars}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
