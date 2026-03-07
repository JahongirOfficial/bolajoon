'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, TrendingUp, Users, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

export default function PaymentsPage() {
    const { getAuthHeader } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activatingId, setActivatingId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDays, setSelectedDays] = useState(30);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!selectedUser) return;
        setActivatingId(selectedUser._id);
        try {
            const res = await fetch('/api/subscription/activate', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ userId: selectedUser._id, days: selectedDays })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u =>
                    u._id === selectedUser._id
                        ? { ...u, subscriptionStatus: 'active', subscriptionEndDate: data.subscriptionEndDate }
                        : u
                ));
                setShowModal(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActivatingId(null);
        }
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setSelectedDays(30);
        setShowModal(true);
    };

    const now = new Date();
    const activeCount = users.filter(u => u.subscriptionStatus === 'active').length;
    const trialCount = users.filter(u => u.subscriptionStatus === 'trial').length;
    const expiredCount = users.filter(u => u.subscriptionStatus === 'expired').length;
    const expiringSoon = users.filter(u => {
        if (u.subscriptionStatus !== 'active' || !u.subscriptionEndDate) return false;
        const diff = (new Date(u.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 7;
    }).length;

    const filtered = users.filter(u => {
        if (u.role === 'admin') return false;
        const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
            (u.phone || '').includes(search);
        const matchStatus = filterStatus === 'all' || u.subscriptionStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusBadge = (u) => {
        if (u.subscriptionStatus === 'active') {
            const days = u.subscriptionEndDate
                ? Math.max(0, Math.ceil((new Date(u.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24)))
                : 0;
            return <span className="badge bg-success rounded-pill">{days} kun qoldi</span>;
        }
        if (u.subscriptionStatus === 'trial') {
            return <span className="badge bg-info rounded-pill">Sinov</span>;
        }
        return <span className="badge bg-danger rounded-pill">Tugagan</span>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">To'lovlar</h1>
                    <p className="text-muted mb-0">Obuna boshqaruvi</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Faol obuna', value: activeCount, color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
                    { label: 'Sinov (trial)', value: trialCount, color: '#2b8cee', bg: '#dbeafe', icon: Clock },
                    { label: 'Tugagan', value: expiredCount, color: '#dc2626', bg: '#fee2e2', icon: XCircle },
                    { label: '7 kunda tugaydi', value: expiringSoon, color: '#d97706', bg: '#fef3c7', icon: TrendingUp },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="col-6 col-lg-3">
                            <div className="card border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: card.bg }}>
                                <div className="card-body p-3 d-flex align-items-center gap-3">
                                    <div className="rounded-3 p-2 bg-white">
                                        <Icon size={22} style={{ color: card.color }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-4" style={{ color: card.color }}>
                                            {loading ? <span className="spinner-border spinner-border-sm" /> : card.value}
                                        </div>
                                        <div className="small fw-medium" style={{ color: card.color, opacity: 0.8 }}>{card.label}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <div className="position-relative">
                                <Search size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '12px' }} />
                                <input
                                    type="text"
                                    className="form-control rounded-3 border-0 bg-light"
                                    placeholder="Ism yoki telefon..."
                                    style={{ paddingLeft: '36px' }}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex gap-2">
                                <Filter size={16} className="my-auto text-muted flex-shrink-0" />
                                {['all', 'active', 'trial', 'expired'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`btn btn-sm rounded-pill px-3 ${filterStatus === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    >
                                        {s === 'all' ? 'Barchasi' : s === 'active' ? 'Faol' : s === 'trial' ? 'Sinov' : 'Tugagan'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Users size={48} className="mb-2 opacity-50" />
                            <p>Foydalanuvchi topilmadi</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4 py-3">Foydalanuvchi</th>
                                        <th className="border-0 py-3">Telefon</th>
                                        <th className="border-0 py-3">Obuna holati</th>
                                        <th className="border-0 py-3">Tugash sanasi</th>
                                        <th className="border-0 pe-4 py-3 text-end">Amal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => (
                                        <tr key={u._id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle flex-shrink-0"
                                                        style={{
                                                            width: 36, height: 36,
                                                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2b8cee&color=fff&size=36')`,
                                                            backgroundSize: 'cover'
                                                        }}
                                                    />
                                                    <span className="fw-semibold">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted">{u.phone}</td>
                                            <td className="py-3">{getStatusBadge(u)}</td>
                                            <td className="py-3 small text-muted">
                                                {u.subscriptionEndDate
                                                    ? new Date(u.subscriptionEndDate).toLocaleDateString('uz-UZ')
                                                    : '—'}
                                            </td>
                                            <td className="pe-4 py-3 text-end">
                                                <button
                                                    onClick={() => openModal(u)}
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1"
                                                >
                                                    <CreditCard size={15} />
                                                    Obuna berish
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Activate Subscription Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Obuna berish</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">
                                    <strong>{selectedUser?.name}</strong> uchun obuna muddatini tanlang:
                                </p>
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Kun soni</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control form-control-lg border-0 bg-light text-center fw-bold"
                                            value={selectedDays}
                                            onChange={e => setSelectedDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            min={1}
                                            style={{ fontSize: '24px' }}
                                        />
                                        <span className="input-group-text bg-light border-0 fw-semibold">kun</span>
                                    </div>
                                </div>
                                <p className="small text-muted mb-2">Tezkor tanlash:</p>
                                <div className="d-flex flex-wrap gap-2">
                                    {[1, 3, 7, 15, 30, 60, 90, 180, 365].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setSelectedDays(d)}
                                            className={`btn btn-sm rounded-pill px-3 ${selectedDays === d ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        >
                                            {d === 365 ? '1 yil' : `${d} kun`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>
                                    Bekor qilish
                                </button>
                                <button
                                    className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                                    onClick={handleActivate}
                                    disabled={!!activatingId}
                                >
                                    {activatingId ? <span className="spinner-border spinner-border-sm" /> : <CheckCircle size={16} />}
                                    {selectedDays} kun faollashtirish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
