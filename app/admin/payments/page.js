'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, TrendingUp, Users, Clock, CheckCircle, XCircle, Search, Filter, UserPlus } from 'lucide-react';

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
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkDays, setBulkDays] = useState(30);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAll = () => {
        if (selectedUsers.length === filtered.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filtered.map(u => u._id));
        }
    };

    const selectByStatus = (status) => {
        const statusUsers = filtered.filter(u => u.subscriptionStatus === status);
        setSelectedUsers(statusUsers.map(u => u._id));
    };

    const handleBulkActivate = async () => {
        if (selectedUsers.length === 0) return;
        
        const confirmed = confirm(
            `${selectedUsers.length} ta foydalanuvchiga ${bulkDays} kun obuna beriladi.\n\nDavom etasizmi?`
        );
        
        if (!confirmed) return;

        setActivatingId('bulk');
        let successCount = 0;
        let failCount = 0;

        for (const userId of selectedUsers) {
            try {
                const res = await fetch('/api/subscription/activate', {
                    method: 'POST',
                    headers: getAuthHeader(),
                    body: JSON.stringify({ userId, days: bulkDays })
                });
                const data = await res.json();
                if (data.success) {
                    successCount++;
                    setUsers(prev => prev.map(u =>
                        u._id === userId
                            ? { ...u, subscriptionStatus: 'active', subscriptionEndDate: data.subscriptionEndDate }
                            : u
                    ));
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error(err);
                failCount++;
            }
        }

        alert(`✅ ${successCount} ta muvaffaqiyatli\n❌ ${failCount} ta xatolik`);
        setShowBulkModal(false);
        setSelectedUsers([]);
        setActivatingId(null);
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
                {selectedUsers.length > 0 && (
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                    >
                        <UserPlus size={18} />
                        {selectedUsers.length} ta foydalanuvchiga obuna berish
                    </button>
                )}
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
                    <div className="row g-2 mb-3">
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
                    
                    {/* Tezkor tanlash */}
                    <div className="d-flex gap-2 flex-wrap">
                        <small className="text-muted my-auto me-2">Tezkor tanlash:</small>
                        <button
                            onClick={selectAll}
                            className="btn btn-sm btn-outline-primary rounded-pill"
                        >
                            {selectedUsers.length === filtered.length && filtered.length > 0 ? 'Bekor qilish' : 'Barchasini tanlash'}
                        </button>
                        <button
                            onClick={() => selectByStatus('trial')}
                            className="btn btn-sm btn-outline-info rounded-pill"
                        >
                            Faqat Trial ({users.filter(u => u.subscriptionStatus === 'trial' && u.role !== 'admin').length})
                        </button>
                        <button
                            onClick={() => selectByStatus('active')}
                            className="btn btn-sm btn-outline-success rounded-pill"
                        >
                            Faqat Faol ({users.filter(u => u.subscriptionStatus === 'active' && u.role !== 'admin').length})
                        </button>
                        <button
                            onClick={() => selectByStatus('expired')}
                            className="btn btn-sm btn-outline-danger rounded-pill"
                        >
                            Faqat Tugagan ({users.filter(u => u.subscriptionStatus === 'expired' && u.role !== 'admin').length})
                        </button>
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
                                        <th className="border-0 ps-4 py-3" style={{ width: '50px' }}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                style={{ width: '20px', height: '20px' }}
                                                checked={selectedUsers.length === filtered.length && filtered.length > 0}
                                                onChange={selectAll}
                                            />
                                        </th>
                                        <th className="border-0 py-3">Foydalanuvchi</th>
                                        <th className="border-0 py-3">Telefon</th>
                                        <th className="border-0 py-3">Obuna holati</th>
                                        <th className="border-0 py-3">Tugash sanasi</th>
                                        <th className="border-0 pe-4 py-3 text-end">Amal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => (
                                        <tr 
                                            key={u._id}
                                            className={selectedUsers.includes(u._id) ? 'table-active' : ''}
                                        >
                                            <td className="ps-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    style={{ width: '20px', height: '20px' }}
                                                    checked={selectedUsers.includes(u._id)}
                                                    onChange={() => toggleUser(u._id)}
                                                />
                                            </td>
                                            <td className="py-3">
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

            {/* Bulk Activate Modal */}
            {showBulkModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Guruh bo'yicha obuna berish</h5>
                                <button type="button" className="btn-close" onClick={() => setShowBulkModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info rounded-3 mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <Users size={20} />
                                        <div>
                                            <strong>{selectedUsers.length} ta foydalanuvchi</strong> tanlandi
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Tanlangan foydalanuvchilar ro'yxati */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold mb-2">Tanlangan foydalanuvchilar:</label>
                                    <div 
                                        className="border rounded-3 p-3 bg-light" 
                                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                                    >
                                        <div className="d-flex flex-column gap-2">
                                            {users
                                                .filter(u => selectedUsers.includes(u._id))
                                                .map(u => (
                                                    <div 
                                                        key={u._id} 
                                                        className="d-flex align-items-center justify-content-between p-2 bg-white rounded-2 border"
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="rounded-circle flex-shrink-0"
                                                                style={{
                                                                    width: 32, 
                                                                    height: 32,
                                                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2b8cee&color=fff&size=32')`,
                                                                    backgroundSize: 'cover'
                                                                }}
                                                            />
                                                            <div>
                                                                <div className="fw-semibold small">{u.name}</div>
                                                                <div className="text-muted" style={{ fontSize: '11px' }}>{u.phone}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {u.subscriptionStatus === 'active' && (
                                                                <span className="badge bg-success rounded-pill small">
                                                                    {u.subscriptionEndDate
                                                                        ? Math.max(0, Math.ceil((new Date(u.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
                                                                        : 0} kun
                                                                </span>
                                                            )}
                                                            {u.subscriptionStatus === 'trial' && (
                                                                <span className="badge bg-info rounded-pill small">Trial</span>
                                                            )}
                                                            {u.subscriptionStatus === 'expired' && (
                                                                <span className="badge bg-danger rounded-pill small">Tugagan</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* To'lov ma'lumotlari */}
                                {settings && (settings.cardNumber || settings.cardHolder) && (
                                    <div className="alert alert-info rounded-3 mb-3">
                                        <div className="d-flex align-items-start gap-2">
                                            <CreditCard size={20} className="flex-shrink-0 mt-1" />
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold mb-1">To'lov ma'lumotlari</div>
                                                {settings.cardNumber && (
                                                    <div className="small mb-1">
                                                        <span className="text-muted">Karta:</span>{' '}
                                                        <span className="fw-mono">{settings.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>
                                                    </div>
                                                )}
                                                {settings.cardHolder && (
                                                    <div className="small">
                                                        <span className="text-muted">Egasi:</span>{' '}
                                                        <span className="fw-semibold">{settings.cardHolder}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Jami hisob-kitob */}
                                {settings?.dailyPrice && (
                                    <div className="card border-0 bg-success bg-opacity-10 rounded-3 mb-3">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Foydalanuvchilar:</span>
                                                <span className="fw-bold">{selectedUsers.length} ta</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Kun soni:</span>
                                                <span className="fw-bold">{bulkDays} kun</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Kunlik narx:</span>
                                                <span className="fw-semibold">{settings.dailyPrice.toLocaleString()} so'm</span>
                                            </div>
                                            <div className="border-top pt-2 mt-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">Jami summa:</span>
                                                    <span className="fw-bold text-success fs-5">
                                                        {(selectedUsers.length * bulkDays * settings.dailyPrice).toLocaleString()} so'm
                                                    </span>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <small className="text-muted">
                                                        ({selectedUsers.length} × {bulkDays} × {settings.dailyPrice.toLocaleString()})
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <p className="text-muted mb-3">
                                    Barcha tanlangan foydalanuvchilarga bir xil muddatda obuna beriladi:
                                </p>
                                
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Kun soni</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control form-control-lg border-0 bg-light text-center fw-bold"
                                            value={bulkDays}
                                            onChange={e => setBulkDays(Math.max(1, parseInt(e.target.value) || 1))}
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
                                            onClick={() => setBulkDays(d)}
                                            className={`btn btn-sm rounded-pill px-3 ${bulkDays === d ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        >
                                            {d === 365 ? '1 yil' : `${d} kun`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-light rounded-3" onClick={() => setShowBulkModal(false)}>
                                    Bekor qilish
                                </button>
                                <button
                                    className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                                    onClick={handleBulkActivate}
                                    disabled={activatingId === 'bulk'}
                                >
                                    {activatingId === 'bulk' ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" />
                                            Yuklanmoqda...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            {selectedUsers.length} ta foydalanuvchiga {bulkDays} kun berish
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                {/* Foydalanuvchi kartasi */}
                                <div className="card border-0 bg-light rounded-3 mb-4">
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <div
                                                className="rounded-circle flex-shrink-0"
                                                style={{
                                                    width: 56, 
                                                    height: 56,
                                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.name || '')}&background=2b8cee&color=fff&size=56')`,
                                                    backgroundSize: 'cover'
                                                }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">{selectedUser?.name}</h6>
                                                <p className="text-muted small mb-0">{selectedUser?.phone}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="row g-2 mb-3">
                                            <div className="col-4">
                                                <div className="bg-white rounded-2 p-2 text-center">
                                                    <div className="small text-muted mb-1">Holat</div>
                                                    <div className="fw-semibold">
                                                        {selectedUser?.subscriptionStatus === 'active' && (
                                                            <span className="badge bg-success">Faol</span>
                                                        )}
                                                        {selectedUser?.subscriptionStatus === 'trial' && (
                                                            <span className="badge bg-info">Trial</span>
                                                        )}
                                                        {selectedUser?.subscriptionStatus === 'expired' && (
                                                            <span className="badge bg-danger">Tugagan</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="bg-white rounded-2 p-2 text-center">
                                                    <div className="small text-muted mb-1">Qolgan</div>
                                                    <div className="fw-bold text-primary">
                                                        {selectedUser?.subscriptionStatus === 'active' && selectedUser?.subscriptionEndDate
                                                            ? Math.max(0, Math.ceil((new Date(selectedUser.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
                                                            : 0} kun
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="bg-white rounded-2 p-2 text-center">
                                                    <div className="small text-muted mb-1">Oxirgi to'lov</div>
                                                    <div className="fw-semibold small">
                                                        {selectedUser?.lastPaymentDate
                                                            ? new Date(selectedUser.lastPaymentDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
                                                            : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {selectedUser?.subscriptionEndDate && selectedUser?.subscriptionStatus === 'active' && (
                                            <div className="text-center">
                                                <small className="text-muted">
                                                    Tugash: {new Date(selectedUser.subscriptionEndDate).toLocaleDateString('uz-UZ', { 
                                                        day: 'numeric', 
                                                        month: 'long', 
                                                        year: 'numeric' 
                                                    })}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* To'lov ma'lumotlari */}
                                {settings && (settings.cardNumber || settings.cardHolder) && (
                                    <div className="alert alert-info rounded-3 mb-3">
                                        <div className="d-flex align-items-start gap-2">
                                            <CreditCard size={20} className="flex-shrink-0 mt-1" />
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold mb-1">To'lov ma'lumotlari</div>
                                                {settings.cardNumber && (
                                                    <div className="small mb-1">
                                                        <span className="text-muted">Karta:</span>{' '}
                                                        <span className="fw-mono">{settings.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>
                                                    </div>
                                                )}
                                                {settings.cardHolder && (
                                                    <div className="small">
                                                        <span className="text-muted">Egasi:</span>{' '}
                                                        <span className="fw-semibold">{settings.cardHolder}</span>
                                                    </div>
                                                )}
                                                {settings.dailyPrice && (
                                                    <div className="small mt-1 pt-1 border-top">
                                                        <span className="text-muted">Kunlik narx:</span>{' '}
                                                        <span className="fw-bold text-primary">{settings.dailyPrice.toLocaleString()} so'm</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Hisob-kitob */}
                                {settings?.dailyPrice && (
                                    <div className="card border-0 bg-success bg-opacity-10 rounded-3 mb-3">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Kun soni:</span>
                                                <span className="fw-bold">{selectedDays} kun</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Kunlik narx:</span>
                                                <span className="fw-semibold">{settings.dailyPrice.toLocaleString()} so'm</span>
                                            </div>
                                            <div className="border-top pt-2 mt-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">Jami summa:</span>
                                                    <span className="fw-bold text-success fs-5">
                                                        {(selectedDays * settings.dailyPrice).toLocaleString()} so'm
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <p className="text-muted mb-3">
                                    Obuna muddatini tanlang:
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
                                    {selectedUser?.subscriptionStatus === 'active' && selectedUser?.subscriptionEndDate && (
                                        <div className="mt-2 p-2 bg-info bg-opacity-10 rounded-2">
                                            <small className="text-info d-flex align-items-center gap-1">
                                                <Clock size={14} />
                                                Yangi tugash sanasi: {new Date(
                                                    new Date(selectedUser.subscriptionEndDate).getTime() + selectedDays * 24 * 60 * 60 * 1000
                                                ).toLocaleDateString('uz-UZ', { 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric' 
                                                })}
                                            </small>
                                        </div>
                                    )}
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
