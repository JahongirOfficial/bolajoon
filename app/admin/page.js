'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { TrendingUp, Users, BookOpen, Gift, Clock, UserPlus, AlertCircle, Activity } from 'lucide-react';

export default function AdminDashboard() {
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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newToday = users.filter(u => new Date(u.createdAt) >= today).length;
    const activeCount = users.filter(u => u.subscriptionStatus === 'active').length;
    const trialCount = users.filter(u => u.subscriptionStatus === 'trial').length;
    const expiredCount = users.filter(u => u.subscriptionStatus === 'expired').length;
    const expiringSoon = users.filter(u => {
        if (u.subscriptionStatus !== 'active' || !u.subscriptionEndDate) return false;
        const diff = (new Date(u.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 7;
    });
    const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const topCards = [
        { label: "O'qituvchilar", value: stats.totalTeachers ?? users.filter(u => u.role === 'teacher').length, sub: `+${newToday} bugun`, icon: Users, color: '#2b8cee', bg: '#dbeafe', href: '/admin/users' },
        { label: "O'quvchilar", value: stats.totalStudents || 0, sub: `~${stats.averageStudentsPerTeacher || 0} / o'qituvchi`, icon: Users, color: '#16a34a', bg: '#dcfce7', href: '/admin/users' },
        { label: 'Faol darslar', value: stats.activeLessons || 0, sub: `Jami: ${stats.totalLessons || 0}`, icon: BookOpen, color: '#9333ea', bg: '#f3e8ff', href: '/admin/lessons' },
        { label: "Sovg'alar", value: stats.totalRewards || 0, sub: 'Mukofotlar', icon: Gift, color: '#d97706', bg: '#fef3c7', href: '/admin/rewards' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Dashboard</h1>
                    <p className="text-muted mb-0">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={fetchAll} className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2" disabled={loading}>
                    <Activity size={16} />
                    Yangilash
                </button>
            </div>

            {/* Top Stats */}
            <div className="row g-4 mb-4">
                {topCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="col-md-6 col-lg-3">
                            <Link href={card.href} className="text-decoration-none">
                                <div className="card border-0 rounded-4 h-100 shadow-sm" style={{ backgroundColor: card.bg }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="rounded-3 p-2 bg-white">
                                                <Icon size={24} style={{ color: card.color }} />
                                            </div>
                                            <span className="small text-muted">{card.sub}</span>
                                        </div>
                                        <h2 className="h3 fw-bold mb-1" style={{ color: card.color }}>
                                            {loading ? <span className="spinner-border spinner-border-sm" /> : card.value.toLocaleString()}
                                        </h2>
                                        <p className="mb-0 fw-medium" style={{ color: card.color, opacity: 0.8 }}>{card.label}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>

            <div className="row g-4 mb-4">
                {/* Subscription Status */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Obuna holati
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#dcfce7' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-success" style={{ width: 10, height: 10 }} />
                                        <span className="fw-medium text-success">Faol obuna</span>
                                    </div>
                                    <span className="fw-bold fs-5 text-success">{loading ? '...' : activeCount}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#dbeafe' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-info" style={{ width: 10, height: 10 }} />
                                        <span className="fw-medium text-info">Sinov (trial)</span>
                                    </div>
                                    <span className="fw-bold fs-5 text-info">{loading ? '...' : trialCount}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#fee2e2' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-danger" style={{ width: 10, height: 10 }} />
                                        <span className="fw-medium text-danger">Tugagan</span>
                                    </div>
                                    <span className="fw-bold fs-5 text-danger">{loading ? '...' : expiredCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <Clock size={20} className="text-warning" />
                                7 kunda tugaydi
                                {!loading && expiringSoon.length > 0 && (
                                    <span className="badge bg-warning text-dark ms-1">{expiringSoon.length}</span>
                                )}
                            </h5>
                            {loading ? (
                                <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-warning" /></div>
                            ) : expiringSoon.length === 0 ? (
                                <div className="text-center py-3 text-muted">
                                    <Clock size={32} className="mb-2 opacity-50" />
                                    <p className="small mb-0">Hech kim yo'q</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {expiringSoon.map(u => {
                                        const days = Math.ceil((new Date(u.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24));
                                        return (
                                            <div key={u._id} className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-warning bg-opacity-10">
                                                <span className="fw-medium small text-truncate" style={{ maxWidth: 140 }}>{u.name}</span>
                                                <span className="badge bg-warning text-dark">{days} kun</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <UserPlus size={20} className="text-success" />
                                So'nggi ro'yxatlar
                                {!loading && newToday > 0 && (
                                    <span className="badge bg-success ms-1">+{newToday} bugun</span>
                                )}
                            </h5>
                            {loading ? (
                                <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-success" /></div>
                            ) : recentUsers.length === 0 ? (
                                <div className="text-center py-3 text-muted">
                                    <UserPlus size={32} className="mb-2 opacity-50" />
                                    <p className="small mb-0">Foydalanuvchi yo'q</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {recentUsers.map(u => (
                                        <div key={u._id} className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle flex-shrink-0" style={{ width: 32, height: 32, backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2b8cee&color=fff&size=32')`, backgroundSize: 'cover' }} />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="fw-medium mb-0 small text-truncate">{u.name}</p>
                                                <p className="text-muted mb-0" style={{ fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString('uz-UZ')}</p>
                                            </div>
                                            <span className={`badge rounded-pill ${u.subscriptionStatus === 'active' ? 'bg-success' : u.subscriptionStatus === 'trial' ? 'bg-info' : 'bg-secondary'}`} style={{ fontSize: 10 }}>
                                                {u.subscriptionStatus === 'active' ? 'Faol' : u.subscriptionStatus === 'trial' ? 'Trial' : 'Tugagan'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert for expired */}
            {!loading && expiredCount > 0 && (
                <div className="rounded-4 d-flex align-items-center gap-3 mb-4 p-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <AlertCircle size={20} className="text-danger flex-shrink-0" />
                    <div className="flex-grow-1">
                        <span className="fw-semibold text-danger">{expiredCount} ta foydalanuvchi</span>
                        <span className="text-muted ms-1">obunasi tugagan</span>
                    </div>
                    <Link href="/admin/users" className="btn btn-sm btn-danger rounded-3">Ko'rish</Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Tezkor harakatlar</h5>
                    <div className="row g-3">
                        <div className="col-6 col-md-3">
                            <Link href="/admin/lessons/add" className="btn btn-outline-primary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Yangi dars
                            </Link>
                        </div>
                        <div className="col-6 col-md-3">
                            <Link href="/admin/rewards/add" className="btn btn-outline-success w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Yangi sovg'a
                            </Link>
                        </div>
                        <div className="col-6 col-md-3">
                            <Link href="/admin/users" className="btn btn-outline-info w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">group</span>
                                Foydalanuvchilar
                            </Link>
                        </div>
                        <div className="col-6 col-md-3">
                            <Link href="/admin/sms" className="btn btn-outline-secondary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">sms</span>
                                SMS Yuborish
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
