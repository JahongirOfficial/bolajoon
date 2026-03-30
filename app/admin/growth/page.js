'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
    Users, Wifi, Clock, Calendar, TrendingUp, RefreshCw,
    AlertTriangle, CheckCircle, XCircle, Activity
} from 'lucide-react';

const INACTIVE_OPTIONS = [7, 14, 30];

function StatusBadge({ status }) {
    const map = {
        trial: { label: 'Sinov', color: '#f59e0b', bg: '#fef3c7' },
        active: { label: 'Faol', color: '#10b981', bg: '#d1fae5' },
        expired: { label: 'Tugagan', color: '#ef4444', bg: '#fee2e2' },
    };
    const s = map[status] || map.expired;
    return (
        <span className="badge rounded-pill px-2 py-1" style={{ backgroundColor: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700 }}>
            {s.label}
        </span>
    );
}

function timeAgo(date) {
    if (!date) return 'Hech qachon';
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (min < 1) return 'Hozir';
    if (min < 60) return `${min} daq oldin`;
    if (hr < 24) return `${hr} soat oldin`;
    return `${day} kun oldin`;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(date) {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GrowthPage() {
    const { getAuthHeader } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inactiveDays, setInactiveDays] = useState(7);
    const [activeTab, setActiveTab] = useState('online');

    const fetchData = async (days = inactiveDays) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/growth?inactive=${days}`, {
                headers: getAuthHeader()
            });
            const json = await res.json();
            if (json.success) setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleInactiveChange = (days) => {
        setInactiveDays(days);
        fetchData(days);
    };

    const maxHourCount = data ? Math.max(...data.activeHours.map(h => h.count), 1) : 1;
    const maxDau = data ? Math.max(...data.dauData.map(d => d.dau), 1) : 1;

    const tabs = [
        { id: 'online', label: 'Online', icon: Wifi, count: data?.onlineUsers?.length },
        { id: 'inactive', label: 'Faolsiz', icon: AlertTriangle, count: data?.inactiveUsers?.length },
        { id: 'hours', label: 'Faol soatlar', icon: Clock },
        { id: 'expiry', label: 'Tugaydiganlar', icon: Calendar, count: data?.expiryCalendar?.length },
        { id: 'conversion', label: 'Konversiya', icon: TrendingUp },
        { id: 'dau', label: 'DAU', icon: Activity },
    ];

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <AdminSidebar />
            <div className="flex-grow-1 p-4" style={{ marginLeft: '260px', maxWidth: 'calc(100% - 260px)' }}>

                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">O'sish va Faollik</h4>
                        <p className="text-muted small mb-0">Real-time foydalanuvchi statistikasi</p>
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="btn btn-light rounded-3 d-flex align-items-center gap-2"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        <span className="small">Yangilash</span>
                    </button>
                </div>

                {/* Summary cards */}
                {data && (
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm p-3">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <div className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }} />
                                    <span className="small text-muted">Hozir online</span>
                                </div>
                                <h3 className="fw-bold mb-0">{data.onlineUsers.length}</h3>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm p-3">
                                <p className="small text-muted mb-1">Faolsiz ({inactiveDays}+ kun)</p>
                                <h3 className="fw-bold mb-0 text-warning">{data.inactiveUsers.length}</h3>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm p-3">
                                <p className="small text-muted mb-1">Konversiya</p>
                                <h3 className="fw-bold mb-0 text-primary">{data.conversion.conversionRate}%</h3>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm p-3">
                                <p className="small text-muted mb-1">Obuna tugaydi (30 kun)</p>
                                <h3 className="fw-bold mb-0 text-danger">{data.expiryCalendar.length}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="card border-0 rounded-4 shadow-sm">
                    <div className="card-header border-0 bg-white rounded-top-4 px-3 pt-3 pb-0">
                        <div className="d-flex gap-1 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`btn btn-sm rounded-3 d-flex align-items-center gap-1 mb-2 ${activeTab === tab.id ? 'btn-primary' : 'btn-light'}`}
                                    style={{ fontSize: '0.8rem', fontWeight: 600 }}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`badge rounded-pill ms-1 ${activeTab === tab.id ? 'bg-white text-primary' : 'bg-primary text-white'}`} style={{ fontSize: '0.65rem' }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card-body p-3">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                            </div>
                        ) : !data ? (
                            <p className="text-muted text-center py-4">Ma'lumot yuklanmadi</p>
                        ) : (

                            <>
                                {/* ── ONLINE ── */}
                                {activeTab === 'online' && (
                                    <div>
                                        <p className="small text-muted mb-3">So'nggi 15 daqiqada faol foydalanuvchilar</p>
                                        {data.onlineUsers.length === 0 ? (
                                            <p className="text-muted text-center py-4">Hozir hech kim online emas</p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle small mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Ism</th>
                                                            <th>Telefon</th>
                                                            <th>Obuna</th>
                                                            <th>Oxirgi faollik</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.onlineUsers.map(u => (
                                                            <tr key={u._id}>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <div className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#10b981', flexShrink: 0 }} />
                                                                        <span className="fw-semibold">{u.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-muted">{u.phone}</td>
                                                                <td><StatusBadge status={u.subscriptionStatus} /></td>
                                                                <td className="text-muted">{timeAgo(u.lastActivityAt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── INACTIVE ── */}
                                {activeTab === 'inactive' && (
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <span className="small text-muted">Filtr:</span>
                                            {INACTIVE_OPTIONS.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => handleInactiveChange(d)}
                                                    className={`btn btn-sm rounded-pill px-3 ${inactiveDays === d ? 'btn-warning' : 'btn-outline-secondary'}`}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {d}+ kun
                                                </button>
                                            ))}
                                        </div>
                                        {data.inactiveUsers.length === 0 ? (
                                            <p className="text-muted text-center py-4">Faolsiz foydalanuvchi yo'q</p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle small mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Ism</th>
                                                            <th>Telefon</th>
                                                            <th>Obuna</th>
                                                            <th>Oxirgi kirish</th>
                                                            <th>Oxirgi faollik</th>
                                                            <th>Ro'yxat sanasi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.inactiveUsers.map(u => (
                                                            <tr key={u._id}>
                                                                <td className="fw-semibold">{u.name}</td>
                                                                <td className="text-muted">{u.phone}</td>
                                                                <td><StatusBadge status={u.subscriptionStatus} /></td>
                                                                <td className="text-muted">{timeAgo(u.lastLogin)}</td>
                                                                <td className="text-muted">{timeAgo(u.lastActivityAt)}</td>
                                                                <td className="text-muted">{formatDate(u.createdAt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── ACTIVE HOURS ── */}
                                {activeTab === 'hours' && (
                                    <div>
                                        <p className="small text-muted mb-3">So'nggi 30 kun — soatlar kesimida sahifa ko'rishlar</p>
                                        <div className="d-flex align-items-end gap-1" style={{ height: 160 }}>
                                            {data.activeHours.map(h => (
                                                <div key={h.hour} className="flex-fill d-flex flex-column align-items-center gap-1" title={`${h.label}: ${h.count} ta`}>
                                                    <div
                                                        className="rounded-top-2 w-100"
                                                        style={{
                                                            height: `${Math.round((h.count / maxHourCount) * 120)}px`,
                                                            minHeight: h.count > 0 ? 4 : 0,
                                                            backgroundColor: h.count / maxHourCount > 0.6 ? '#2b8cee' : h.count / maxHourCount > 0.3 ? '#93c5fd' : '#dbeafe',
                                                            transition: 'height 0.3s'
                                                        }}
                                                    />
                                                    {h.hour % 3 === 0 && (
                                                        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{h.hour}:00</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="d-flex gap-3 mt-3 flex-wrap">
                                            {[...data.activeHours].sort((a, b) => b.count - a.count).slice(0, 3).map((h, i) => (
                                                <div key={h.hour} className="d-flex align-items-center gap-2 bg-light rounded-3 px-3 py-2">
                                                    <span className="fw-bold" style={{ color: '#2b8cee' }}>#{i + 1}</span>
                                                    <span className="small fw-semibold">{h.label}</span>
                                                    <span className="small text-muted">{h.count} ta</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── EXPIRY CALENDAR ── */}
                                {activeTab === 'expiry' && (
                                    <div>
                                        <p className="small text-muted mb-3">Keyingi 30 kunda obunasi tugaydigan foydalanuvchilar</p>
                                        {data.expiryCalendar.length === 0 ? (
                                            <p className="text-muted text-center py-4">Keyingi 30 kunda tugaydigan obuna yo'q</p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle small mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Ism</th>
                                                            <th>Telefon</th>
                                                            <th>Obuna turi</th>
                                                            <th>Tugash sanasi</th>
                                                            <th>Qolgan kun</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.expiryCalendar.map(u => {
                                                            const days = daysUntil(u.subscriptionEndDate);
                                                            return (
                                                                <tr key={u._id}>
                                                                    <td className="fw-semibold">{u.name}</td>
                                                                    <td className="text-muted">{u.phone}</td>
                                                                    <td><StatusBadge status={u.subscriptionStatus} /></td>
                                                                    <td>{formatDate(u.subscriptionEndDate)}</td>
                                                                    <td>
                                                                        <span className={`badge rounded-pill px-2 ${days <= 3 ? 'bg-danger' : days <= 7 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                                            {days} kun
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── CONVERSION ── */}
                                {activeTab === 'conversion' && (
                                    <div>
                                        <p className="small text-muted mb-4">Trial → To'lovli foydalanuvchi konversiyasi</p>
                                        <div className="row g-3 mb-4">
                                            {[
                                                { label: 'Sinov (trial)', count: data.conversion.trialCount, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                                                { label: 'Faol (to\'lagan)', count: data.conversion.activeCount, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
                                                { label: 'Tugagan', count: data.conversion.expiredCount, icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
                                            ].map(item => (
                                                <div key={item.label} className="col-4">
                                                    <div className="card border-0 rounded-4 p-3 text-center" style={{ backgroundColor: item.bg }}>
                                                        <item.icon size={24} style={{ color: item.color, margin: '0 auto 8px' }} />
                                                        <h3 className="fw-bold mb-1" style={{ color: item.color }}>{item.count}</h3>
                                                        <p className="small mb-0" style={{ color: item.color, opacity: 0.8 }}>{item.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-light rounded-4 p-4 text-center">
                                            <p className="text-muted small mb-2">Konversiya darajasi (trial/expired → active)</p>
                                            <h1 className="fw-bold text-primary mb-1">{data.conversion.conversionRate}%</h1>
                                            <div className="progress rounded-pill mt-3" style={{ height: 12 }}>
                                                <div
                                                    className="progress-bar bg-primary rounded-pill"
                                                    style={{ width: `${data.conversion.conversionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── DAU ── */}
                                {activeTab === 'dau' && (
                                    <div>
                                        <p className="small text-muted mb-3">So'nggi 30 kun — kunlik faol foydalanuvchilar (DAU)</p>
                                        {data.dauData.length === 0 ? (
                                            <p className="text-muted text-center py-4">Ma'lumot yo'q</p>
                                        ) : (
                                            <div className="d-flex align-items-end gap-1" style={{ height: 160 }}>
                                                {data.dauData.map(d => (
                                                    <div key={d.date} className="flex-fill d-flex flex-column align-items-center gap-1" title={`${d.date}: ${d.dau} ta`}>
                                                        <div
                                                            className="rounded-top-2 w-100"
                                                            style={{
                                                                height: `${Math.round((d.dau / maxDau) * 120)}px`,
                                                                minHeight: 4,
                                                                backgroundColor: '#2b8cee',
                                                                opacity: 0.7 + (d.dau / maxDau) * 0.3
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="d-flex gap-3 mt-3 flex-wrap">
                                            {data.dauData.length > 0 && (
                                                <>
                                                    <div className="bg-light rounded-3 px-3 py-2">
                                                        <span className="small text-muted">O'rtacha DAU: </span>
                                                        <span className="small fw-bold">
                                                            {Math.round(data.dauData.reduce((s, d) => s + d.dau, 0) / data.dauData.length)}
                                                        </span>
                                                    </div>
                                                    <div className="bg-light rounded-3 px-3 py-2">
                                                        <span className="small text-muted">Eng yuqori: </span>
                                                        <span className="small fw-bold">{Math.max(...data.dauData.map(d => d.dau))}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
