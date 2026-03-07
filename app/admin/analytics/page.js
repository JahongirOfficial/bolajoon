'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, Users, TrendingUp, AlertTriangle, LogIn, LogOut, Clock, RefreshCw, BarChart2 } from 'lucide-react';

// Human-readable page labels
const PAGE_LABELS = {
    '/': 'Bosh sahifa',
    '/login': 'Login sahifasi',
    '/register': "Ro'yxatdan o'tish",
    '/dashboard': 'Dashboard (asosiy)',
    '/dashboard/students': "O'quvchilar",
    '/dashboard/games': "O'yinlar",
    '/dashboard/lessons': 'Darslar',
    '/dashboard/rewards': "Mukofotlar",
    '/dashboard/settings': 'Sozlamalar',
    '/dashboard/profile': 'Profil',
};

function pageName(p) {
    return PAGE_LABELS[p] || p;
}

function fmtTime(seconds) {
    if (!seconds || seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function engagementColor(avg) {
    if (avg >= 60) return 'success';
    if (avg >= 20) return 'warning';
    return 'danger';
}

export default function AnalyticsPage() {
    const { getAuthHeader } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics', { headers: getAuthHeader() });
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-3 small">Yuklanmoqda...</p>
        </div>
    );

    const { summary = {}, pageStats = [], entryPages = [], exitPages = [], lowEngagement = [], hourly = [], days = [] } = data || {};

    const maxDayCount = Math.max(...days.map(d => d.count), 1);
    const maxHour = Math.max(...hourly.map(h => h.count), 1);
    // Peak hour
    const peakHour = hourly.reduce((a, b) => a.count > b.count ? a : b, { count: 0, label: '—' });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Foydalanuvchi Tahlili</h1>
                    <p className="text-muted mb-0">Saytga kirish, qolish va chiqish nuqtalari</p>
                </div>
                <button onClick={fetchData} className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2" disabled={loading}>
                    <RefreshCw size={16} />
                    Yangilash
                </button>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Bugungi ko'rishlar", value: summary.todayViews || 0, icon: Eye, color: '#2b8cee', bg: '#dbeafe' },
                    { label: 'Bugungi sessiyalar', value: summary.todaySessions || 0, icon: Users, color: '#16a34a', bg: '#dcfce7' },
                    { label: "Haftalik ko'rishlar", value: summary.weekViews || 0, icon: TrendingUp, color: '#9333ea', bg: '#f3e8ff' },
                    { label: 'Eng faol vaqt', value: peakHour.label, icon: Clock, color: '#d97706', bg: '#fef3c7', isText: true },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: card.bg }}>
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="rounded-3 p-2 bg-white">
                                            <Icon size={18} style={{ color: card.color }} />
                                        </div>
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.6rem', color: card.color }}>
                                        {card.isText ? card.value : card.value.toLocaleString()}
                                    </div>
                                    <div className="small fw-medium" style={{ color: card.color, opacity: 0.8 }}>{card.label}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 7-Day Chart */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <BarChart2 size={20} className="text-primary" />
                        <h5 className="fw-bold mb-0">Oxirgi 7 kun</h5>
                    </div>
                    <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '140px' }}>
                        {days.map((d, i) => (
                            <div key={i} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                                <span className="fw-bold text-primary" style={{ fontSize: '11px' }}>{d.count}</span>
                                <div className="w-100 rounded-3 position-relative" style={{ backgroundColor: '#f1f5f9', height: '110px' }}>
                                    <div
                                        className="w-100 rounded-3 position-absolute bottom-0"
                                        style={{
                                            height: `${(d.count / maxDayCount) * 100}%`,
                                            minHeight: d.count > 0 ? '4px' : '0',
                                            background: i === days.length - 1
                                                ? 'linear-gradient(180deg, #2b8cee, #1d6db8)'
                                                : '#bfdbfe'
                                        }}
                                    />
                                </div>
                                <span className="small" style={{ fontSize: '10px', color: '#94a3b8' }}>{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Hourly Distribution */}
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Clock size={18} className="text-warning" />
                                <h5 className="fw-bold mb-0">Bugun soat bo'yicha</h5>
                                <span className="badge bg-warning bg-opacity-10 text-warning ms-auto small">
                                    Eng faol: {peakHour.label} ({peakHour.count} ta)
                                </span>
                            </div>
                            <div className="d-flex align-items-end gap-1" style={{ height: '80px', overflowX: 'auto' }}>
                                {hourly.map((h) => (
                                    <div
                                        key={h.hour}
                                        title={`${h.label}: ${h.count} ta ko'rish`}
                                        className="flex-shrink-0 rounded-top"
                                        style={{
                                            width: '3.5%',
                                            height: `${Math.max((h.count / maxHour) * 100, h.count > 0 ? 8 : 2)}%`,
                                            backgroundColor: h.count === peakHour.count && h.count > 0
                                                ? '#d97706'
                                                : h.count > 0 ? '#fbbf24' : '#f1f5f9',
                                            cursor: 'default'
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="d-flex justify-content-between mt-1">
                                <span className="small text-muted">00:00</span>
                                <span className="small text-muted">06:00</span>
                                <span className="small text-muted">12:00</span>
                                <span className="small text-muted">18:00</span>
                                <span className="small text-muted">23:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Engagement — Problem Pages */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100" style={{ borderLeft: '4px solid #ef4444 !important' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertTriangle size={18} className="text-danger" />
                                <h5 className="fw-bold mb-0 text-danger">Muammoli sahifalar</h5>
                            </div>
                            <p className="small text-muted mb-3">Foydalanuvchilar 15 soniyadan kam vaqt o'tkazgan sahifalar — tushunmagan yoki qiziqmagan.</p>
                            {lowEngagement.length === 0 ? (
                                <div className="text-center py-3 text-muted">
                                    <AlertTriangle size={32} className="mb-2 opacity-30" />
                                    <p className="small mb-0">Muammoli sahifa yo'q</p>
                                </div>
                            ) : lowEngagement.map((p, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center p-2 rounded-3 mb-2" style={{ backgroundColor: '#fef2f2' }}>
                                    <div>
                                        <p className="fw-medium mb-0 small text-danger">{pageName(p._id)}</p>
                                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{p.views} ta ko'rish</p>
                                    </div>
                                    <span className="badge bg-danger rounded-pill">{fmtTime(p.avgTime)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Entry Pages */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <LogIn size={18} className="text-success" />
                                <h5 className="fw-bold mb-0">Kirish nuqtalari</h5>
                            </div>
                            <p className="small text-muted mb-3">Foydalanuvchilar birinchi bo'lib qaysi sahifaga kiradi</p>
                            {entryPages.length === 0 ? (
                                <p className="text-muted small text-center py-3">Ma'lumot yo'q</p>
                            ) : entryPages.map((p, i) => {
                                const max = entryPages[0].count;
                                return (
                                    <div key={i} className="mb-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium text-truncate" style={{ maxWidth: '160px' }}>{pageName(p._id)}</span>
                                            <span className="small fw-bold text-success">{p.count}</span>
                                        </div>
                                        <div className="rounded-pill" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                                            <div className="rounded-pill h-100 bg-success" style={{ width: `${(p.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Exit Pages */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <LogOut size={18} className="text-danger" />
                                <h5 className="fw-bold mb-0">Chiqish nuqtalari</h5>
                            </div>
                            <p className="small text-muted mb-3">Foydalanuvchilar saytdan qaysi sahifadan chiqib ketadi</p>
                            {exitPages.length === 0 ? (
                                <p className="text-muted small text-center py-3">Ma'lumot yo'q</p>
                            ) : exitPages.map((p, i) => {
                                const max = exitPages[0].count;
                                return (
                                    <div key={i} className="mb-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium text-truncate" style={{ maxWidth: '160px' }}>{pageName(p._id)}</span>
                                            <span className="small fw-bold text-danger">{p.count}</span>
                                        </div>
                                        <div className="rounded-pill" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                                            <div className="rounded-pill h-100 bg-danger" style={{ width: `${(p.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Page Engagement Table */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Clock size={18} className="text-primary" />
                                <h5 className="fw-bold mb-0">O'rtacha vaqt</h5>
                            </div>
                            <p className="small text-muted mb-3">Har bir sahifada o'rtacha qancha vaqt o'tiladi</p>
                            {pageStats.slice(0, 8).map((p, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                    <span className="small text-truncate" style={{ maxWidth: '140px' }}>{pageName(p._id)}</span>
                                    <span className={`badge bg-${engagementColor(p.avgTime)} rounded-pill`}>
                                        {fmtTime(p.avgTime)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Page Stats Table */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <Eye size={20} className="text-primary" />
                        <h5 className="fw-bold mb-0">Barcha sahifalar (oxirgi 30 kun)</h5>
                    </div>
                    {pageStats.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Eye size={48} className="mb-2 opacity-30" />
                            <p>Hali ma'lumot yo'q. Foydalanuvchilar saytga kirgach ma'lumotlar to'plana boshlaydi.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-3 py-3">Sahifa</th>
                                        <th className="border-0 py-3 text-center">Ko'rishlar</th>
                                        <th className="border-0 py-3 text-center">Kirish</th>
                                        <th className="border-0 py-3 text-center">Chiqish</th>
                                        <th className="border-0 py-3 text-center">O'rtacha vaqt</th>
                                        <th className="border-0 pe-3 py-3 text-center">Holat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageStats.map((p, i) => {
                                        const exitRate = p.views > 0 ? Math.round((p.exits / p.views) * 100) : 0;
                                        return (
                                            <tr key={i}>
                                                <td className="ps-3 py-3">
                                                    <div>
                                                        <p className="fw-semibold mb-0 small">{pageName(p._id)}</p>
                                                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{p._id}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="badge bg-primary rounded-pill">{p.views}</span>
                                                </td>
                                                <td className="py-3 text-center text-success fw-semibold small">{p.entries}</td>
                                                <td className="py-3 text-center">
                                                    <span className="small text-muted">{p.exits} <span className="text-danger">({exitRate}%)</span></span>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className={`badge bg-${engagementColor(p.avgTime)} rounded-pill`}>
                                                        {fmtTime(p.avgTime)}
                                                    </span>
                                                </td>
                                                <td className="pe-3 py-3 text-center">
                                                    {p.avgTime < 15 && p.views >= 5
                                                        ? <span className="badge bg-danger rounded-pill">Muammo</span>
                                                        : p.avgTime >= 60
                                                            ? <span className="badge bg-success rounded-pill">Yaxshi</span>
                                                            : <span className="badge bg-warning text-dark rounded-pill">O'rtacha</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
